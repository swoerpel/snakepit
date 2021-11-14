import { Component, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import * as tome from 'chromotome';
import { select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { uid } from 'uid';
import { WolframService } from '../services/wolfram.service';
import { KernelParams } from '../shared/models/wolfram.models';
import { round } from '../state/helpers';
import { Dims, ColorPalette, Rect } from '../shared/models';

@Component({
  selector: 'app-quilt',
  templateUrl: './quilt.component.html',
  styleUrls: ['./quilt.component.scss']
})
export class QuiltComponent implements OnInit {

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
    width: 2400,
    height: 2400,
  }

  public cellDims: Dims = {
    width: 41,
    height: 41,
  }

  public gridPadding: Dims = {
    width: 0.1,
    height: 0.1,
  }

  public strokeOpacity: number = 0.5;


  constructor(
    private wolframService: WolframService,
  ) { }

  ngOnInit(): void {
    this.setupCanvas();
    const palettes: ColorPalette[] = this.setupPalettes();

    const pal = palettes[Math.floor(Math.random() * palettes.length)];
    const cm = chroma.scale('Viridis');
    const boundary: Rect = {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    }
    let states = 3;
    // setInterval(() =>{
      const kernelParams: KernelParams = {
        states,
        rule: '',//Math.floor(Math.random() * 5000000000),
        // rule: Math.floor(Math.random() * 5000000000),
        pattern: [
          // [1,1,1,1],
          [1,1,1],
          // [1,1,1],
          // [1,0,1],
        ]
      };
      states++;
      const grid: Rect[][] = this.createGrid(boundary,this.cellDims);
      this.wolframService.assignTotalisticSeedLengthValues(grid,kernelParams.states);  
      // console.log("grid",grid);
      // this.wolframService.assignTotalisticWolframValues(grid,this.cellDims,kernelParams);  
      // this.drawGrid(grid, params.states)
      // let tiles: Rect[] = shuffle(grid.reduce((acc, val) => acc.concat(val), []));
      // console.log('grid',grid);
      this.drawGrid(grid, kernelParams.states, cm);
    // },100)
   
  }

  public createGrid(rect: Rect, dims: Dims): Rect[][]{
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

  drawGrid(grid: Rect[][], states: number, cm: Function){
    const flatGrid: Rect[] = grid.reduce((acc, val) => acc.concat(val), []);
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

  public setupPalettes(): ColorPalette[]{
    const tomePalettes:ColorPalette[] = tome.getAll().map((pal) => {
      return {
        name: pal.name,
        colors: pal.colors,
      }
    });
    const brewerPalettes: ColorPalette[] = Object.entries(chroma.brewer)
      .map(([name,colors]:[string,number[]]) => ({
        name,
        colors: colors.map(d => '#' + d.toString(16))
      }));

    return tomePalettes.concat(brewerPalettes);
  }

  public save(){
    let svg = document.getElementsByTagName("svg")[0];
    let id = `${uid()}.png`;
    console.log('svg',id,svg);
    let params = {backgroundColor: this.backgroundColor, scale: 3};
    saveSvgAsPng(svg,id,params);
  }

}
