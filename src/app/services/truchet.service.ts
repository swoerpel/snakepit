import { Injectable } from '@angular/core';
import { line } from 'd3';
import { Point, Rect } from '../shared/models';
import { generateRadialCurve } from '../state/helpers';
import { TILE_MAP } from '../truchet/truchet.constants';
import { WingedTile } from '../truchet/truchet.models';

@Injectable({providedIn: 'root'})
export class TruchetService {

    constructor() { }

    public generateWingedTiles(
        tiles: Rect[],
        permutationCount = 3,
      ): WingedTile[] {
        const tilePermutationsKeys: string[] = Object.keys(TILE_MAP);
        const permutations: number[] = new Array(permutationCount).fill(0).map((_,i) => 
          // [7,2,9,10][i % 4] 
            Math.floor(Math.random() * tilePermutationsKeys.length)
        );
        console.log('permutations',permutations)

        return tiles.map((tile: Rect) => {
          const key = permutations[Math.floor(Math.random() * permutations.length)];
          // const key = permutations[tile.value % permutations.length];
          const { straights, curves } = TILE_MAP[tilePermutationsKeys[key]];
          return this.generateWingedTile(tile,straights,curves)
        });
    }

    drawWingedTile(
      svg,
      xScale,
      yScale,
      tile: WingedTile,
      foreground: string,
      background: string,
      opacity: number = 0.1,
    ){
        const cornerFill = foreground;
        const edgeFill = background;
        const tileGroup = svg.append('g');
        const cornerCircles = tileGroup.selectAll('circle').data(tile.corners);
        const edgeCircles = tileGroup.selectAll('circle').data(tile.edges);
    
        const lineGenerator = line();
    
        tileGroup
          .append('rect')
          .attr('x', xScale(tile.rect.x))
          .attr('y', yScale(tile.rect.y))
          .attr('width', xScale(tile.rect.width))
          .attr('height', yScale(tile.rect.width))
          .attr('fill', cornerFill)
          .attr('opacity',opacity)
    
        cornerCircles.enter()
          .append('circle')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', xScale(tile.cornerRadius))
          .attr('fill', cornerFill)
          .attr('opacity',opacity)
    
        edgeCircles.enter()
          .append('circle')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', xScale(tile.edgeRadius))
          .attr('fill', edgeFill)
          .attr('opacity',opacity)
    
        tile.straights.forEach((straight: Point[]) => {
          const line: [number, number][] = straight.map((p: Point) => ([xScale(p.x),yScale(p.y)]));
          tileGroup.append('path')
              .transition()
              .duration(500)
              .attr('d',lineGenerator(line))
              .attr('stroke', edgeFill)
              .attr('stroke-width', xScale(tile.edgeRadius * 2))
              .attr('stroke-linecap', 'round')
              .attr('stroke-opacity',opacity)
              .attr('fill', 'none');
        });
    
        tile.curves.forEach((curve: Point[]) => {
          const curvedLine: [number, number][] = curve.map((p: Point) => ([xScale(p.x),yScale(p.y)]));
            tileGroup.append('path')
              .transition()
              .duration(500)
              .attr('d',lineGenerator(curvedLine))
              .attr('stroke', edgeFill)
              .attr('stroke-width', xScale(tile.edgeRadius * 2))
              .attr('stroke-linecap', 'round')
              .attr('stroke-opacity',opacity)
              .attr('fill', 'none');
        });
      }
    
      public generateWingedTile(
        rect: Rect, 
        drawStraights: number[], 
        drawCurves: number[], 
      ): WingedTile{
        const cornerRadius = rect.width * 1/3;
        const edgeRadius = rect.width * 1/6;
        // const cornerRadius = rect.width * 1/3;
        // const edgeRadius = rect.width * 1/6;
        const corners: Point[] = [
          {x: rect.x, y: rect.y},
          {x: rect.x + rect.width, y: rect.y},
          {x: rect.x + rect.width, y: rect.y + rect.height},
          {x: rect.x, y: rect.y + rect.height},
        ];
        const edges: Point[] = [
          {x: rect.x + rect.width / 2, y: rect.y},
          {x: rect.x + rect.width, y: rect.y + rect.height / 2},
          {x: rect.x + rect.width / 2, y: rect.y + rect.height},
          {x: rect.x, y: rect.y + rect.height / 2},
        ];
        const straights: Point[][] = drawStraights.map((drawStraight: number, index) => {
          if(!!drawStraight){
            let p1: Point;
            let p2: Point;
            switch(index){
              case 0: {
                p1 = {...edges[3]};
                p2 = {...edges[1]};
              };break;
              case 1: {
                p1 = {...edges[0]};
                p2 = {...edges[2]};
              };break;
            }
            return [p1,p2];
          }
        }).filter(s => !!s);
        const curves = drawCurves.map((drawCurve: number, index)=>{
          if(!!drawCurve){
            let p1: Point;
            let p2: Point;
            switch(index){
              case 0: {
                p1 = {...edges[2]};
                p2 = {...corners[3]};
              };break;
              case 1: {
                p1 = {...edges[0]};
                p2 = {...corners[1]};
              };break;
              case 2: {
                p1 = {...edges[3]};
                p2 = {...corners[0]};
              };break;
              case 3: {
                p1 = {...edges[1]};
                p2 = {...corners[2]};
              };break;
            }
            return generateRadialCurve(p1,p2);
          }
        }).filter(s => !!s);
        return {
          straights,curves,corners,edges,edgeRadius,cornerRadius,rect
        }
      }
    
    
}