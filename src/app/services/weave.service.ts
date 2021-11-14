import { Injectable } from '@angular/core';
import * as chroma from 'chroma.ts';
import { Cell, Weave, WeaveGroup } from '../image-filter/image-filter.models';
import { Point } from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class WeaveService {

  constructor() { }


  public generateWeave(weave: Weave, flatGrid: Cell[]): WeaveGroup[]{

    const opacities = [1];

    const colors = this.createColors(weave.palette, weave.colorCount);
    const groups: WeaveGroup[] = [];
    const weaveWidthStep = (weave.startWidth) / weave.length;
    let gridIndex: number = 0;
    let weaveWidth = weave.startWidth;
    while(gridIndex < weave.length){
      const length = (weave.length - gridIndex) * weave.groupLengthScaler;
      const points: Point[] = [];
      for(let i = 0; i < (length + 1); i++){
        const cell: Cell = flatGrid[i];
        try{
          points.push({
            x: cell.origin.x + cell.width / 2,
            y: cell.origin.y + cell.height / 2,
          });
        }catch{}
      }
      const weaveGroup: WeaveGroup = {
        color: colors[gridIndex % colors.length],
        width: weaveWidth,
        length,
        points,
        opacity:weave.opacity
      }

      gridIndex++;
      weaveWidth -= weaveWidthStep;
      groups.push(weaveGroup);
    }

    return groups;
  }


  private createColors(palette: string | string[], count: number){
    const cm = chroma.scale(palette as chroma.Chromable);
    let colors = [];
    for(let i = 0; i < count; i++){
      colors.push(cm(i/(count - 1)).hex())
    }
    return colors;
  }

}
