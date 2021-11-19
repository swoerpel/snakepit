import { Component, OnInit } from '@angular/core';
import { saveSvgAsPng } from 'save-svg-as-png';
import { scaleLinear, ScaleLinear, select } from 'd3';
import { uid } from 'uid';
import { DrawingService } from '../services/drawing.service';
import { FractalService } from '../services/fractal.service';
import { Dims, Point } from '../shared/models';

@Component({
  selector: 'app-fractal',
  templateUrl: './fractal.component.html',
  styleUrls: ['./fractal.component.scss']
})
export class FractalComponent implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;

  public canvasDims: Dims = {
    width: 2400,
    height: 2400,
  }

  public colorLight = '#fff9df';
  public colorDark = '#222020';
  public backgroundColor = this.colorDark;

  constructor(
    private fractalService: FractalService,
    private drawingService: DrawingService,
  ) { }

  ngOnInit(): void {
    this.setupCanvas();
    const fractalPoints: Point[] = this.fractalService.generateIFSFractal();
    this.drawingService.drawPoints(fractalPoints,this.svg,this.xScale,this.yScale);
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

  public save(){
    let svg = document.getElementsByTagName("svg")[0];
    let id = `${uid()}.png`;
    console.log('svg',id,svg);
    let params = {backgroundColor: this.backgroundColor, scale: 3};
    saveSvgAsPng(svg,id,params);
  }

}

