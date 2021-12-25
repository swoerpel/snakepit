import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RangeToggleComponent } from './range-toggle.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputModule } from '../input/input.module';



@NgModule({
  declarations: [RangeToggleComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputModule,
  ],
  exports:[
    RangeToggleComponent,
  ]
})
export class RangeToggleModule { }
