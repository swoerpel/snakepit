import { Injectable } from '@angular/core';
import { Point, Rect } from '../shared/models';
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

    const toRect = (r: Rectangle, depth: number): Rect => ({
      x: r.x - r.w,
      y: r.y - r.h,
      width: r.w * 2,
      height: r.h * 2,
      value: depth,
    })

    const getRects = (qt: QuadTree, depth: number) => {
      rects.push(toRect(qt.boundary, depth))
      if(qt.divided){
        getRects(qt.northeast, depth + 1);
        getRects(qt.northwest, depth + 1);
        getRects(qt.southeast, depth + 1);
        getRects(qt.southwest, depth + 1);
      }
    }

    getRects(qtree,0);
    return rects;
  }

  public drawQuadTree(
    qtree: QuadTree,
    svg: any,
    xScale,
    yScale,
  ){
    // const cv = 1 / this.quadTreesDrawn;
    // const fill = this.cm(cv).hex();
    const fill ='#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
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




}
