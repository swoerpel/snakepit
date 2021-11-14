import { Component, ElementRef, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import { curveBasis, line, scaleLinear, ScaleLinear, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { uid } from 'uid';
import { Dims, Point, Range } from '../shared/models';
import { arrayRotate, flatten, round } from '../state/helpers';


interface Ant {
  dir: Dir;
  position: Point;
  steps: number;
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

enum Dir {
  E = 'East',
  NE = 'NorthEast',
  N = 'North',
  NW = 'NorthWest',
  W = 'West',
  SW = 'SouthWest',  
  S = 'South',
  SE = 'SouthEast',
}



const pointDirections: Point[] = [
  {x: 1, y: 0},
  {x: 1, y: 1},
  {x: 0, y: 1},
  {x: -1, y: 1},
  {x: -1, y: 0},
  {x: -1, y: -1},
  {x: 0, y: -1},
  {x: 1, y: -1},
];

const directionToPoint: Record<Dir,Point> = {
  [Dir.N]: pointDirections[2],
  [Dir.NW]: pointDirections[3],
  [Dir.W]: pointDirections[4],
  [Dir.SW]: pointDirections[5],
  [Dir.S]: pointDirections[6],
  [Dir.SE]: pointDirections[7],
  [Dir.E]: pointDirections[0],
  [Dir.NE]: pointDirections[1],
}

const antVisionMap: Record<Dir,Point[]> = {
  [Dir.N]: arrayRotate([...pointDirections],0).slice(0,5),
  [Dir.NW]: arrayRotate([...pointDirections],1).slice(0,5),
  [Dir.W]: arrayRotate([...pointDirections],2).slice(0,5),
  [Dir.SW]: arrayRotate([...pointDirections],3).slice(0,5),
  [Dir.S]: arrayRotate([...pointDirections],4).slice(0,5),
  [Dir.SE]: arrayRotate([...pointDirections],5).slice(0,5),
  [Dir.E]: arrayRotate([...pointDirections],6).slice(0,5),
  [Dir.NE]: arrayRotate([...pointDirections],7).slice(0,5),
}



@Component({
  selector: 'app-ant-field-v2',
  templateUrl: './ant-field-v2.component.html',
  styleUrls: ['./ant-field-v2.component.scss']
})
export class AntFieldV2Component implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public rScale: ScaleLinear<number, number, never>;
  public cellScale: ScaleLinear<number, number, never>;

  constructor(
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    
    const dims: Dims = {
      width: 31,
      height: 31,
    }
    this.setupCanvas(dims);
    const grid: AntCell[][] = this.createGrid(dims);
    const dirs: Dir[] = [];
    for(let i = 0; i < 10; i++){
      dirs.push(Dir.N);
    }

    for(let i = 0; i < dirs.length; i++){
      const origin: Point = {
        x: 0,
        y: 0,
      }
      let startDirection: Dir = dirs[i % dirs.length];
      let steps: number = 100;
      this.generateAntPath(grid,origin,steps,startDirection, false)
    }

    const ants: Ant[] = []
    const styles: AntStyle[] = [];
    
    const count = 40;
    const colorCount = count/2;//dirs.length;
    const palettes = Object.keys(chroma.brewer);
    const randPalette = palettes[Math.floor(Math.random() * palettes.length)]
    const colors = this.createColors(randPalette,colorCount);

    const widthCount = 6;
    const startWidth = 2;
    const endWidth = 0.2;
    const widthStep = (startWidth - endWidth) / widthCount;
    const widths: number[] = [];
    for(let i = 0; i < widthCount; i++){
      widths.push(startWidth - widthStep * i)
    }

    const startPoints: Point[] = [
      {x: 0, y: 0},
      {x: dims.width - 1, y: 0},
      {x: dims.width - 1, y: dims.height - 1},
      {x: 0, y: dims.height - 1},
    ]

    for(let i = 0; i < count; i++){

      const origin: Point = startPoints[i % startPoints.length];
      let startDirection: Dir = Dir.N;
      let steps: number = 20;
      ants.push(this.generateAntPath(grid,origin,steps,startDirection, false));
      styles.push({
        // opacity: 1,
        opacity: i % 2 === 1 ? 1 : 0.5,
        color: colors[i % colors.length],
        // pathWidth: this.cellScale(0.8),
        pathWidth: this.cellScale(widths[i % widths.length])
      })
    }
    // this.drawGrid(flatten(grid),0.1,'white');

    ants.forEach((ant,i) => {
      this.drawAntPath(ant,styles[i]);
    })

  }

  private generateAntPath(
    grid: AntCell[][], 
    origin: Point,
    steps: number,
    dir: Dir,
    randWeighted: boolean
  ){
    const startCell: AntCell = grid[origin.y][origin.x];
    const ant: Ant = {
      position: origin,
      dir,
      steps,
      path: [startCell],
    }
    while(ant.steps > 0){
      const availableCells: AntCell[] = antVisionMap[ant.dir]
        .map((p: Point)=> {
          try {
            return grid[ant.position.y + p.y][ant.position.x + p.x]
          }catch{
            return null;
          }
        })
        .filter((cell: AntCell)=> !!cell);
      if(availableCells.length === 0){
        // ants can get stuck in corners
        ant.steps = 0;
        break;
      }

      const nextCell = this.calculateNextCell(ant, availableCells, randWeighted);
     
      // console.log("randCellIndex",randCellIndex)
      const xStep = nextCell.colIndex - ant.position.x;
      const yStep = nextCell.rowIndex - ant.position.y;
      const nextDir: Dir = Object.entries(directionToPoint).find(([_,stepPoint]:[Dir, Point]) => 
        stepPoint.x === xStep && stepPoint.y === yStep)[0] as Dir;

      // update ant
      ant.path.push(nextCell);
      ant.position.x = nextCell.colIndex;
      ant.position.y = nextCell.rowIndex;
      ant.dir = nextDir
      ant.steps--;

      grid[ant.position.y][ant.position.x].weight -= 0.01;

    }
    // this.drawGrid(ant.path,1,'green');

    return ant;
  }

  private calculateNextCell(ant: Ant, availableCells: AntCell[], randWeighted  = true): AntCell{
    if(randWeighted){
      const totalWeight = availableCells.reduce((sum,{weight}) => sum + weight, 0);
      const ranges: Range[] = availableCells.reduce((r,cell,i)=>{
        const cellWeightStep = round(cell.weight / totalWeight)
        if(i === 0){
          r.push({
            low: 0,
            high: cellWeightStep,
          });
        }else{
          r.push({
            low: r[i - 1].high,
            high: round(r[i - 1].high + cellWeightStep)
          })
        }
        return r
      },[]);
      const randValue = Math.random();
      const randCellIndex = ranges.findIndex(({low,high}) => randValue >= low && randValue < high);
      return availableCells[randCellIndex];
    }else {
      const defaultPoint: Point = {
        x: ant.position.x + directionToPoint[ant.dir].x,
        y: ant.position.y + directionToPoint[ant.dir].y,
      }
      const defaultCell = availableCells.find(({rowIndex,colIndex}) => 
        (rowIndex === defaultPoint.y) && (colIndex === defaultPoint.x)
      );
      const nextCell = availableCells.reduce(
        (heaviest,curr) => (curr.weight >= heaviest.weight) ? curr : heaviest, 
        defaultCell || availableCells[Math.floor(Math.random() * availableCells.length)]
      );
      return nextCell
    }
    
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
          // weight: Math.sin(i * j % 3),
          weight: 1,
          // weight: Math.random(),
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
      width: 2400,
      height: 2400,
    }

    this.xScale = scaleLinear().domain([0,1]).range([0,canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,canvasDims.height]);
    this.rScale = scaleLinear().domain([0,1]).range([0,canvasDims.width / dims.width]);
    this.cellScale = scaleLinear().domain([0,1]).range([0,canvasDims.width / dims.width]);

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
