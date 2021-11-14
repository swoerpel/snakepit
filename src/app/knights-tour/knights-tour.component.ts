import { Component, ElementRef, OnInit } from '@angular/core';
import { line, scaleLinear, ScaleLinear, select } from 'd3';
import { SmoothLine } from '../image-filter/image-filter.helpers';
import { Knight, Cell, CellState } from '../image-filter/image-filter.models';
import { Dims, Point } from '../shared/models';


// see if cells can be updated instead of redrawn
// create input for grid population




const params = {
  grid:<Dims> {
    width: 8,
    height: 8,
  },
}


@Component({
  selector: 'app-knights-tour',
  templateUrl: './knights-tour.component.html',
  styleUrls: ['./knights-tour.component.scss']
})
export class KnightsTourComponent implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public cellWidth: number;
  public cellHeight: number;

  public knight: Knight;

  public grid: Cell[][];

  constructor(
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.setupCanvas();
    this.setupGrid();
    // this.setupKnight();
    // this.jumpKnight();
    // this.drawGrid();

    // this.placeKnight();
    // for(let i = 0; i < 64; i++){
    //   this.jumpKnight();
    // }
  }
  
  public setupKnight(){
    this.knight = {
      position: {
        x: 0,
        y: 0,
      },
      jumpVector: {
        x: 2,
        y: 1,
      },
      path: [],
    }
  }

  public jumpKnight(){
    const kx = this.knight.position.x;
    const ky = this.knight.position.y;
    const vx = this.knight.jumpVector.x;
    const vy = this.knight.jumpVector.y;

    let options = [];

    try{options.push(this.grid[ky - vy][kx + vx]);}catch{}
    try{options.push(this.grid[ky - vx][kx + vy]);}catch{}

    try{options.push(this.grid[ky - vx][kx - vy]);}catch{}
    try{options.push(this.grid[ky - vy][kx - vx]);}catch{}

    try{options.push(this.grid[ky + vy][kx - vx]);}catch{}
    try{options.push(this.grid[ky + vx][kx - vy]);}catch{}

    try{options.push(this.grid[ky + vx][kx + vy]);}catch{}
    try{options.push(this.grid[ky + vy][kx + vx]);}catch{}

    options = options
      .filter(cell => !!cell)
      .filter(cell => cell.state === CellState.Open);

    if(options.length === 0){
      // console.log('NO OPTIONS, KNIGHT AT', kx,ky, this.grid[ky][kx].value)
      this.drawGrid();
      this.drawKnightPath();
      return false;
    }
    this.grid[ky][kx].state = CellState.Closed;
    this.knight.path.push({...this.grid[ky][kx]})
    const nextCell = options.reduce((max,curr) => curr.value > max.value ? curr : max);
    this.knight.position = {
      x: nextCell.col,
      y: nextCell.row,
    }
    this.drawGrid();
    this.drawKnightPath();
  }


  public drawKnightPath(){
    const lineGenerator = line()
    const data: Point[] = this.knight.path.map((cell: Cell) => ({
      x: this.xScale(cell.origin.x + this.cellWidth / 2),
      y: this.yScale(cell.origin.y + this.cellHeight / 2),
    }));

    const n = 7;
    const groups = [];
    for(let i = 0; i < (data.length - n); i++){
      const pointGroup = [];
      for(let j = 0; j < n; j++){
        pointGroup.push({
          x: data[i + j].x,
          y: data[i + j].y,
        })
      }

      const curve = SmoothLine(pointGroup,8,0,0.25);
      // console.log('curve',curve)
      groups.push(curve);
    }

    groups.forEach((group: any, i) => {
      // console.log('G',group)
      const aryGroup = group.map((p: Point) => ([p.x,p.y]));
      this.svg.append('path')
        .attr('d',lineGenerator(aryGroup))
        .attr('stroke', i % 2 == 0 ? 'black' : 'orange')
        .attr('stroke-width', 20)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none');
      this.svg.append('path')
        .attr('d',lineGenerator(aryGroup))
        .attr('stroke', i % 2 == 0 ? 'blue' : 'purple')
        .attr('stroke-width', 10)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none');
    })

  }


  public setupGrid(){
    this.grid = [];
    let index = 0;
    const cells = [];
    for(let i = 0; i < params.grid.height; i++){
      const row = [];
      for(let j = 0; j < params.grid.width; j++){
        const cell: Cell = {
          index,
          row: i,
          col: j,
          origin: {
            x: j / params.grid.width,
            y: i / params.grid.height,
          },
          // value: Math.floor(Math.random() * 8),
          // value: index + 1,
          value: index % 5,
          state: CellState.Open,
        };
        // const g = this.svg.append('g');
        const c = this.svg.append('rect')
          .attr('x',this.xScale(cell.origin.x))
          .attr('y',this.yScale(cell.origin.y))
          .attr('width',this.xScale(this.cellWidth))
          .attr('height',this.xScale(this.cellHeight))
          .attr('fill',cell.state === CellState.Open ? 'lightblue' : 'red');

        c.row = i;
        c.col = j;
        c.index = index;
        c.value = index % 5;
        c.state = CellState.Open;
        cells.push(c);
        index++;
      }
      this.grid.push(row);
    }
    cells[0].attr('fill','red')
    cells[0].state = CellState.Closed;
    console.log("cells[0]",cells[0])
  }


  
  public drawGrid(){
    this.svg.innerHTML = '';
    this.grid.forEach((row: Cell[]) => {
      row.forEach((cell: Cell) => {
        const g = this.svg.append('g');
        g.append('rect')
          .attr('x',this.xScale(cell.origin.x))
          .attr('y',this.yScale(cell.origin.y))
          .attr('width',this.xScale(this.cellWidth))
          .attr('height',this.xScale(this.cellHeight))
          .attr('fill',cell.state === CellState.Open ? 'lightblue' : 'red');
        g.append('text')
          .attr('x',this.xScale(cell.origin.x + this.cellWidth / 2))
          .attr('y',this.yScale(cell.origin.y + this.cellHeight / 2))
          .style("font-size", "2rem")
          .attr("dx", "-1rem")
          .attr("dy", "1rem")
          .text(cell.value);
      })
    })
  }

  public setupCanvas(){
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

    this.cellWidth = 1 / params.grid.width;
    this.cellHeight = 1 / params.grid.height;

    this.svg = select('#canvas')
      .append("svg")
      .attr('width', canvasDims.width)
      .attr('height', canvasDims.height)
      .style('background-color','white');
  }
  
  public saveSvg(){
    let svg = document.getElementsByTagName("svg")[0];
    console.log('svg',svg)
    // let id = `${makeid()}.png`;
    // let params = {scale: 1, backgroundColor: this.color.background};
    // saveSvgAsPng(svg,id,params);
  }

}
