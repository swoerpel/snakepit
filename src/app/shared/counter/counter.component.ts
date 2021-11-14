import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnInit {

  @Input() value$: Observable<number>;
  @Input() updateFunct: Function;
  @Input() label: string = null;
  
  constructor(
    private store: Store,
  ) { }

  ngOnInit(): void {
  }

}
