import { Injectable } from '@angular/core';
import { Point, Rect } from '../shared/models';

@Injectable({providedIn: 'root'})
export class DrawingService {
    constructor() { }

    public drawPoints(
        points: Point[],
        svg: any,
        xScale,
        yScale,
        radius = 0.002,
        fill = 'white',
        opacity: number | Function = 1 
      ): void{
        const gridGroup = svg.append('g')
          .selectAll('circle')
          .data(points);
        gridGroup.enter()
          .append('circle')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', xScale(radius))
          .attr('fill', fill)
          .attr('opacity', (_,i) => 
          (typeof opacity === 'number') ?  opacity : opacity(i))
      }

    public drawLine(
        start: Point,
        end: Point,
        svg: any,
        xScale,
        yScale,
        strokeWidth = 0.001,
        stroke = 'white',
        opacity: number | Function = 1 
      ): void{
        svg.append("line")
          .attr("x1", xScale(start.x))
          .attr("y1", yScale(start.y))
          .attr("x2", xScale(end.x))  
          .attr("y2", yScale(end.y))
          .attr("stroke-linecap", 'round')
          .attr("stroke-width", xScale(strokeWidth))
          .attr('stroke', stroke)
          .attr('opacity', (_,i) => 
          (typeof opacity === 'number') ?  opacity : opacity(i));
      }

    public drawRects(
        rects: Rect[],
        svg: any,
        xScale,
        yScale,
        cm,
    ): void{
        const group = svg.append('g')
            .selectAll('rect')
            .data(rects);
        group.enter()
            .append('rect')
            .attr('x', d => xScale(d.x))
            .attr('y', d => yScale(d.y))
            .attr('width', d => xScale(d.width))
            .attr('height', d => yScale(d.height))
            .attr('fill', (d,i) => cm(d.value).hex())
            .attr('stroke', (d,i) => 'white')
            .attr('stroke-width', (d,i) => 3)
    }
    
}