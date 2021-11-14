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
        fill = 'white'
      ): void{
        const gridGroup = svg.append('g')
          .selectAll('circle')
          .data(points);
        gridGroup.enter()
          .append('circle')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', xScale(radius))
          .attr('fill', fill);
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
            .attr('fill', (d,i) => {
                // return 'red';
                return cm(d.value).hex()
            })
    }
    
}