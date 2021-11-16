import { Injectable } from '@angular/core';
import { ColorPalette } from '../shared/models';
import * as chroma from 'chroma.ts';
import * as tome from 'chromotome';

@Injectable({providedIn: 'root'})
export class ColorService {
    constructor() { }
    

    public generatePalettes(): ColorPalette[]{
        const tomePalettes:ColorPalette[] = tome.getAll().map((pal) => {
          return {
            name: pal.name,
            colors: pal.colors,
          }
        });
        const brewerPalettes: ColorPalette[] = Object.entries(chroma.brewer)
          .map(([name,colors]:[string,number[]]) => ({
            name,
            colors: colors.map(d => '#' + d.toString(16))
          }));
    
        return tomePalettes.concat(brewerPalettes);
    }


  public createColorList(paletteName: string, count: number): string[]{
    const palettes = this.generatePalettes()
    let cm;
    if(paletteName === 'random'){
      const {colors,name} = palettes[Math.floor(Math.random() * palettes.length)];
      console.log('rand palette ->',name)
      cm = chroma.scale(colors);
    }else{
      const {colors} = palettes.find(({name}) => name === paletteName)
      cm = chroma.scale(colors);
    }
    const colors = [];
    for(let i = 0; i < count; i++){
      colors.push(cm(i / (count - 1)).hex())
    }
    return colors;
  }

}