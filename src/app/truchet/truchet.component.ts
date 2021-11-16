import { Component, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import { scaleLinear, ScaleLinear, scaleLog, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { uid } from 'uid';
import { ColorService } from '../services/color.service';
import { DrawingService } from '../services/drawing.service';
import { QuadTreeService } from '../services/quad-tree.service';
import { QuadTree } from '../services/quadtree';
import { TruchetService } from '../services/truchet.service';
import { WolframService } from '../services/wolfram.service';
import { Dims, Point, Rect } from '../shared/models';
import { assignRandGridValues, findRectsByValue, generateLine, getRadialVertices, shuffle } from '../state/helpers';
import { WingedTile } from './truchet.models';


// ideas
// draw a 2x2 grid of black and white 2 state patterns
// seperate svgs 

// to use N constant winged tile type,
// create N random wolfram patterns, same seed, different starting pattern
// use pattern sum grid as indexes for winged tile type
// this lets the wolfram pattern stay small
// the other option will be using totalistic

@Component({
  selector: 'app-truchet',
  templateUrl: './truchet.component.html',
  styleUrls: ['./truchet.component.scss']
})
export class TruchetComponent implements OnInit {


  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public xCellScale: ScaleLinear<number, number, never>;
  public yCellScale: ScaleLinear<number, number, never>;
  public cellWidth: number;
  public cellHeight: number;

  public colorLight = '#fff9df';
  public colorDark = '#222020';
  // public backgroundColor = this.colorLight;
  public backgroundColor = this.colorDark;
  // public colorDark = 'black';
  // public colorDark = 'white';
  public canvasDims: Dims = {
    width: 4800,
    height: 4800,
  }
  public canvasGridDims: Dims = {
    width: 1,
    height: 1,
  }

  public cellDims: Dims = {
    width: 9,
    height: 9,
  }

  public gridPadding: Dims = {
    width: 0.1,
    height: 0.1,
  }

  constructor(
    private wolframService: WolframService,
    private colorService: ColorService,
    private drawingService: DrawingService,
    private quadTreeService: QuadTreeService,
    private truchetService: TruchetService,
  ) { }

  ngOnInit(): void {
    this.setupCanvas();
    const cells: Rect[] = this.generateCanvasCells();
    cells.forEach((cell: Rect, i) => {
      //==============================
      // WOLFRAM
      // const kernelParams: KernelParams = {
      //   states: 5,
      //   rule: '',//Math.floor(Math.random() * 50000000),
      //   pattern: [
      //     [1,0,1],
      //     [0,1,0],
      //     [1,0,1],
      //   ]
      // }
      // const grid: Rect[][] = generateDefaultRectGrid(cell,this.cellDims);
      // this.wolframService.assignTotalisticWolframValues(grid,this.cellDims,kernelParams);  
      // let tiles: Rect[] = shuffle(grid.reduce((acc, val) => acc.concat(val), []));
      //==============================
      // CIRCLES
      const density = 600;
      const count = 50;
      const points: Point[] = [
        // CIRCLES
        // ...new Array(count).fill(0).reduce((ary,_,i) => 
        //   ary.concat(getRadialVertices(
        //     {x: 0.1 + i * 0.01, y: 0.5 + i * 0.01},
        //     0 + i * 0.01,
        //     i * density,
        //   )
        // ),[]),
        ...getRadialVertices(
          {x: Math.random(), y: Math.random()},
          0.5,
          density,
        ),
        ...getRadialVertices(
          {x: Math.random(), y: Math.random()},
          0.5,
          density,
        ),
        ...getRadialVertices(
          {x: Math.random(), y: Math.random()},
          0.5,
          density,
        ),
        // LINES
        // ...generateLine(
        //   {x: 1, y: 1},
        //   {x: 0, y: 0.5},
        //   density,
        // ),
        // ...generateLine(
        //   randPoint(),
        //   randPoint(),
        //   density,
        // ),
        ...generateLine(
          {x: 0, y: 0.6},
          {x: 1, y: 0.2},
          density,
        ),
      ];
      const quadTree: QuadTree = this.quadTreeService.generateQuadTree(points);
      let tiles: Rect[] = this.quadTreeService.getRectsFromQuadTree(quadTree);
      tiles = [
        // ...filterRectsByValue(tiles, 0, false),
        // ...filterRectsByValue(tiles, 1, false),
        ...findRectsByValue(tiles, 2),
        ...findRectsByValue(tiles, 3),
        ...findRectsByValue(tiles, 4),
        ...findRectsByValue(tiles, 5),
        // ...findRectsByValue(tiles, 6),
        // ...findRectsByValue(tiles, 7),
        // ...filterRectsByValue(tiles, 4, false),
        // ...filterRectsByValue(tiles, 4, false),
      ]
      const permutationCount = 6;
      assignRandGridValues(tiles,permutationCount,true);
      let wingedTiles: WingedTile[] = this.truchetService.generateWingedTiles(tiles,permutationCount);
      // wingedTiles = shuffle(wingedTiles);
      // wingedTiles = wingedTiles.reverse();
      const colorCount = 20;
      const colors = this.colorService.createColorList('random',colorCount);
      const opcScale = scaleLog().domain([0,1]).range([1,0.4]);
      const colorOffset =  + Math.floor(Math.random() * colorCount);
      wingedTiles.forEach((wingedTile: WingedTile, i: number) => {
        const c1 = colors[i % colors.length];
        const c2 = colors[(i + colorOffset) % colors.length];
        const opacity = opcScale(i / wingedTiles.length);
        this.truchetService.drawWingedTile(
          this.svg,
          this.xScale,
          this.yScale,
          wingedTile,
          c1,c2,
          opacity,
        );
      })
      // this.quadTreeService.drawQuadTreeGridLines(
      //   quadTree,
      //   this.svg,
      //   this.xScale,
      //   this.yScale,
      //   this.colorLight,
      //   0.0005,
      //   0.25,
      // );
      // this.drawingService.drawPoints(
      //   points,
      //   this.svg,
      //   this.xScale,
      //   this.yScale,
      //   0.001,
      //   'white',
      //   1
      // );
    })
  }


  public generateCanvasCells(): Rect[] {
    let cells:Rect[] = [];
    const tWidth = 1 - this.gridPadding.width * 2;
    const tHeight = 1 - this.gridPadding.height * 2;
    const xStep = tWidth / this.canvasGridDims.width;
    const yStep = tHeight / this.canvasGridDims.height;
    for(let row = 0; row < this.canvasGridDims.height; row++){
      for(let col = 0; col <  this.canvasGridDims.width; col++){
        cells.push({
          x: this.gridPadding.width + col * xStep,
          y: this.gridPadding.height + row * yStep,
          width: xStep,
          height: yStep,
        });
      }
    }
    return cells;
  }

  drawGrid(grid: Rect[][], states: number){
    const flatGrid: Rect[] = grid.reduce((acc, val) => acc.concat(val), []);
    // console.log('flatGrid',flatGrid)
    const cm = chroma.scale(['black','white']);
    const gridGroup = this.svg.append('g').selectAll('rect').data(flatGrid);
    gridGroup.enter()
      .append('rect')
      .attr('x', d => this.xScale(d.x))
      .attr('y', d => this.yScale(d.y))
      .attr('width', d => this.xScale(d.width))
      .attr('height', d => this.yScale(d.width))
      .attr('fill', d => cm(d.value / (states - 1)).hex())
  }

  public setupCanvas(){
    this.xScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.height]);
    this.svg = select('#canvas')
      .append("svg")
      .attr('width', this.canvasDims.width)
      .attr('height', this.canvasDims.height)
      .style('background-color',this.backgroundColor);
  }

  // public setupCanvasTile(): void{
  //   this.xScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.width]);
  //   this.yScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.height]);
  //   this.svg = select('#canvas')
  //     .append("svg")
  //     .attr('width', this.canvasDims.width)
  //     .attr('height', this.canvasDims.height)
  //     .style('background-color','black');
  // }

  public save(){
    let svg = document.getElementsByTagName("svg")[0];
    let id = `${uid()}.png`;
    console.log('svg',id,svg);
    let params = {backgroundColor: this.backgroundColor, scale: 3};
    saveSvgAsPng(svg,id,params);
  }

}
