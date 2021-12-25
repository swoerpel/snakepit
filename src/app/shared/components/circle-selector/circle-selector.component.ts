import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { getRadialVertices } from 'src/app/state/helpers';
import { Point } from '../../models';
import { RangeToggleOutput } from '../range-toggle/range-toggle.component';

@Component({
  selector: 'app-circle-selector',
  templateUrl: './circle-selector.component.html',
  styleUrls: ['./circle-selector.component.scss']
})
export class CircleSelectorComponent implements OnInit {

  @Input() padding: Point = {
    x: 0.25,
    y: 0.25,
  }
  @Output() circleSelected: EventEmitter<Point[]> = new EventEmitter();
  
  public origin: Point = {x:0,y:0};
  public radius!: number;
  public vertices!: number;

  public radii: number[] = [0.1,0.2,0.3,0.4,0.5];
  public verticeOptions: number[] = [3,4,5,6,7,8,9];

  constructor() { }

  ngOnInit(): void {
  }

  public originSelected(point: Point){
    this.origin = {...point};
  }
  public radiusSelected({values}: RangeToggleOutput){
    console.log('radius',values[0])
    this.radius = values[0];
  }
  public verticesSelected({values}: RangeToggleOutput){
    console.log('vertices',values[0])
    this.vertices = values[0];
  }
  // public verticesSelected([vertices]: number[]){
  //   this.vertices = vertices;
  // }

  public createCircle(){
    const points = getRadialVertices(
      this.origin,
      this.radius,
      this.vertices,
    )

    console.log('points',points)
    this.circleSelected.emit(points);
  }

}
