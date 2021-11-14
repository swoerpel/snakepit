import { Component, ElementRef, OnInit } from '@angular/core';
import { line, ScaleLinear, scaleLinear, select } from 'd3';
import { map, tap } from 'rxjs/operators';
import { Dims, Point } from '../shared/models';
import { generateImageCells, loadImage, SmoothLine } from './image-filter.helpers';
import { Cell, CellState, Knight,} from './image-filter.models';




@Component({
  selector: 'app-image-filter',
  templateUrl: './image-filter.component.html',
  styleUrls: ['./image-filter.component.scss']
})
export class ImageFilterComponent implements OnInit {

  public imagePath = '../../assets/tree.jpg';

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public cellWidth: number;
  public cellHeight: number;

  public knight: Knight;

  public grid: Cell[][];

  public gridDims: Dims = {
    width: 10,
    height: 10,
  }

  constructor() { }

  ngOnInit(): void {
    loadImage(this.imagePath).pipe(
      map((image: HTMLImageElement) => {
        const canvas = document.querySelector('canvas')
        const context = canvas.getContext('2d')
        const width = image.width
        const height = image.height
        context.canvas.width = width;
        context.canvas.height = height;

        this.xScale = scaleLinear().domain([0,1]).range([0,width]);
        this.yScale = scaleLinear().domain([0,1]).range([0,height]);
    
        this.cellWidth = this.xScale(1 / this.gridDims.width);
        this.cellHeight = this.yScale(1 / this.gridDims.height);

        context.drawImage(image, 0, 0)
        this.svg = select('#pixelated').append('svg')
          .attr('width', width)
          .attr('height', height)
          .style('background-color','white')
          .append('g')
        return [image,context];
      }),
      tap(([image, context]: [HTMLImageElement, CanvasRenderingContext2D]) => {
        this.grid = generateImageCells(image, context, this.cellWidth, this.cellHeight);
        this.grid = this.setCellValues(this.grid);
        
        const flatGrid: Cell[] = this.grid.reduce((acc, val) => acc.concat(val), []);
        // flatGrid.forEach(c => console.log(c.value))
        this.drawPixelatedImage(flatGrid);
        this.setupKnight();
        for(let i = 0; i < 64; i++){
          this.jumpKnight();
        }
      }),
    ).subscribe();

  }

  private setCellValues(grid: Cell[][], key: string = 'hsl_lightness'): Cell[][]{
    // const linearGrid = cells.sort((a,b) => a[key] - b[key]);
    return grid.map((row: Cell[]) => row.map(cell => ({
      ...cell,
      value: Math.floor(cell[key] * 100)
    })))
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
      console.log('NO OPTIONS, KNIGHT AT', kx,ky, this.grid[ky][kx].value)
      // this.drawGrid();
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
    // this.drawGrid();
    this.drawKnightPath();
  }


  public drawKnightPath(){
    const lineGenerator = line()
    const data: Point[] = this.knight.path.map((cell: Cell) => ({
      x: cell.origin.x + this.cellWidth / 2,
      y: cell.origin.y + this.cellHeight / 2,
    }))//.map((p: Point) => ([p.x,p.y]));

    // const n = 7;
    // const groups = [];
    // for(let i = 0; i < (data.length - n); i++){
    //   const pointGroup = [];
    //   for(let j = 0; j < n; j++){
    //     pointGroup.push({
    //       x: data[i + j].x,
    //       y: data[i + j].y,
    //     })
    //   }

      const curve = SmoothLine(data,8,0,0.25);
      // console.log('curve',curve)

    // groups.forEach((group: any, i) => {
      // console.log('G',group)
      // const aryGroup = group.map((p: Point) => ([p.x,p.y]));
      const aryGroup: any = curve.map((p: Point) => ([p.x,p.y]));
      this.svg.append('path')
        .attr('d',lineGenerator(aryGroup))
        .attr('stroke', 'black')
        .attr('stroke-width', 20)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none');
      // this.svg.append('path')
      //   .attr('d',lineGenerator(aryGroup))
      //   .attr('stroke', i % 2 == 0 ? 'blue' : 'purple')
      //   .attr('stroke-width', 10)
      //   .attr('stroke-linecap', 'round')
      //   .attr('fill', 'none');
    // })

  }



  private drawPixelatedImage(grid: Cell[]) {
    const cellGroup = this.svg.append('g')
          .attr('class', 'cell-group')
    const squares = cellGroup.selectAll('.square').data(grid)
    squares.exit().remove()
    squares.enter()
      .append('rect')
      .attr('class', 'square')
      .merge(squares)
      .attr('x', d => d.origin.x)
      .attr('y', d => d.origin.y)
      .attr('width', this.cellWidth)
      .attr('height', this.cellHeight)
      .attr('fill', d => d.rgb)
      .attr('stroke-width',0);
    squares.enter()
      .append("text")
      .attr("x", d => d.origin.x + this.cellWidth / 2)
      .attr("y", d => d.origin.y + this.cellHeight / 2)
      .attr("dy", ".35em")
      .style("font-size", `48px`)
      .style("text-anchor", "middle")
      .style("fill", 'black')
      .text((d,i) => d.value.toString())
  }

}

