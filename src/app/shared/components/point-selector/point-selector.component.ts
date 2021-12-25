import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { round } from 'src/app/state/helpers';
import { Point } from '../../models';

export enum PointSelectorOption {
  TL = 'TL',
  TC = 'TC',
  TR = 'TR',
  L = 'L',
  C = 'C',
  R = 'R',
  BL = 'BL',
  BC = 'BC',
  BR = 'BR',
  Rand = 'RP',
}

@Component({
  selector: 'app-point-selector',
  templateUrl: './point-selector.component.html',
  styleUrls: ['./point-selector.component.scss']
})
export class PointSelectorComponent implements OnInit {

  @Input() padding: Point = {x: 0, y: 0};
  @Input() option: PointSelectorOption = PointSelectorOption.C;
  @Output() pointSelected: EventEmitter<Point> = new EventEmitter();

  public Option = PointSelectorOption;

  constructor() { }

  ngOnInit(): void {
    this.selectCell(PointSelectorOption.C);
  }

  public selectCell(option: PointSelectorOption){
    this.option = option;
    const xMin = this.padding.x;
    const xMax = 1 - this.padding.x;
    const yMin = this.padding.y;
    const yMax = 1 - this.padding.y;
    const xDiff = (xMax - xMin)
    const yDiff = (yMax - yMin)
    const cx = this.padding.x + xDiff / 2;
    const cy = this.padding.y + yDiff / 2;
    let p!: Point;
    let Option = PointSelectorOption;
    switch(option){
      case Option.TL: p = {x: xMin, y: yMin}; break;
      case Option.TC: p = {x: cx, y: yMin}; break;
      case Option.TR: p = {x: xMax, y: yMin}; break;
      case Option.L: p = {x: xMin, y: cy}; break;
      case Option.C: p = {x: cx, y: cy}; break;
      case Option.R: p = {x: xMax, y: cy}; break;
      case Option.BL: p = {x: xMin, y: yMax}; break;
      case Option.BC: p = {x: cx, y: yMax}; break;
      case Option.BR: p = {x: xMax, y: yMax}; break;
      case Option.Rand: p = {
        x: round(Math.random() * xDiff + this.padding.x), 
        y: round(Math.random() * yDiff + this.padding.y), 
      }; break;
    }
    this.pointSelected.emit(p);
  }

}
