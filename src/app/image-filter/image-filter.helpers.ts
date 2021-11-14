import { Cell, CellState, ColorGL, ColorHSL } from "./image-filter.models";
import * as chroma from 'chroma.ts';
import { Observable } from "rxjs";
import { Point } from "../shared/models";


export function loadImage(imagePath: string): Observable<HTMLImageElement>{
    return new Observable((observer) => {
      const img: HTMLImageElement = new Image();
      img.src = imagePath;
      img.onload = () => {
        observer.next(img);
        observer.complete();
      }
      img.onerror = (err) => observer.error(err)
    });
}


export function generateImageCells(
    image: HTMLImageElement, 
    context: CanvasRenderingContext2D,
    cellWidth: number,
    cellHeight: number,
  ): Cell[][] {
    const columns = image.width / cellWidth;
    const rows = image.height / cellHeight
    const grid: Cell[][] = []
    let index = 0;
    for (let y = 0; y < rows; y++) {
        const cellRow = [];
        for (let x = 0; x < columns; x++) {
            const rgba: Uint8ClampedArray = context.getImageData(
                x * cellWidth, 
                y * cellHeight, 
                cellWidth, 
                cellHeight
            ).data
            const len = rgba.length
            const num = len / 4
            let r = 0
            let g = 0
            let b = 0
            for (let i = 0; i < len; i += 4) {
            r += rgba[i]
            g += rgba[i + 1]
            b += rgba[i + 2]
            }
            const rgb = 'rgb(' + [
            Math.round(r / num),
            Math.round(g / num),
            Math.round(b / num)
            ].join(',') + ')';

            const col = x * cellWidth;
            const row = y * cellHeight;
            const hex = rgbToHex(rgb);
            
            const gl: ColorGL = hexToGL(hex);
            const hsl: ColorHSL = hexToHSL(hex);
            const cell: Cell = {
                index,
                rgb, 
                hex, 
                col: x, 
                row: y,
                origin: { 
                    x: x * cellWidth, 
                    y: y * cellHeight,
                },
                lum: chroma.color(hex).luminance(),
                gl_red:gl.red,
                gl_green: gl.green,
                gl_blue: gl.blue,
                hsl_hue: hsl.hue,
                hsl_saturation: hsl.saturation,
                hsl_lightness: hsl.lightness,

                state: CellState.Open,
            }
            cellRow.push(cell);
            index++;
        }
        grid.push(cellRow);
    }
    return grid
}

export function rgbToHex(rgb: string): string{
    const a = rgb.split("(")[1].split(")")[0];
    var b = a.split(",").map((x) => {       
        x = parseInt(x).toString(16);      
        return (x.length === 1) ? "0" + x : x;  //Add zero if we get only one character
    })
    return "#"+ b.join("");
}

export function hexToGL(hex: string): ColorGL{
    const ngl: number[] = chroma.color(hex).gl();
    return {
      red: ngl[0],
      green: ngl[1],
      blue: ngl[2],
    }
}

export function hexToHSL(hex): ColorHSL {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
      if(max == min){
        h = s = 0; // achromatic
      }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
    return {
        hue: h,
        saturation: s,
        lightness: l,
    };
  }


export function SmoothLine(
    line: Point[], 
    total_iters: number, 
    current_iter: number, 
    dist_ratio: number,
): Point[] {
    if(total_iters == current_iter)
      return line;
    else{
      let sm_line = []
      for (let i = 0; i < line.length - 1; i++) {
        sm_line.push({
          x: line[i].x + dist_ratio * (line[i + 1].x - line[i].x),
          y: line[i].y + dist_ratio * (line[i + 1].y - line[i].y)
        })
        sm_line.push({
          x: line[i].x + (1 - dist_ratio) * (line[i + 1].x - line[i].x),
          y: line[i].y + (1 - dist_ratio) * (line[i + 1].y - line[i].y)
        })
      }
      return SmoothLine(sm_line, total_iters, current_iter + 1, dist_ratio)
    }
}
  
