import { Component, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import { scaleLinear, ScaleLinear, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { uid } from 'uid';
import { ColorService } from '../services/color.service';
import { DrawingService } from '../services/drawing.service';
import { QuadTreeService } from '../services/quad-tree.service';
import { QuadTree } from '../services/quadtree';
import { Dims, Point, Rect } from '../shared/models';
import { getRadialVertices, shuffle } from '../state/helpers';



@Component({
  selector: 'app-quadtree',
  templateUrl: './quadtree.component.html',
  styleUrls: ['./quadtree.component.scss']
})
export class QuadtreeComponent implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;

  public colorDark = '#222020';
  public backgroundColor = this.colorDark;

  public canvasDims: Dims = {
    width: 2400,
    height: 2400,
  }

  public quadTreesDrawn: number = 0;
  
  constructor(
    private quadTreeService: QuadTreeService,
    private colorService: ColorService,
    private drawingService: DrawingService,
  ) { }

  ngOnInit(): void {
    // console.log('tome',tome)
    this.setupCanvas();
    let circleA: Point[] = getRadialVertices({x: 0.5, y: 0.5},0.4,200);
    let circleB: Point[] = getRadialVertices({x: 0.5, y: 0.5},0.2,200);
    let points = circleA.concat(circleB);
    let qTree: QuadTree = this.quadTreeService.generateQuadTree(points);
    let rects: Rect[] = this.quadTreeService.getRectsFromQuadTree(qTree);
    rects = rects.map(rect => ({...rect,value: Math.random()}));
    const cm = chroma.scale('Oranges');
    this.drawingService.drawRects(rects,this.svg,this.xScale,this.yScale,cm);
    // this.drawingService.drawPoints(points,this.svg,this.xScale,this.yScale);
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
