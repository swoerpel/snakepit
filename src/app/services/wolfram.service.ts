import { Injectable } from '@angular/core';
import { Dims, Point, Rect } from '../shared/models';
import { KernelParams } from '../shared/models/wolfram.models';
import { round } from '../state/helpers';

@Injectable({
  providedIn: 'root'
})
export class WolframService {

  constructor() { }

  // ELEMENTARY ====================================================
  public assignElementaryWolframValues(grid: Rect[][], dims: Dims, rule: number = 30): void {
    const params: KernelParams = {
      states: 2,
      rule,
      pattern: [[1,1,1]]
    }

    const kernelLength: number = params.pattern
      .reduce((acc, val) => acc.concat(val), [])
      .reduce((sum,value) => sum + value, 0);

    const kernelDims: Dims = {
      width: params.pattern[0].length,
      height: params.pattern.length
    }

    const ruleDict = this.generateElementaryRuleDict(params,kernelLength)
    // const startRow: number[] = this.generateStartRow(dims.width);
    // const indexDict: Record<number,number[]> = this.generateCellIndexes(dims.width, params.pattern, kernelDims, kernelLength);
    // grid.push([...grid[grid.length - 1]]);
    // grid.forEach((row: Rect[],i) => {
    //   let checkRow = (i === 0) ? startRow : grid[i - 1].map(c => c.value);
    //   row.forEach((rect: Rect,j) => {
    //     const key = indexDict[j].map(index => checkRow[index]).join('').padStart(3,'0');
    //     rect.value = ruleDict[key];
    //   })  
    // })
  }  
  
  // TOTALISTIC ====================================================
  public assignTotalisticWolframValues(grid: Rect[][], dims: Dims, params: KernelParams): void {

    const kernelLength: number = params.pattern
      .reduce((acc, val) => acc.concat(val), [])
      .reduce((sum,value) => sum + value, 0);

    const kernelDims: Dims = {
      width: params.pattern[0].length,
      height: params.pattern.length
    }

    const ruleDict = this.generateTotalisticRuleDict(params,kernelLength);
    console.log(Object.values(ruleDict).join(''))
    
    // needs to be updated to include x and y values, currently just number[] for x on y - 1 row
    const offsetPointDict: Record<number,Point[]> = this.generateCellIndexes(dims.width, params.pattern,kernelDims);
    // console.log('ruleDict',ruleDict);
    // console.log('offsetPointDict',offsetPointDict);

    // need to update to push multiple
    // prevents overrun at the end
    const startValueRows: number[][] = [];
    const endValueRows: number[][] = [];
    for(let i = 0; i < kernelDims.height; i++){
      const startRow = this.generateStartRow(dims.width, params.states, i);
      startValueRows.push(startRow);
      endValueRows.push(new Array(dims.width).fill(0));
    }

    // console.log('startValueRows',startValueRows);
    // console.log('endValueRows',endValueRows);
    grid.forEach((row: Rect[],i) => {
      row.forEach((rect: Rect,j) => {
        const offsetPoints: Point[] = offsetPointDict[j];
        const avg = round(offsetPoints.reduce((sum,p) => {
          const x = p.x;
          const y = i + p.y;
          if(y < 0){
            return startValueRows[Math.abs(y) - 1][x] + sum;
          }
          return grid[y][x].value + sum
        },0) / kernelLength)
        // console.log("avg",avg)
        
        // const key = round(indexDict[j].map(index => checkRow[index])
        //   .reduce((sum,val)=>sum + val,0) / kernelLength);
        rect.value = ruleDict[avg];
      })  
    })
  }  
  
  public assignTotalisticSeedLengthValues(grid: Rect[][], base: number){
    grid.forEach((row: Rect[],i) => {
      row.forEach((rect: Rect,j) => {
        let b = i + 3;
        let k = j + 3;
        // rect.value = (k * (b - 1) + 1) % base
        rect.value = (k * (b - 1) + 1) % base
      })
    });
    // let grid = []
    // let w = 8;
    // let h = 8;
    // for(let i = 0; i < h; i++){
    //   let row = []
    //   for(let j = 0; j < w; j++){
        
      // }
      // grid.push(row)
    // }
  }


  private generateCellIndexes(
    gridWidth: number, 
    pattern: number[][],
    kernelDims: Dims, 
  ): Record<number,Point[]>{
    const xOffset = -Math.floor(kernelDims.width / 2);
    const indexDict: Record<number,Point[]> = {};
    for(let i = 0; i < gridWidth; i++){
      let kernelOffsets: Point[] = [];
      for(let j = 0; j < kernelDims.height; j++){
        for(let k = 0; k < kernelDims.width; k++){
          if(pattern[j][k] === 1){
            kernelOffsets.push({
              x: i + k + xOffset,
              y: -j - 1,
            })
          }
          
        }
      }
      kernelOffsets = kernelOffsets.map((p: Point) => ({
        x: (p.x < 0) ? gridWidth + p.x : p.x % gridWidth,
        y: p.y,
      }))
      indexDict[i] = kernelOffsets;
    }
    return indexDict;

    // existing
    // const centerOffset = -Math.floor(kernelLength / 2);
    // const indexDict: Record<number,number[]> = {};
    // for(let i = 0; i < gridWidth; i++){
    //   let cellIndexes = [];
    //   for(let j = 0; j < kernelLength; j++){
    //     cellIndexes.push(i + j + centerOffset)
    //   }
    //   cellIndexes = cellIndexes.map((index: number) => 
    //     (index < 0) ? gridWidth + index : index % gridWidth
    //   )
    //   indexDict[i] = cellIndexes;
    // }
    // return indexDict;
  }

  private generateStartRow(width: number, states: number = 2, index: number): number[]{
    const startRow: number[] = [];
    // const groupSize = 6;
    
    
    // console.log('randGroupValues',randGroupValues)
    const groupWidth = 12;
    const groupCount = Math.floor(width / groupWidth);
    const randGroupValues = new Array(groupCount).fill(0).map((_,i) => 
      Math.floor(Math.floor((i / states) * 100)/100))
    for(let i = 0; i < width; i++){
      const dec = i / groupCount;
      // startRow.push(Math.floor(Math.random() * states))
      // startRow.push((i + offset) % 3)
      // startRow.push(Math.floor(Math.random() * states))
      // startRow.push(randGroupValues[Math.floor((i / (groupSize) + offset) % randGroupValues.length)])
      if(i === Math.floor(width / 2)){
      //   startRow[i - 2] = 1;
        // startRow[i - 1] = 2;
        startRow.push(1);
        // startRow[i + 1] = 2;
      //   startRow[i + 2] = 1;
      }else{
        startRow.push(0);
      }
    }
    // console.log('startRow',startRow)
    return startRow;
  }

  private generateElementaryRuleDict({states,rule},kernelWidth): Record<string, number>{
    const totalKernels = Math.pow(states,kernelWidth);
    const ruleDict: Record<string,number> = {};
    const splitRule: number[] = rule.toString(states)
      .padStart(totalKernels,'0')
      .split('')
      .map(v => parseInt(v))
    for(let i = 0; i < totalKernels; i++){
      const kernelBin = i.toString(states).padStart(kernelWidth,'0');
      ruleDict[kernelBin] = splitRule[i];
    }
    return ruleDict;
  }

  private generateTotalisticRuleDict({states,rule},kernelWidth): Record<number, number>{
    const totalKernelAverages = kernelWidth * (states - 1) + 1
    const totalKernels = Math.pow(states,kernelWidth);
    if(!rule){
      rule = this.generateRandomTotalisticSeed(states,kernelWidth)
    }
    
    
    const splitRule: number[] = rule.toString(states)
      .padStart(totalKernelAverages,'0')
      .split('')
      .map(v => parseInt(v))
    const kernelAverages: number[] = [...new Set(new Array(totalKernels).fill(0).map((_,i) => {
      const n = i.toString(states);
      const avg = round(n.split('').reduce((sum,val)=>sum + parseInt(val),0) / kernelWidth);
      return avg;
    }))]
    console.log('kernelAverages',kernelAverages)
    return kernelAverages.reduce((dict: any,avg: number, i) => {
      dict[avg] = splitRule[i];
      return dict
    },{})
  }

  public generateRandomTotalisticSeed(b: number,k: number): string{
    let seed = '';
    let seedLen = k * (b - 1) + 1
    for(let i = 0; i < seedLen; i++){
      seed += Math.floor(Math.random() * b).toString()
    }
    return seed;
    // console.log('seed',seed)
    // let grid = []
    // let w = 8;
    // let h = 8;
    // for(let i = 0; i < h; i++){
    //   let row = []
    //   for(let j = 0; j < w; j++){
    //     let b = i + 3;
    //     let k = j + 3;
    //     row.push(k * (b - 1) + 1)
    //   }
    //   grid.push(row)
    // }
    // for(let i = 0; i < h; i++){
    //   for(let j = 0; j < w; j++){
    //     // const times = j;
    //     const xSum = j * 2
    //     const ySum = i * 2

    //     grid[i][j] += (times * step)
    //   }
    // }
    // console.log('grid',grid)

    // return '';
  }


}
