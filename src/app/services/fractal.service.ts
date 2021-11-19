import { Injectable } from '@angular/core';
import { scaleLinear } from 'd3';
import { Point, Rect } from '../shared/models';
import { getExtremaFromPoints } from '../state/helpers';

export interface TransformParams{
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  p: number;
}

@Injectable({providedIn: 'root'})
export class FractalService {

  constructor() { }

  public generateIFSFractal(
    paramGroup: TransformParams[] = null,
    iterations = 10000
  ): Point[]{
    // const f1: TransformParams = {
    //   a: 0,
    //   b: 0,
    //   c: 0,
    //   d: 0.16,
    //   e: 0,
    //   f: 0,
    //   p: 0.01,
    // }
    // const f2: TransformParams = {
    //   a: 0.85,
    //   b: 0.04,
    //   c: -0.04,
    //   d: 0.85,
    //   e: 0,
    //   f: 1.6,
    //   p: 0.85,
    // }
    // const f3: TransformParams = {
    //   a: 0.2,
    //   b: -0.26,
    //   c: 0.23,
    //   d: 0.22,
    //   e: 0,
    //   f: 1.6,
    //   p: 0.07,
    // }
    // const f4: TransformParams = {
    //   a: -0.15,
    //   b: 0.28,
    //   c: 0.26,
    //   d: 0.24,
    //   e: 0,
    //   f: 0.44,
    //   p: 0.07,
    // }
    if(!paramGroup){
      paramGroup = [
        this.generateRandFunction(0.5),
        this.generateRandFunction(0.5),
      ];
      console.log(paramGroup)
    }
    
    
  
    const transform = ({x,y}: Point, p: TransformParams) => ({
      x: p.a*x + p.b*y + p.e,
      y: p.c*x + p.d*y + p.f,
    })
    let currPoint: Point = {x: 0,y: 0}
    const points: Point[] = [currPoint];
    
    const pmf: number[] = paramGroup.map(f => f.p);
    const cdf = pmf.map((sum => value => sum += value)(0))
    for(let i = 0; i < iterations; i++){
      const rand = Math.random()
      const params: TransformParams = paramGroup[cdf.filter(el => rand >= el).length];
      currPoint = transform(currPoint,params);
      points.push({...currPoint});
    }
    const [extremaX,extremaY] = getExtremaFromPoints(points);
    const xScale = scaleLinear().domain([extremaX.min,extremaX.max]).range([0,1]);
    const yScale = scaleLinear().domain([extremaY.min,extremaY.max]).range([0,1]);
    return points
    .map((point: Point) => ({
      x: xScale(point.x),
      y: yScale(point.y),
    }))
    // .filter(() => Math.random() < removalChance);
  }

  private generateRandFunction(p: number): TransformParams{
    return {
      a: Math.random() * (Math.random() > 0.5 ? 1 : -1),
      b: Math.random() * (Math.random() > 0.5 ? 1 : -1),
      c: Math.random() * (Math.random() > 0.5 ? 1 : -1),
      d: Math.random() * (Math.random() > 0.5 ? 1 : -1),
      e: Math.random() * (Math.random() > 0.5 ? 1 : -1),
      f: Math.random() * (Math.random() > 0.5 ? 1 : -1),
      p,
    }
  }

}