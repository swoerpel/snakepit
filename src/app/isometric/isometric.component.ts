import { Component, OnInit } from '@angular/core';
import { scaleLinear, ScaleLinear, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { uid } from 'uid';
import { ColorService } from '../services/color.service';
import { DrawingService } from '../services/drawing.service';
import { PointService } from '../services/point-generator.service';
import { Dims, Point } from '../shared/models';

@Component({
  selector: 'app-isometric',
  templateUrl: './isometric.component.html',
  styleUrls: ['./isometric.component.scss']
})
export class IsometricComponent implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;

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
    private colorService: ColorService,
    private drawingService: DrawingService,
    private pointService: PointService,
  ) { }

  ngOnInit(): void {
    this.setupCanvas();

    const cartesianToIsometric = (point: Point): Point => {
      const isoPoint = {
        x: point.x - point.y,
        y: (point.x + point.y) / 2,
      }
      return isoPoint;
    }
    const cartesianToHyperbolic = ({x,y}: Point): Point => {
      const hyperPoint = {
        x: Math.log( Math.sqrt(x/y)),
        y: Math.sqrt(x * y),
      }
      return hyperPoint;
    }

  
    const N = 80;

    const startPoints = this.pointService.generateLine(
      {x: 0,y: 0},
      {x: 0.9,y: 0.9},
      N,
    )
    const endPoints = this.pointService.generateLine(
      {x: 0.9,y: 0},
      {x: 0.95,y: 0.95},
      N,
    )

    for(let i = 0; i < N; i++){
      const start = startPoints[i];
      const end =   endPoints[i];
      const line: Point[] = this.pointService.generateLine(start,end,10)
      
      const isoLine = line.map(cartesianToHyperbolic);
      console.log('isoLine',isoLine);
      const radius = 0.002;
      this.drawingService.drawPoints(
        line,
        this.svg,
        this.xScale,
        this.yScale,
        radius,
        'white'
      );
      this.drawingService.drawPoints(
        isoLine,
        this.svg,
        this.xScale,
        this.yScale,
        radius,
        'red'
      );
    }

    

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
