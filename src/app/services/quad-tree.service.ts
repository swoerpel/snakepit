import { Injectable } from '@angular/core';
import { analyze } from 'chroma.ts';
import { Point, Rect } from '../shared/models';
import { DrawOptions } from '../shared/models/draw-options.model';
import { StyleOptions } from '../shared/models/style-options.model';
import { filterOverlappingRectsByLargest, orderRectsByValue, randHex } from '../state/helpers';
import { QuadTree, Rectangle } from './quadtree';

@Injectable({
  providedIn: 'root'
})
export class QuadTreeService {

  constructor() { }


  generateQuadTree(points: Point[]): QuadTree {
     let boundary = new Rectangle(0.5,0.5,0.5,0.5);
     let qtree = new QuadTree(boundary, 1);
     points.forEach((p: Point) => {
      points.push(p)
      qtree.insert(p);
     })
     return qtree;
  }

  public getRectsFromQuadTree(qtree: QuadTree): Rect[]{
    let rects: Rect[] = [];
    const toRect = (r: Rectangle, depth: number, index: number): Rect => ({
      x: r.x - r.w,
      y: r.y - r.h,
      width: r.w * 2,
      height: r.h * 2,
      value: depth,
      index,
    })
    let index = 0;
    const getRects = (qt: QuadTree, depth: number) => {
      rects.push(toRect(qt.boundary, depth, index))
      index++;
      if(qt.divided){
        getRects(qt.northeast, depth + 1);
        getRects(qt.northwest, depth + 1);
        getRects(qt.southeast, depth + 1);
        getRects(qt.southwest, depth + 1);
      }
    }
    getRects(qtree,0);

    return orderRectsByValue(
      filterOverlappingRectsByLargest(rects)
    );
  }

  public drawQuadTree(
    qtree: QuadTree,
    svg: any,
    xScale,
    yScale,
  ){
    const fill = randHex()
    // const cv = 1 / this.quadTreesDrawn;
    // const fill = this.cm(cv).hex();
    const x = qtree.boundary.x - qtree.boundary.w;
    const y = qtree.boundary.y - qtree.boundary.h;
    svg.append('rect')
        .attr('x', xScale(x))
        .attr('y', yScale(y))
        .attr('width', xScale(qtree.boundary.w * 2))
        .attr('height', yScale(qtree.boundary.h * 2))
        .attr('fill', fill)

    if (qtree.divided) {
      this.drawQuadTree(qtree.northeast,svg,xScale,yScale);
      this.drawQuadTree(qtree.northwest,svg,xScale,yScale);
      this.drawQuadTree(qtree.southeast,svg,xScale,yScale);
      this.drawQuadTree(qtree.southwest,svg,xScale,yScale);
    }
  }

  public drawQuadTreeGridLines(
    qtree: QuadTree,
    svg: any,
    xScale,
    yScale,
    index: number = 0,
    stroke: string | string[] = 'black',
    fill: string | string[] = 'white',
    strokeWidth = 0.001,
    opacity = 1,
    defaultStrokeMode = true,
  ){
    index++;
    const x = qtree.boundary.x - qtree.boundary.w;
    const y = qtree.boundary.y - qtree.boundary.h;
    const width = qtree.boundary.w * 2;
    const height = qtree.boundary.h * 2;
    svg.append('rect')
        .attr('x', xScale(x))
        .attr('y', yScale(y))
        .attr('width', xScale(width))
        .attr('height', yScale(height))
        .attr('stroke', 'none')
        .attr('stroke',(stroke !== Object(stroke)) ? stroke : stroke[index % stroke.length] )
        .attr('fill',(fill !== Object(fill)) ? fill : fill[index % fill.length] )
        .attr('stroke-width',defaultStrokeMode ? xScale(strokeWidth) : xScale(strokeWidth * width / 2))
        .attr('stroke-opacity',opacity)
        // .attr('stroke-dasharray','8')

    if (qtree.divided) {
      this.drawQuadTreeGridLines(qtree.northeast,svg,xScale,yScale,index,stroke,fill,strokeWidth,opacity,defaultStrokeMode);
      this.drawQuadTreeGridLines(qtree.northwest,svg,xScale,yScale,index,stroke,fill,strokeWidth,opacity,defaultStrokeMode);
      this.drawQuadTreeGridLines(qtree.southeast,svg,xScale,yScale,index,stroke,fill,strokeWidth,opacity,defaultStrokeMode);
      this.drawQuadTreeGridLines(qtree.southwest,svg,xScale,yScale,index,stroke,fill,strokeWidth,opacity,defaultStrokeMode);
    }
  }

  public drawQuadTreeGridRects(
    qtree: QuadTree,
    drawOptions: DrawOptions,
    styleOptions: StyleOptions,
    index: number = 0,
  ){
    index++;
    const x = qtree.boundary.x - qtree.boundary.w;
    const y = qtree.boundary.y - qtree.boundary.h;
    const width = qtree.boundary.w * 2;
    const height = qtree.boundary.h * 2;
    
    drawOptions.svg.append('rect')
        .attr('x', drawOptions.xScale(x))
        .attr('y', drawOptions.yScale(y))
        .attr('width', drawOptions.xScale(width))
        .attr('height', drawOptions.yScale(height))
        .attr('stroke', 'none')
        .attr('stroke',(styleOptions.stroke !== Object(styleOptions.stroke)) ? 
          styleOptions.stroke : styleOptions.stroke[index % styleOptions.stroke.length])
        .attr('fill',(styleOptions.fill !== Object(styleOptions.fill)) ? 
          styleOptions.fill : styleOptions.fill[index % styleOptions.fill.length])
        .attr('stroke-width',drawOptions.xScale(styleOptions.strokeWidth))
        .attr('stroke-opacity',styleOptions.opacity)

    if (qtree.divided) {
      this.drawQuadTreeGridRects(qtree.northeast,drawOptions,styleOptions,index);
      this.drawQuadTreeGridRects(qtree.northwest,drawOptions,styleOptions,index);
      this.drawQuadTreeGridRects(qtree.southeast,drawOptions,styleOptions,index);
      this.drawQuadTreeGridRects(qtree.southwest,drawOptions,styleOptions,index);
    }
  }




}
