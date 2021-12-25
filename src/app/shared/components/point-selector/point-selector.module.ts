import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointSelectorComponent } from './point-selector.component';



@NgModule({
  declarations: [PointSelectorComponent],
  imports: [
    CommonModule
  ],
  exports:[
    PointSelectorComponent
  ]
})
export class PointSelectorModule { }
