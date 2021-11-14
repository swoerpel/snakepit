import { Component, ElementRef, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import { line, scaleLinear, ScaleLinear, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { SmoothLine } from '../image-filter/image-filter.helpers';
import { uid } from 'uid';
import { HamiltonianService } from '../services/hamiltonian.service';
import { getRadialVertices, getSpiral } from '../state/helpers';
import { Cell, Weave, WeaveGroup } from '../image-filter/image-filter.models';
import { Dims, Point } from '../shared/models';
import { WeaveService } from '../services/weave.service';


// weave goal
// paint an image using weaves that looks like 
// an abstract version of the original image

// weave algorithms
  // hamiltinion paths, cover all, no randomness
  // use grid values
    // image color values
    // simple or complex grid algorithm values

// weave group requirements
  // arbitrary length N
  // thickness decreases with each group
  // color changes with each group

// weave end conditons
  // knight is trapped
  // min weave group thickness has been reached

// should be able to stack multiple weaves
  // once a weave dies out another can begin with existing or fresh grid values
  // previous weaves are drawn ontop of, are not erased
  // many weaves with different rules start from same cell
  // many weaves with same rule start from different cells

// places to start
  // have weave cover entire grid in either only rows or only columns
  // get weave group coloring to represent underlying image

// ideas:
// multiple weaves running at once:
  // multiple weaves running at once along a hamiltionan path would be cool
  // they would overlap eachother in real time instead of waiting for
  // the previous weave to die out

// multiple weaves starting in same place:
  // grid values stay the same but refresh once weave dies out
  // weave jump vector is only changing value

@Component({
  selector: 'app-weave',
  templateUrl: './weave.component.html',
  styleUrls: ['./weave.component.scss']
})
export class WeaveComponent implements OnInit {


  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public xCellScale: ScaleLinear<number, number, never>;
  public yCellScale: ScaleLinear<number, number, never>;
  public cellWidth: number;
  public cellHeight: number;

  public grid: Cell[][];

  // public gridDims: Dims = {
  //   width: 8,
  //   height: 8,
  // }

  constructor(
    private elementRef: ElementRef,
    private weaveService: WeaveService,
    private hamiltonianService: HamiltonianService,
  ) { }

  ngOnInit(): void {
    this.setupCanvas();
    chroma.brewer
    const palette = 'Oranges'
    const weave: Weave = {
      startWidth: 1.414,
      length: 6,
      groupLengthScaler: 32,
      palette,
      colorCount: 6,
      opacity: 1,      
    }
    const dims: Dims = {
      width: 8,
      height: 8,
    }
    this.setScales(dims);
    // this.drawWeave(weave,dims)
    this.drawRadialWeave(weave,dims);
    // this.drawWeave({...weave,opacity: 0.25},dims)
  }


  private drawRadialWeave(weave: Weave, dims: Dims){
    const count = 180;
    const origin: Point = {
      x: 0.5 - 1 / dims.width / 2,
      y: 0.5 - 1 / dims.height / 2,
    }

    const startAngle = 0;
    const rotation = 8 * Math.PI;
    const startRadius = 0.45;
    const endRadius = -0.45;

    const points: Point[] = getSpiral(
      origin,
      startAngle,
      rotation,
      startRadius,
      endRadius,
      count
    );
    console.log('points',points);
    const flatGrid: Cell[] = points.map((p: Point, i: number) => {
      return {
        index: i,
        row: 0,
        col: 0,
        origin: p,
        width: 1 / dims.width,
        height: 1 / dims.height,
        value: Math.random(),
      }
    })
    console.log('flatGrid',flatGrid)
    let weaveGroups: WeaveGroup[] = this.weaveService.generateWeave(weave, flatGrid);
    weaveGroups.forEach(g => this.drawWeaveGroup(g));
  }

  private drawWeave(weave: Weave, dims: Dims){
    let grid: Cell[][] = this.createGrid(dims);
    // let valueGrid = this.hamiltonianService.findHamiltionanPath(dims)
    // let flatGrid: Cell[] = this.valueGridToFlatGrid(grid,valueGrid);
    // let flatGrid: Cell[] = this.toAltRowFlatGrid(grid);
    // flatGrid = this.swapRandomElements(flatGrid, 4);
    // flatGrid = this.rotateArray(flatGrid, 7);
    let flatGrid: Cell[] = this.toValueSortFlatGrid(grid);
    // flatGrid = this.organizedShuffleArray(flatGrid)

    let weaveGroups: WeaveGroup[] = this.weaveService.generateWeave(weave, flatGrid);
    weaveGroups.forEach(g => this.drawWeaveGroup(g));
  }


  private organizedShuffleArray<T>(values: T[]): T[]{
    const front: T[] = [];
    values.map((value: T, i: number) => {
      if(i % 2 === 0 && (value['row'] % 3 === 0)){
        front.push(value);
        // if((i + 1) < values.length){
        front.push(values[values.length - i]);
        // }
      }
    });
    return front
    // return values;
  }

  private rotateArray<T>(values: T[], count: number): T[]{
    const front: T[] = []
    for(let i = 0; i < count; i++){
      front.push(values.pop())
    }
    front.reverse()
    for(let i = 0; i < count; i++){
      values.unshift(front[i])
    }
    return values;
  }
  private swapRandomElements<T>(values: T[], count: number): T[]{
    for(let i = 0; i < count; i++){
      const indexA = Math.floor(Math.random() * values.length);
      const indexB = Math.floor(Math.random() * values.length);
      const temp: T = {...values[indexA]};
      values[indexA] = {...values[indexB]};
      values[indexB] = temp;
    }
    return values;
  }


  private drawWeaveGroup(group: WeaveGroup){
    const lineGenerator = line()
    const data: Point[] = group.points.map((p: Point) => ({
      x: this.xScale(p.x),
      y: this.yScale(p.y),
    }));
    const curve = SmoothLine(data,8,0,0.25);
    // curve.unshift(data[0]);
    // curve.push(data[data.length - 1]);
    // console.log('group',group)
    const aryGroup: any = curve.map((p: Point) => ([p.x,p.y]));
    this.svg.append('path')
      .attr('d',lineGenerator(aryGroup))
      .attr('stroke', group.color)
      .attr('stroke-width', this.xCellScale(group.width))
      .attr('stroke-linecap', 'round')
      .attr('stroke-opacity',group.opacity)
      .attr('fill', 'none');
  }

  


  private toValueSortFlatGrid(grid: Cell[][]): Cell[]{
    const flatGrid: Cell[] = grid.reduce((acc, val) => acc.concat(val), []);
    flatGrid.sort((c1,c2)=>c1.value - c2.value)
    return flatGrid;
  }

  private valueGridToFlatGrid(grid: Cell[][], valueGrid: number[][]): Cell[]{
    const flatGrid: Cell[] = [];
     grid.forEach((row: Cell[], j) => {
        row.forEach((cell: Cell, i) => {
          flatGrid.push({
            ...cell,
            value: valueGrid[j][i],
          })
        });
    })
    // flatGrid.forEach((c) => console.log(c.value));
    flatGrid.sort((c1,c2) => c1.value - c2.value);
    return flatGrid;
  }

  private toAltRowFlatGrid(grid: Cell[][]): Cell[]{
    const flatGrid: Cell[] = [];
     grid.forEach((row: Cell[], j) => {
      if(j % 2 === 0){
        row.forEach((cell: Cell, i) => {
          let c = {...cell};
          // if(Math.random() > 0.9){
          //   if(j < (grid.length - 1)){
          //     c = {...grid[j + 1][i]};
          //   }
          // }
          flatGrid.push({...c})
        });
      }else{
        const revRow = row.reverse();
        revRow.forEach((cell: Cell, i) => {
          flatGrid.push({...cell})
        });
      }
    })
    return flatGrid;
  }


  private createGrid(dims: Dims){
    let index = 0;
    const grid = [];
    for(let i = 0; i < dims.height; i++){
      const row: Cell[] = [];
      for(let j = 0; j < dims.width; j++){
        row.push({
          index,
          row: i,
          col: j,
          origin: {
            x: j / dims.width,
            y: i / dims.height,
          },
          width: 1 / dims.width,
          height: 1 / dims.height,
          value: Math.tan(index / 18),
        });
        index++;
      }
      grid.push(row);
    }
    return grid;
  }



  public setupCanvas(){
    const canvas: HTMLElement = this.elementRef.nativeElement.querySelector('#canvas');
    canvas.innerHTML = '';
    const preview: HTMLElement = this.elementRef.nativeElement.querySelector('.preview');
    const {height} = preview.getBoundingClientRect();
    const padding = 0.1;
    const canvasDims: Dims = {
      width: 2400,
      height: 2400,
    }
    // const canvasDims: Dims = {
    //   width: Math.floor(height) * (1 - padding),
    //   height: Math.floor(height) * (1 - padding),
    // }

    this.xScale = scaleLinear().domain([0,1]).range([0,canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,canvasDims.height]);

    this.svg = select('#canvas')
      .append("svg")
      .attr('width', canvasDims.width)
      .attr('height', canvasDims.height)
      .style('background-color','black');
  }

  public setScales(dims: Dims){
    this.cellWidth = 1 / dims.width;
    this.cellHeight = 1 / dims.height;
    this.xCellScale = scaleLinear().domain([0,1]).range([0,this.xScale(this.cellWidth)]);
    this.yCellScale = scaleLinear().domain([0,1]).range([0,this.yScale(this.cellHeight)]);
  }

  private drawGrid(grid: Cell[]) {
    const cm = chroma.scale('Spectral')
    const cellGroup = this.svg.append('g')
      .attr('class', 'cell-group')
    const squares = cellGroup.selectAll('.square').data(grid)
    squares.exit().remove()
    squares.enter()
      .append('rect')
      .attr('class', 'square')
      .merge(squares)
      .attr('x', d => this.xScale(d.origin.x))
      .attr('y', d => this.yScale(d.origin.y))
      .attr('width',d => this.xScale(d.width))
      .attr('height',d => this.yScale(d.height))
      .attr('fill', d => cm(d.value).hex())
      .attr('stroke-width',0);
    squares.enter()
      .append("text")
      .attr('x', d => this.xScale(d.origin.x + d.width / 2))
      .attr('y', d => this.yScale(d.origin.y + d.height / 2))
      .attr("dy", ".35em")
      .style("font-size", `48px`)
      .style("text-anchor", "middle")
      .style("fill", 'black')
      .text((d,i) => Math.floor(d.value * 100))

  }

  public saveSvg(){
    let svg = document.getElementsByTagName("svg")[0];
    console.log('svg',svg)
    let id = `${uid()}.png`;
    let params = {backgroundColor: 'black', scale: 1};
    saveSvgAsPng(svg,id,params);
  }

}
