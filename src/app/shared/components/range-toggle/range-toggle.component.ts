import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { round } from 'src/app/state/helpers';

export interface RangeToggleOutput{
  values: number[];
  sum: number;
  avg: number;
}

@Component({
  selector: 'app-range-toggle',
  templateUrl: './range-toggle.component.html',
  styleUrls: ['./range-toggle.component.scss']
})
export class RangeToggleComponent implements OnInit {
  @Input() range: number[] = [];
  @Input() label: string = '';
  @Input() multiToggle: boolean = false;
  @Input() showSummary: boolean = false;
  

  @Output() update: EventEmitter<RangeToggleOutput> = new EventEmitter();

  public toggleValueDict: Record<string, boolean> = {};
  public sum: number = 0;
  public avg: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.resetRangeToggleDict();
  }

  public valueSelected(value: number){
    if(this.multiToggle){
      this.toggleValueDict[value.toString()] = !this.toggleValueDict[value.toString()];
      const values = this.range.filter(v => this.toggleValueDict[v.toString()]);
      this.sum = values.reduce((s,v) => s + v, 0);
      this.avg = round(this.sum / values.length,3);
      this.update.emit({
        values,
        avg: this.avg,
        sum: this.sum,
      });
    }else{
      this.resetRangeToggleDict();
      this.toggleValueDict[value.toString()] = true;
      this.update.emit({
        values: [value],
        avg: this.avg,
        sum: this.sum,
      });
    }
  }

  private resetRangeToggleDict(){
    this.toggleValueDict = this.range.reduce((dict: Record<string,boolean>,value: number) => {
      dict[value.toString()] = false;
      return dict;
    },{})
  }

}
