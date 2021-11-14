import { Component, ElementRef, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import { curveBasis, line, scaleLinear, ScaleLinear, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { uid } from 'uid';
import { Point, Dims } from '../shared/models';

interface Ant {
  rowIndex: number;
  colIndex: number;
  path: AntCell[];
}

interface AntStyle{
  opacity: number;
  pathWidth: number;
  color: string;
}

interface AntCell{
  origin: Point;
  rowIndex: number;
  colIndex: number;
  weight: number;
}


@Component({
  selector: 'app-ant-field',
  templateUrl: './ant-field.component.html',
  styleUrls: ['./ant-field.component.scss']
})
export class AntFieldComponent implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public rScale: ScaleLinear<number, number, never>;

  constructor(
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    
    const dims: Dims = {
      width: 200,
      height: 10,
    }
    this.setupCanvas(dims);
    const grid: AntCell[][] = this.createGrid(dims);
    
    let startOptions = [
      0,
      // Math.floor(dims.width / 4),
      Math.floor(dims.width / 2),
      // Math.floor(3 * dims.width / 4),
      // dims.width - 1
    ]
    let opacityOptions = [
      // 1,
      0.5,
      // 0.25,
    ]
    let pathWidthOptions = [
      // 0.002,
      // 0.005,
      0.01,
      // 0.015,
      // 0.05,
    ]

    let starts = [];
    let opacities = [];
    let pathWidths = [];
    for(let i = 0; i < dims.width; i++){
      // if(i% 2 === 0){
      starts.push(0);
      // }//else{
        
      // }
      
      opacities.push(opacityOptions[i % opacityOptions.length]);
      pathWidths.push(pathWidthOptions[i % pathWidthOptions.length]);
    }

    let updateAntCount = 1000;
    for(let i = 0; i < updateAntCount; i++){
      let startCol = starts[i % starts.length];
      this.generateAntPath(grid,startCol);
    }    
    const spread = 24;
    let drawAntCount = 2000
    const colorCount = Math.floor(dims.width/4);
    let colors = this.createColors('Reds',colorCount);
    colors = colors.reverse();
    for(let i = 0; i < drawAntCount; i++){
      let startCol = starts[i % starts.length];
      let ant: Ant = this.generateAntPath(grid,startCol, spread);
      let style: AntStyle = {
        color: colors[i % colors.length],
        opacity: opacities[i % opacities.length],
        pathWidth: this.xScale(pathWidths[i % pathWidths.length]),
      }
      this.drawAntPath(ant, style);
    }    
    // this.drawGrid(flatten(grid),1,'red');


  }

  private generateAntPath(grid: AntCell[][], startColIndex: number, spread = 12){
    // choose center, left or right cell based on weights of those cells;
    

    const ant: Ant = {
      rowIndex: 0,
      colIndex: startColIndex,
      path: [{...grid[0][startColIndex]}],
    }
    ant.rowIndex += 1;
    while(ant.rowIndex < grid.length){
      const nextPoints: Point[] = [];
      for(let i = 0; i < spread; i++){
        nextPoints.push({x: ant.colIndex - i + 1, y: ant.rowIndex})
        nextPoints.push({x: ant.colIndex + i + 1, y: ant.rowIndex})
      }
      nextPoints.push({x: ant.colIndex, y: ant.rowIndex})
      try{
        const availableCells: AntCell[] = nextPoints
          .map((p: Point)=> grid[p.y][p.x])
          .filter((cell: AntCell)=> !!cell);

        const nextCell = availableCells.reduce((heaviest,curr) =>{
          if(curr.weight > heaviest.weight){
            return curr
          }
          return heaviest;
        }, availableCells[0]);
        ant.path.push(nextCell);
        grid[nextCell.rowIndex][nextCell.colIndex].weight -= 0.01
      
      
      ant.colIndex = nextCell?.colIndex;
    }catch{}
    ant.rowIndex++;
    }
    
    return ant;
  }

  private drawAntPath(ant: Ant, style: AntStyle){
    const lineGenerator = line()
    lineGenerator.curve(curveBasis)
    let data: Point[] = ant.path.map((p: AntCell) => ({
      x: this.xScale(p.origin.x),
      y: this.yScale(p.origin.y),
    }));
    // data = SmoothLine(data,4,0,0.25);
    let aryGroup: any = data.map((p: Point) => ([p.x,p.y]));
    this.svg.append('path')
      .attr('d',lineGenerator(aryGroup))
      .attr('stroke', style.color)
      .attr('stroke-width', style.pathWidth)
      .attr('stroke-linecap', 'round')
      .attr('stroke-opacity',style.opacity)
      .attr('fill', 'none');
  }

  private createColors(palette: string | string[], count: number){
    const cm = chroma.scale(palette as chroma.Chromable);
    let colors = [];
    for(let i = 0; i < count; i++){
      colors.push(cm(i/(count - 1)).hex())
    }
    return colors;
  }

  private createGrid(dims: Dims){
    let index = 0;
    const grid = [];

    const cellWidth = 1 / dims.width;
    const cellHeight = 1 / dims.height;

    for(let i = 0; i < dims.height; i++){
      const row: AntCell[] = [];
      for(let j = 0; j < dims.width; j++){
        row.push({
          origin: {
            x: j / dims.width + cellWidth / 2,
            y: i / dims.height + cellHeight / 2,
          },
          rowIndex: i,
          colIndex: j,
          weight: 1,
        });
        index++;
      }
      grid.push(row);
    }
    return grid;
  }

  private drawGrid(grid: AntCell[], opacity: number, color: string) {
    const cm = chroma.scale('RdBu')
    const cellGroup = this.svg.append('g')
      .attr('class', 'cell-group')
    const circles = cellGroup.selectAll('.circle').data(grid)
    circles.exit().remove()
    circles.enter()
      .append('circle')
      .attr('class', 'circle')
      .merge(circles)
      .attr("r", d => this.rScale(d.weight / 2) > 0 ? this.rScale(d.weight / 2) : 0.01 )
      .attr('cx', d => this.xScale(d.origin.x))
      .attr('cy', d => this.yScale(d.origin.y))
      .attr('fill', d => color)
      .attr('fill-opacity', opacity)
      // .attr('fill', d => cm(d.value).hex())
      .attr('stroke-width',0);
    // squares.enter()
    //   .append("text")
    //   .attr('x', d => this.xScale(d.origin.x + d.width / 2))
    //   .attr('y', d => this.yScale(d.origin.y + d.height / 2))
    //   .attr("dy", ".35em")
    //   .style("font-size", `48px`)
    //   .style("text-anchor", "middle")
    //   .style("fill", 'black')
    //   .text((d,i) => Math.floor(d.value * 100))
  }

  public setupCanvas(dims: Dims){
    const canvas: HTMLElement = this.elementRef.nativeElement.querySelector('#canvas');
    canvas.innerHTML = '';
    const preview: HTMLElement = this.elementRef.nativeElement.querySelector('.preview');
    const {height} = preview.getBoundingClientRect();
    const padding = 0.1;
    const canvasDims: Dims = {
      width: 4800,
      height: 4800,
    }

    this.xScale = scaleLinear().domain([0,1]).range([0,canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,canvasDims.height]);
    this.rScale = scaleLinear().domain([0,1]).range([0,canvasDims.width / dims.width]);

    this.svg = select('#canvas')
      .append("svg")
      .attr('width', canvasDims.width)
      .attr('height', canvasDims.height)
      .style('background-color','black');
  }
  
  public saveSvg(){
    let svg = document.getElementsByTagName("svg")[0];
    console.log('svg',svg)
    let id = `${uid()}.png`;
    let params = {backgroundColor: 'black', scale: 1};
    saveSvgAsPng(svg,id,params);
  }

}
