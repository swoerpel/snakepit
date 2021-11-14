import { Component, OnInit } from '@angular/core';
import { curveCardinal, curveNatural, easeExpIn, easeLinear, interpolate, line, scaleLinear, ScaleLinear, select } from 'd3';
import { rotate, round } from '../state/helpers';
import * as chroma from 'chroma.ts';
import {cloneDeep} from 'lodash';
import { Point, Dims } from '../shared/models';

interface Petal {
  index: number;
  fill: string;
  opacity: number;
  radius: number;
  tailRadius: number;
  angle: number
}


interface Ring{
  name: string;

  origin: Point;

  prevRadius: number;
  currRadius: number;

  prevRingRotation: number;
  currRingRotation: number;

  prevPetalRotation: number;
  currPetalRotation: number;

  prevPetalRotationStep: number;
  currPetalRotationStep: number;

  petals: number;

  prevPetalRadius: number;
  currPetalRadius: number;

  prevPetalTailRadius: number;
  currPetalTailRadius: number;
  
  color: string;
}

interface RingChanges {
  ringRotation?: number;
  radius?: number;
  palette: string;
  petalRotation?: Function;
  petalRotationStep?: Function;
  petalRadius?: Function;
  petalTailRadius?: Function;
}


interface Circle{
  currTheta: number;
  prevTheta: number;
  fillRadius: number;
  originRadius: number;
  fillColor: string;
}


@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public rScale: ScaleLinear<number, number, never>;

  public defaultRing: Ring;
  public ringNames: string[];

  public defaultPetalTailRadiusInterpolate = (i, scale = 1) => 0.25 * scale - i * 0.05 * scale;
  public defaultPetalRadiusInterpolate = (i, scale = 1) => 0.125 * scale - i * 0.025 * scale;
  public defaultPetalColorInterpolate = (cm,i) => cm(i / (this.ringNames.length - 1)).hex();
  
  public defaultRingGroup: Record<string, Ring> = {};
  public ringGroup: Record<string, Ring> = {};

  public circles: Circle[];

  constructor() { }

  ngOnInit(): void {
    this.setupCanvas();

    this.defaultRing = {
      name: '',
      origin: {x: 0.5,y: 0.5},
      prevRadius: 0.5,
      currRadius: 0.5,
      petals: 8,
      prevPetalRadius: 0.06,
      currPetalRadius: 0.06,
      prevPetalTailRadius: 0.12,
      currPetalTailRadius: 0.12,
      prevRingRotation: 0,
      currRingRotation: 0,
      prevPetalRotation: 0,
      currPetalRotation: 0,
      prevPetalRotationStep: 0,
      currPetalRotationStep: 0,
      color: 'red',
    }
    const cm = chroma.scale('Blues')

    this.ringNames = ['a','b','c','d','e','f']
    this.ringNames.forEach((name: string, i) => {
      this.defaultRingGroup[name] = {
        ...this.defaultRing,
        name,
        currPetalTailRadius: this.defaultPetalTailRadiusInterpolate(i),
        prevPetalTailRadius: this.defaultPetalTailRadiusInterpolate(i),
        currPetalRadius: this.defaultPetalRadiusInterpolate(i),
        prevPetalRadius: this.defaultPetalRadiusInterpolate(i),
        color: this.defaultPetalColorInterpolate(cm,i),
      }
    })
    this.ringGroup = cloneDeep(this.defaultRingGroup);

    this.ringNames.forEach((name) => {
      const ring: Ring = {...this.ringGroup[name]};
      const petals: Petal[] = this.createPetals(ring);
      this.update(petals,ring);
    })

    // setInterval(()=>{
    //   this.changeRingGroup();
    // },1000)

  }


  public changeRingGroup(setting = null){
    // let changes: RingChanges;
    const palettes = ['OrRd', 'PuBu', 'BuPu', 'Oranges', 'BuGn', 'YlOrBr', 'YlGn', 'Reds', 'RdPu', 'Greens', 'YlGnBu', 'Purples', 'GnBu', 'Greys', 'YlOrRd', 'PuRd', 'Blues', 'PuBuGn', 'Viridis', 'Spectral', 'RdYlGn', 'RdBu', 'PiYG', 'PRGn', 'RdYlBu', 'BrBG', 'RdGy', 'PuOr']
    // console.log('palettes',palettes)

    const ringRotations = [0,45,90,180,-45,-90,-180];
    const petalRotations = [0,45,90,360/8];
    const randPetalRotation = petalRotations[Math.floor(Math.random() * petalRotations.length)];
    const ringRadii = [0.25,0.4,0.5,0.6];
    const petalTailRadiusScales = [1,2,3,4];
    const randPetalTailRadiusScale = petalTailRadiusScales[Math.floor(Math.random() * petalTailRadiusScales.length)];
    const petalRadiusScales = [1,1.25,0.75,1.5];
    const randPetalRadiusScale = petalRadiusScales[Math.floor(Math.random() * petalRadiusScales.length)];
    const petalRotationSteps = [0,30,90,180];
    const randPetalRotationStep = petalRotationSteps[Math.floor(Math.random() * petalRotationSteps.length)];
    const changes: RingChanges = {
      ringRotation: ringRotations[Math.floor(Math.random() * ringRotations.length)],
      radius: ringRadii[Math.floor(Math.random() * ringRadii.length)],
      palette: palettes[Math.floor(Math.random() * palettes.length)],
      petalRotation: (i) => randPetalRotation,
      petalRotationStep: (i) => i * randPetalRotationStep,
      petalRadius: (i) => this.defaultPetalRadiusInterpolate(i,randPetalRadiusScale),
      petalTailRadius: (i) => this.defaultPetalTailRadiusInterpolate(i,randPetalTailRadiusScale),
    }
    console.log("changes.palette",changes.palette)
    this.updateRingGroup(changes);
  }

  public resetRingGroup(){
    const changes = {
      palette: 'RdBu',
    }
    this.updateRingGroup(changes);
  }

  public updateRingGroup(changes: RingChanges){

    const cm = chroma.scale(changes.palette);
    this.ringNames.forEach((name,i) => {

      this.ringGroup[name].prevRingRotation = this.ringGroup[name].currRingRotation;
      this.ringGroup[name].currRingRotation += (!changes?.ringRotation) ? this.defaultRing.currRingRotation : changes.ringRotation;

      this.ringGroup[name].prevRadius = this.ringGroup[name].currRadius;
      this.ringGroup[name].currRadius = (!changes?.radius) ? this.defaultRing.currRadius : changes.radius;

      this.ringGroup[name].prevPetalRotation = this.ringGroup[name].currPetalRotation;
      this.ringGroup[name].currPetalRotation = (!changes.petalRotation) ? this.defaultRing.currPetalRotation : changes.petalRotation(i),

      this.ringGroup[name].prevPetalRotationStep = this.ringGroup[name].currPetalRotationStep;
      this.ringGroup[name].currPetalRotationStep = (!changes?.petalRotationStep) ? this.defaultRing.currPetalRotationStep : changes.petalRotationStep(i);

      this.ringGroup[name].prevPetalRadius = this.ringGroup[name].currPetalRadius;
      this.ringGroup[name].currPetalRadius = (!changes?.petalRadius) ? this.defaultPetalRadiusInterpolate(i) : changes.petalRadius(i);

      this.ringGroup[name].prevPetalTailRadius = this.ringGroup[name].currPetalTailRadius;
      this.ringGroup[name].currPetalTailRadius = (!changes?.petalTailRadius) ? this.defaultPetalTailRadiusInterpolate(i) : changes.petalTailRadius(i);

      this.ringGroup[name].color = this.defaultPetalColorInterpolate(cm,i);
    })
    this.ringNames.forEach((name) => {
      const ring: Ring = this.ringGroup[name];
      const petals: Petal[] = this.createPetals(ring);
      this.update(petals,ring);
    })
  }

  private createPetals(ring: Ring): Petal[]{
    const petals: Petal[] = [];
    for(let i = 0; i < ring.petals; i++){
      petals.push({
        index: i,
        opacity: 1,
        radius: ring.currPetalRadius,
        tailRadius: ring.currPetalTailRadius,
        fill: ring.color,
        angle: (360 * i) / ring.petals
      })
    }
    return petals;
  }

  private generatePetalPoints(origin: Point, radius: number, tailRadius: number, rotation: number): Point[]{
    const pLeft: Point = { x: origin.x - radius, y: origin.y};
    const pRight: Point = { x: origin.x + radius, y: origin.y};
    const pDown: Point = { x: origin.x, y: origin.y + radius};
    const pUp: Point = { x: origin.x, y: origin.y - tailRadius};
    return [pUp,pLeft,pDown,pRight,pUp].map((point: Point) => rotate(origin,point,rotation));
  }

  public update(petals: Petal[],ring: Ring){
    const xScale = this.xScale;
    const yScale = this.yScale;
    const generatePetalPoints = this.generatePetalPoints;
    const lineGenerator = line().curve(curveNatural);
    this.svg.selectAll(`path.${ring.name}`)
      .data(petals)
      .join(
        (enter) => enter.append('path')
          .attr('class',ring.name),
        (update) => update,
        (exit) => exit.remove(),
      )
      .transition()
      .ease(easeExpIn)
      .duration(1000)
      .tween('rotate', function(d) {
        let ringRotationInterpolate = interpolate(ring.prevRingRotation,ring.currRingRotation);
        let petalRotationInterpolate = interpolate(ring.prevPetalRotation,ring.currPetalRotation);
        let petalRotationStepInterpolate = interpolate(ring.prevPetalRotationStep,ring.currPetalRotationStep);
        let radiusInterpolate = interpolate(ring.prevRadius,ring.currRadius);
        let petalRadiusInterpolate = interpolate(ring.prevPetalRadius,ring.currPetalRadius);
        let petalTailRadiusInterpolate = interpolate(ring.prevPetalTailRadius,ring.currPetalTailRadius);
        // let flipRotation = Math.random() > 0.5;
        return function(t){
          let angle = ringRotationInterpolate(t);// + d.angle;
          angle += d.angle;
          const radius = radiusInterpolate(t);
          const cx = radius * Math.cos(angle / 180 * Math.PI);
          const cy = radius * Math.sin(angle / 180 * Math.PI);
          const petalOrigin: Point = {x: cx, y:cy};
          const petalRotation = -d.index * petalRotationInterpolate(t) + petalRotationStepInterpolate(t);

          const petalRadius = petalRadiusInterpolate(t);
          const petalTailRadius = petalTailRadiusInterpolate(t);

          const points: Point[] = generatePetalPoints(petalOrigin, petalRadius, petalTailRadius, petalRotation);
          const path = lineGenerator(points.map(({x,y}) => [xScale(x),yScale(y)]))
          return select(this).attr('d',path);
        }
      })
      .attr('class',ring.name)
      .attr('fill',d => d.fill)
  }

  private drawCircles(circles: Circle[]){
    const rScale = this.rScale;
    const xScale = this.xScale;
    const yScale = this.yScale;
    this.svg.selectAll('circle')
      .data(circles)
      .join(
        (enter) => enter.append('circle'),
        (update) => update,
        (exit) => exit.remove(),
      )

      .transition()
      .ease(easeLinear)
      .duration(1500)
      .attr('r', d => rScale(d.fillRadius))
      // .attr('cx',d => xScale(d.originRadius * Math.cos(d.prevTheta / 180 * Math.PI)))
      // .attr('cy',d => yScale(d.originRadius * Math.sin(d.prevTheta / 180 * Math.PI)))
      .attr('fill', d => d.fillColor)
      .tween('circumference', function(d) {
        let i = interpolate(d.prevTheta,d.currTheta);
        return function(t) {
          const angle = i(t);
          const cx = d.originRadius * Math.cos(angle / 180 * Math.PI);
          const cy = d.originRadius * Math.sin(angle / 180 * Math.PI);
          select(this)
            .attr('cx', xScale(cx))
            .attr('cy', yScale(cy));
        }
      })

  }

  public updateCircles(){
    this.circles.forEach((c)=>{
      c.prevTheta = c.currTheta;
      c.currTheta += 180;
    })
    this.drawCircles(this.circles);
  }

  private setupCanvas(){
    const canvasDims: Dims = { width: 2400, height: 2400 };
    this.rScale = scaleLinear().domain([0,1]).range([0,canvasDims.width]);
    this.xScale = scaleLinear().domain([-1,1]).range([0,canvasDims.width]);
    this.yScale = scaleLinear().domain([1,-1]).range([0,canvasDims.height]);
    this.svg = select('#canvas')
      .append("svg")
      .attr('width', canvasDims.width)
      .attr('height', canvasDims.height)
      .style('background-color','black');
  }

}

