import { Component, ElementRef, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import { line, scaleLinear, ScaleLinear, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { uid } from 'uid';
import { ColorService } from '../services/color.service';
import { WolframService } from '../services/wolfram.service';
import { Dims, Rect, Point, ColorPalette } from '../shared/models';
import { KernelParams } from '../shared/models/wolfram.models';
import { round, shuffle } from '../state/helpers';
import { TILE_MAP } from './truchet.constants';
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

  public tilePermutationsKeys: string[] = Object.keys(TILE_MAP);

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
    width: 2,
    height: 2,
  }

  public cellDims: Dims = {
    width: 8,
    height: 8,
  }

  public gridPadding: Dims = {
    width: 0.1,
    height: 0.1,
  }

  public strokeOpacity: number = 1;

  public kernelParams: KernelParams = {
    states: 5,
    rule: '',//Math.floor(Math.random() * 50000000),
    pattern: [
      [1,0,1],
      [0,1,0],
      [1,0,1],
    ]
  }

  constructor(
    private wolframService: WolframService,
    private colorService: ColorService,
  ) { }

  ngOnInit(): void {
    // console.log('tome',tome)
    this.setupCanvas();
    
    // this.palettes:  this.newMethod(); 
    const pals: ColorPalette[] = this.colorService.generatePalettes()
    // const pal = pals.find(p => p.name === "Spectral");
    const pal = pals[Math.floor(Math.random() * pals.length)];
    pal.colors = shuffle(pal.colors);
    
    const colors: string[] = [
      pal.colors.pop(),
      pal.colors.pop(),
      pal.colors.pop(),
    ];
    console.log('pal',pal, colors);

    let eColors = ['black','white'];//[...colors]
    // let eColors = [...colors]
    eColors = shuffle(eColors);
    // console.log('pal',pal)
    const cells: Rect[] = this.generateCanvasCells();
    // this.colorDark = pal.background;
    const foregrounds = [
      ...colors,
      // ...eColors

      // pal.colors.pop(),
      // pal.colors.pop(),
      // pal.colors.pop(),
      // this.colorDark,
      // this.colorLight,
    ]
    const backgrounds = [
      // ...colors,
      // ...eColors,
      this.colorLight
    ]
    cells.forEach((cell: Rect, i) => {
      const randPermIndices: number[] = [
        // 0,1,2
        Math.floor(Math.random() * this.tilePermutationsKeys.length),
        Math.floor(Math.random() * this.tilePermutationsKeys.length),
        Math.floor(Math.random() * this.tilePermutationsKeys.length),
        // Math.floor(Math.random() * this.tilePermutationsKeys.length),
        // Math.floor(Math.random() * this.tilePermutationsKeys.length),
        // Math.floor(Math.random() * this.tilePermutationsKeys.length),
      ];
      // const foreground = i % 2 === 0 ? 'black' : 'white';
      // const background = i % 2 !== 0 ? 'black' : 'white';
      // const foreground = 'black';
      // const background = 'white';

      // const rule = 21416;
      // const rule = 5525;
      // const rule = 94290;
      // const rule = 40811354;
      // const rule = Math.floor(Math.random() * 50000000);
      // console.log("RULE",rule)
      // this.kernelParams.rule = rule;

      const grid: Rect[][] = this.createGrid(cell,this.cellDims);

      this.wolframService.assignTotalisticWolframValues(grid,this.cellDims,this.kernelParams);  
      // this.drawGrid(grid, params.states)
      let tiles: Rect[] = shuffle(grid.reduce((acc, val) => acc.concat(val), []));
      
      this.drawLatticeCell(tiles, randPermIndices,foregrounds,backgrounds);
    })
  }



  public drawLatticeCell(
    tiles: Rect[],
    permutations: number[],
    foregrounds: string[],
    backgrounds: string[],
  ){
    // let indexes = [];
    const indexes: number[] = tiles.map((_tile: Rect,i: number) => {
      if(i % 4  === 0){
      // if(Math.random() > 0.75){
        return i;
      }
      return null;
      // return i % 3 === 0 ? i : 0;
      // return Math.floor(Math.random() * tiles.length)
    }).filter(i => !!i);
    // console.log('indexes',indexes)
    // tiles = tiles.concat(this.splitRect(tiles,indexes,permutations));
    tiles.forEach((tile: Rect, j) => {
      const key = permutations[tile.value % permutations.length];
      const foreground = foregrounds[tile.value % foregrounds.length];
      const background = backgrounds[tile.value % backgrounds.length];
      const { straights, curves } = TILE_MAP[this.tilePermutationsKeys[key]];
      const wingedTile = this.generateWingedTile(tile,straights,curves)
      this.drawWingedTile(wingedTile, foreground,background);
    });
  }


  public splitRect(rects: Rect[], splitIndexes: number[], permutations: number[] = [0]){
    const newRects: Rect[] = []
    const width = rects[0].width / 2;
    const height = rects[0].height / 2;

    
      // console.log('value',values)
    splitIndexes.forEach((rectIndex: number, i: number) => {
      const rect = rects[rectIndex];
      // const value = permutations[i % permutations.length];
      const values: number[] = new Array(4).fill(0).map(() => 
        permutations[Math.floor(Math.random() * permutations.length)]);
      console.log('values',values)
      newRects.push({x: rect.x,y: rect.y,width,height, value: values[0]});
      newRects.push({x: rect.x + width, y: rect.y, width,height,value: values[1]});
      newRects.push({x: rect.x + width, y: rect.y + height, width, height,value: values[2]});
      newRects.push({x: rect.x, y: rect.y + height, width, height,value: values[3]});
    })
    return newRects;
  }

  public createGrid(rect: Rect, dims: Dims){
    const grid: Rect[][] = [];
    const xStep = rect.width / dims.width;
    const yStep = rect.height / dims.height;
    for(let row = 0; row < dims.height; row++){
      const rectRow: Rect[] = [];
      for(let col = 0; col <  dims.width; col++){
        rectRow.push({
          x: round(rect.x + col * xStep),
          y: round(rect.y + row * yStep),
          width: round(rect.width) / dims.width,
          height: round(rect.height) / dims.height,
          value: 0,
        })
      }
      grid.push(rectRow);
    }
    return grid;
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


  // generateSumGrid(dims,layers: number = 1): Rect[][]{
  //   const gridLayers:Rect[][][] = new Array(layers).fill(null)
  //     .map(() => this.createGrid(null,dims));
  //   return gridLayers[0].map((row: Rect[],i) => {
  //     return row.map((rect,j) => {
  //       const addAmount: number = gridLayers.reduce((sum,layer) => layer[i][j].value + sum, 0);
  //       rect.value += addAmount;
  //       return rect;
  //     })
  //   });
  // }


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

  drawWingedTile(tile: WingedTile,foreground: string,background: string){
    const cornerFill = foreground;
    const edgeFill = background;
    const tileGroup = this.svg.append('g');
    const cornerCircles = tileGroup.selectAll('circle').data(tile.corners);
    const edgeCircles = tileGroup.selectAll('circle').data(tile.edges);

    const lineGenerator = line();

    tileGroup
      .append('rect')
      .attr('x', this.xScale(tile.rect.x))
      .attr('y', this.yScale(tile.rect.y))
      .attr('width', this.xScale(tile.rect.width))
      .attr('height', this.yScale(tile.rect.width))
      .attr('fill', cornerFill)

    cornerCircles.enter()
      .append('circle')
      .attr('cx', d => this.xScale(d.x))
      .attr('cy', d => this.yScale(d.y))
      .attr('r', this.xScale(tile.cornerRadius))
      .attr('fill', cornerFill)

    edgeCircles.enter()
      .append('circle')
      .attr('cx', d => this.xScale(d.x))
      .attr('cy', d => this.yScale(d.y))
      .attr('r', this.xScale(tile.edgeRadius))
      .attr('fill', edgeFill);

    tile.straights.forEach((straight: Point[]) => {
      const line: [number, number][] = straight.map((p: Point) => ([this.xScale(p.x),this.yScale(p.y)]));
      tileGroup.append('path')
          .transition()
          .duration(500)
          .attr('d',lineGenerator(line))
          .attr('stroke', edgeFill)
          .attr('stroke-width', this.xScale(tile.edgeRadius * 2))
          .attr('stroke-linecap', 'round')
          .attr('stroke-opacity',this.strokeOpacity)
          .attr('fill', 'none');
    });

    tile.curves.forEach((curve: Point[]) => {
      const curvedLine: [number, number][] = curve.map((p: Point) => ([this.xScale(p.x),this.yScale(p.y)]));
        tileGroup.append('path')
          .transition()
          .duration(500)
          .attr('d',lineGenerator(curvedLine))
          .attr('stroke', edgeFill)
          .attr('stroke-width', this.xScale(tile.edgeRadius * 2))
          .attr('stroke-linecap', 'round')
          .attr('stroke-opacity',1)
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
        return this.generateRadialCurve(p1,p2);
      }
    }).filter(s => !!s);
    return {
      straights,curves,corners,edges,edgeRadius,cornerRadius,rect
    }
  }

  public generateRadialCurve(point: Point, origin: Point, rotation = 90): Point[] {    
    const points = [];
    const pointCount = 90;
    const angleStep = rotation / pointCount;
    for(let i = 0; i <= pointCount; i++){
      const radians = (Math.PI / 180) * angleStep * i;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const x = (cos * (point.x - origin.x)) + (sin * (point.y - origin.y)) + origin.x;
      const y = (cos * (point.y - origin.y)) - (sin * (point.x - origin.x)) + origin.y;
      points.push({x,y});
    }
    return points;
  }


  // public createTiles(dims: Dims, gridPadding: Dims): Rect[]{
  //   const tiles: Rect[] = [];
  //   const tileWidth = (1 - 2 * gridPadding.width) / dims.width;
  //   const tileHeight = (1 - 2 * gridPadding.height) / dims.height;
  //   for(let col = 0; col <  dims.width; col++){
  //     for(let row = 0; row <  dims.height; row++){
  //       tiles.push({
  //         x: round(gridPadding.width + col * tileWidth),
  //         y: round(gridPadding.height + row * tileHeight),
  //         width: round(tileWidth),
  //         height: round(tileHeight),
  //       })
  //     }
  //   }
  //   return tiles;
  // }

  public setupCanvas(){
    this.xScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.height]);
    this.svg = select('#canvas')
      .append("svg")
      .attr('width', this.canvasDims.width)
      .attr('height', this.canvasDims.height)
      .style('background-color',this.backgroundColor);
  }



  public createCanvasTile(rect: Rect){

    this.xScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.height]);
    this.svg = select('#canvas')
      .append("svg")
      .attr('width', this.canvasDims.width)
      .attr('height', this.canvasDims.height)
      .style('background-color','black');
  }

  public save(){
    let svg = document.getElementsByTagName("svg")[0];
    let id = `${uid()}.png`;
    console.log('svg',id,svg);
    let params = {backgroundColor: this.backgroundColor, scale: 3};
    saveSvgAsPng(svg,id,params);
  }

}
