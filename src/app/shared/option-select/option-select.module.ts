import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionSelectComponent } from './option-select.component';



@NgModule({
  declarations: [OptionSelectComponent],
  imports: [
    CommonModule
  ],
  exports: [
    OptionSelectComponent
  ]
})
export class OptionSelectModule { }
