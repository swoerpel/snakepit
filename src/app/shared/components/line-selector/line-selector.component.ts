import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Point } from '../../models';

@Component({
  selector: 'app-line-selector',
  templateUrl: './line-selector.component.html',
  styleUrls: ['./line-selector.component.scss']
})
export class LineSelectorComponent implements OnInit {

  @Input() padding: Point = {
    x: 0.25,
    y: 0.25,
  }
  @Output() lineSelected: EventEmitter<Point[]> = new EventEmitter();
  
  public formGroup: FormGroup = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  })

  public start!: Point;
  public end!: Point;


  constructor() { }

  ngOnInit(): void {
  }

  public startSelected(point: Point){
    this.start = point;
    this.formGroup.patchValue({start: this.pointToString(point)})
  } 

  public endSelected(point: Point){
    this.end = point;
    this.formGroup.patchValue({end: this.pointToString(point)})
  }

  public createLine(){
    this.lineSelected.emit([this.start,this.end]);
  }

  private pointToString(p: Point): string{
    return `${p.x}, ${p.y}`
  }

}
