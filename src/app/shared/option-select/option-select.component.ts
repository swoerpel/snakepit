import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-option-select',
  templateUrl: './option-select.component.html',
  styleUrls: ['./option-select.component.scss']
})
export class OptionSelectComponent<T> implements OnInit {

  @Input() value$: Observable<T>;
  @Input() values: T[];
  @Input() updateFunct: Function;
  @Input() label: string = null;

  constructor() { }

  ngOnInit(): void {
  }

}
