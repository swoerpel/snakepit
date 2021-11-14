import { Component, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import * as tome from 'chromotome';
import { scaleLinear, ScaleLinear, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { uid } from 'uid';
import { WolframService } from '../services/wolfram.service';
import { ColorPalette, Dims, Point } from '../shared/models';


// ideas
// draw a 2x2 grid of black and white 2 state patterns
// seperate svgs 

// to use N constant winged tile type,
// create N random wolfram patterns, same seed, different starting pattern
// use pattern sum grid as indexes for winged tile type
// this lets the wolfram pattern stay small
// the other option will be using totalistic

@Component({
  selector: 'app-sprawl',
  templateUrl: './sprawl.component.html',
  styleUrls: ['./sprawl.component.scss']
})
export class SprawlComponent implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public dirScale: ScaleLinear<number, number, never>;
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

  public gridPadding: Dims = {
    width: 0.1,
    height: 0.1,
  }

  constructor(
    private wolframService: WolframService,
  ) { }

  ngOnInit(): void {
    // console.log('tome',tome)
    this.setupCanvas();
    this.next();
  }

  public next(){
    // const lengths: number[] = [4,8,32];
    // const dirs: number[] = [0,0.2,.4,.6,.8,1];
    // const dirs: number[] = [];
    // for(let i = 0; i < 3; i++){
    //   dirs.push(Math.random());
    // }

    // for(let i = 0; i < 100; i++){
      // const gridSize: Dims = {
      //   width: 16,
      //   height: 4,
      // }
      // const padding: Point = {
      //   x: 0.1,
      //   y: 0.1,
      // }
      // let pw = 1 - 2 * padding.x;
      // let ph = 1 - 2 * padding.y;
      // const x = round(round(padding.x + Math.random() * pw),gridSize.width);
      // const y = round(round(padding.y + Math.random() * ph),gridSize.height);
      // const origin: Point = {x,y};
      // const line: Point[] = this.generateLine(origin,lengths,dirs);
      // this.drawLine(line);
    // }

    const origin = {x: 0.5, y: 0.5};

    // const petalCounts = [1,2,3,4,5,6,7,8,9,10];
    const petalCounts = [];
    for(let i = 0; i < 20; i++){
      petalCounts.push(i + 1);
    }
    

    petalCounts.forEach((petals: number) => {
      // const petals = 16;
      const radiusSteps = Math.floor(petals * 0.8);
      const flower: Point[][] = this.generateFlower(origin, petals, radiusSteps);
      flower.forEach((line: Point[]) => {
        this.drawLine(line);
      })
      
    })

  }

  public drawLine(line: Point[]){
    const lineGroup = this.svg.append('g');
    lineGroup.selectAll('circle').data(line)
      .enter()
      .append('circle')
      .attr('cx', d => this.xScale(d.x))
      .attr('cy', d => this.yScale(d.y))
      .attr('r', (d,i) => {
        const sc = i / line.length * 0.05;
        // const s = 0.002 + sc
        const s = sc * 1 / i * 0.5
        return this.xScale(s);
      })
      .attr('fill', 'white')
      // .attr('fill', (d,i) => i === 0 ? 'red': 'white')
  }

  public generateFlower(origin: Point, petals: number, radiusSteps: number): Point[][]{
    const lines: Point[][] = [];
    for(let i = 0; i < petals; i++){
      const dir = (i + 1) / petals;
      lines.push(this.generateLine(origin,[radiusSteps],[dir]));
    }
    return lines;
  }



  public generateLine(origin: Point, lengths: number[], dirs: number[]): Point[]{
    const dir = this.dirScale(dirs[Math.floor(Math.random() * dirs.length)]);    
    const step = 0.02;
    let line: Point[] = [];
    const l = lengths[Math.floor(Math.random() * lengths.length)];
    let r = 0;
    for(let i = 0; i < l; i++){
      line.push({
        x: origin.x + r * Math.cos(dir),
        y: origin.y + r * Math.sin(dir),
      })
      r += step;
    }
    return line;
  }

  public setupCanvas(){
    this.xScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.height]);
    this.dirScale = scaleLinear().domain([0,1]).range([0,2 * Math.PI]);
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
