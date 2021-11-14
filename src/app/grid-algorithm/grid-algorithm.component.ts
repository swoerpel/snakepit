import { Component, ElementRef, OnInit } from '@angular/core';
import { ScaleLinear, scaleLinear, select } from 'd3';
import { Cell,  Layer, LayerCell } from '../state/studio.models';
import * as chroma  from 'chroma.ts';
import { gridAlgorithms, GridAlgorithmType } from './grid-algorithms';
import { Dims } from '../shared/models';






@Component({
  selector: 'app-grid-algorithm',
  templateUrl: './grid-algorithm.component.html',
  styleUrls: ['./grid-algorithm.component.scss']
})
export class GridAlgorithmComponent implements OnInit {

  public svg: any;

  public layerGroups: any[];

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public cellWidth: number;
  public cellHeight: number;


  constructor(
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.setupCanvas();
    const dims = {width: 12, height: 12};
    // const type: GridAlgorithmType = GridAlgorithmType.Simple
    // const name: string = 'columns';
    // const base: number = 5;
    // const grid: Cell[] = gridAlgorithms[type][name](dims,base);
    const colorMachine = chroma.scale(['white','black']);

    const layerCells: LayerCell[] = this.generateLayer(dims);
    this.drawLayerCells(layerCells,dims,colorMachine);
    console.log('layerCells',layerCells);
    // this.drawGrid(grid, dims, colorMachine);
  }


  private generateLayer(dims: Dims): LayerCell[]{

    const opacityDomain: number[] = [0.5,1];
    const sizeDomain: number[] = [0.5,1,2];
    const shapeDomain: number[] = [0];
    const colorDomain: number[] = [0.5,0.75,1];

    const layer: Layer = {
      opacity: gridAlgorithms[GridAlgorithmType.Simple]['checker'](dims,opacityDomain.length),
      size: gridAlgorithms[GridAlgorithmType.Simple]['checker'](dims,sizeDomain.length),
      shape: gridAlgorithms[GridAlgorithmType.Constant]['constant'](dims,shapeDomain.length),
      color: gridAlgorithms[GridAlgorithmType.Simple]['columns'](dims,colorDomain.length),
    }
    console.log('layer',layer)

    return layer.opacity.map((cell: Cell, i: number) => {
      let lc: LayerCell = {
        x: cell.x,
        y: cell.y,
        i: cell.i,
        j: cell.j,
        opacity: opacityDomain[layer.opacity[i].value],
        size: sizeDomain[layer.size[i].value],
        shape: shapeDomain[layer.shape[i].value],
        color: colorDomain[layer.color[i].value],
      }
      return lc;
    })
  }

  private drawLayerCells(cells: LayerCell[],dims: Dims, colorMachine: any){
    const dx = 1 / dims.width;
    const dy = 1 / dims.height;
    const svgGrid = this.svg.append('g');
    svgGrid.selectAll('rect')
      .data(cells)
      .enter()
        .append('rect')
        .attr('x',d => this.xScale(d.x + (1 - d.size) * dx / 2))
        .attr('y',d => this.yScale(d.y + (1 - d.size) * dy / 2))
        .attr('width',d => this.xScale(dx * d.size))
        .attr('height',d => this.yScale(dy * d.size))
        .attr('fill',d => colorMachine(d.color))
        .attr('fill-opacity',d => d.opacity)

  }



  // private drawGrid(grid: Cell[], dims: Dims, colorMachine: any){
  //   console.log("grid",grid)
  //   const svgGrid = this.svg.append('g');
  //   svgGrid.selectAll('rect')
  //     .data(grid)
  //     .enter()
  //       .append('rect')
  //       .attr('x',d => this.xScale(d.x))
  //       .attr('y',d => this.yScale(d.y))
  //       .attr('width', this.xScale(1 / dims.width))
  //       .attr('height', this.yScale(1 / dims.height))
  //       .attr('fill',d => colorMachine(d.value))
  // }

  private setupCanvas(){
    const canvas: HTMLElement = this.elementRef.nativeElement.querySelector('#canvas');
    canvas.innerHTML = '';
    const preview: HTMLElement = this.elementRef.nativeElement.querySelector('.preview');
    const {height} = preview.getBoundingClientRect();
    const padding = 0.1;
    const canvasDims: Dims = {
      width: Math.floor(height) * (1 - padding),
      height: Math.floor(height) * (1 - padding),
    }

    this.xScale = scaleLinear().domain([0,1]).range([0,canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,canvasDims.height]);

    this.svg = select('#canvas')
      .append("svg")
      .attr('width', canvasDims.width)
      .attr('height', canvasDims.height)
      .style('background-color','white');
  }


}
