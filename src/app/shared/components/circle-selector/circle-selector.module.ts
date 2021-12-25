import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CircleSelectorComponent } from './circle-selector.component';
import { InputModule } from '../input/input.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PointSelectorModule } from '../point-selector/point-selector.module';
import { RangeToggleModule } from '../range-toggle/range-toggle.module';



@NgModule({
  declarations: [CircleSelectorComponent],
  imports: [
    CommonModule,
    InputModule,
    ReactiveFormsModule,
    PointSelectorModule,
    RangeToggleModule,
  ],
  exports: [CircleSelectorComponent]
})
export class CircleSelectorModule { }
