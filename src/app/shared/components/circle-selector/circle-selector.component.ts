import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { getRadialVertices, removeDuplicates } from 'src/app/state/helpers';
import { Point } from '../../models';
import { RangeToggleOutput } from '../range-toggle/range-toggle.component';

@Component({
  selector: 'app-circle-selector',
  templateUrl: './circle-selector.component.html',
  styleUrls: ['./circle-selector.component.scss']
})
export class CircleSelectorComponent implements OnInit {

  @Input() padding: Point = {x: 0.25, y: 0.25};
  @Output() circleSelected: EventEmitter<Point[]> = new EventEmitter();
  
  public origin: Point = {x:0,y:0};
  public radius!: number;
  public vertices!: number;
  public rotation!: number;

  public radii: number[] = [0.1,0.2,0.3,0.4,0.5];
  public verticeOptions: number[] = [3,4,5,6,7,8,9];
  public rotationOptions: number[] = [0,15,30,45,90,180,215];

  constructor() { }

  ngOnInit(): void {
  }

  public originSelected(point: Point){
    this.origin = {...point};
  }
  public radiusSelected({values}: RangeToggleOutput){
    this.radius = values[0];
  }
  public verticesSelected({values}: RangeToggleOutput){
    this.vertices = values[0];
  }
  public rotationSelected({values}: RangeToggleOutput){
    this.rotation = values[0];
  }

  public createCircle(){
    const points = removeDuplicates(getRadialVertices(
      this.origin,
      this.radius,
      this.vertices,
      this.rotation,
    ))
    this.circleSelected.emit(points);
  }

}
