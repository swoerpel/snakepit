import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputModule } from '../input/input.module';
import { PointSelectorModule } from '../point-selector/point-selector.module';
import { LineSelectorComponent } from './line-selector.component';



@NgModule({
  declarations: [LineSelectorComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PointSelectorModule,
    InputModule,
  ],
  exports: [
    LineSelectorComponent
  ]
})
export class LineSelectorModule { }
