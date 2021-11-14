import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as chroma from 'chroma.ts';
import { debounceTime, tap } from 'rxjs/operators';
import { StudioActions } from '../state';
import { GridAlgorithm, GridLayer } from '../state/studio.models';

@Component({
  selector: 'app-edit-layer',
  templateUrl: './edit-layer.component.html',
  styleUrls: ['./edit-layer.component.scss']
})
export class EditLayerComponent implements OnInit {

  @Input() layer: GridLayer;

  public GridAlgorithm = GridAlgorithm;
  public gridAlgorithms = Object.values(GridAlgorithm);

  public palettes = Object.keys(chroma.brewer);

  public colorPalette: string[];

  public activeColors: string[];

  public selectedPaletteColor: string = null;

  public displayLayer: boolean;
  public algorithmFormControl: FormControl = new FormControl();
  public opacityFormControl: FormControl = new FormControl();
  public maxValueFormControl: FormControl = new FormControl();
  public paletteFormControl: FormControl = new FormControl();
  public dimsFormGroup: FormGroup = new FormGroup({
      width: new FormControl(),
      height: new FormControl(),
  });

  constructor(
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.algorithmFormControl.valueChanges.pipe(
      tap((algorithm: GridAlgorithm) => {
        this.store.dispatch(StudioActions.SetSelectedLayerGridAlgorithm({algorithm}))
      })
    ).subscribe();
    this.paletteFormControl.valueChanges.pipe(
      tap((colorPalette: string) => {
        this.store.dispatch(StudioActions.SetSelectedLayerPalette({colorPalette}));
      })
    ).subscribe();
    this.opacityFormControl.valueChanges.pipe(
      debounceTime(100),
      tap((opacityString: string) => {
        const opacity = parseInt(opacityString);
        this.store.dispatch(StudioActions.SetSelectedLayerOpacity({opacity}));
      })
    ).subscribe();
  }

  ngOnChanges(){
    this.updateControls();
  }

  updateControls(){
    this.displayLayer = this.layer.display;
    this.algorithmFormControl.setValue(this.layer.algorithm, {emitEvent: false});
    this.opacityFormControl.setValue(this.layer.opacity, {emitEvent: false});
    this.maxValueFormControl.setValue(this.layer.algorithmParams.maxValue, {emitEvent: false});
    this.dimsFormGroup.patchValue(this.layer.dims, {emitEvent: false});
    this.paletteFormControl.patchValue(this.layer.colorPalette, {emitEvent: false});
    this.colorPalette = chroma.brewer[this.layer.colorPalette].map(c => chroma.color(c).hex());
    if(this.layer.activeColors.length === 0 || this.layer.activeColors.length < this.layer.algorithmParams.maxValue){
      this.activeColors = this.colorPalette.filter((_,index) => index < this.layer.algorithmParams.maxValue);
      setTimeout(() => this.store.dispatch(StudioActions.SetSelectedLayerActiveColors({activeColors: this.activeColors})),0);
    }else{
      this.activeColors = [...this.layer.activeColors];
    }
  }

  selectPaletteColor(color: string){
    this.selectedPaletteColor = color;
  }

  selectActiveColor(colorIndex: number){
    if(!this.selectedPaletteColor){
      return;
    }

    const activeColors = this.activeColors.map((c,i) => i === colorIndex ? this.selectedPaletteColor : c);
    this.store.dispatch(StudioActions.SetSelectedLayerActiveColors({activeColors}))
    this.selectedPaletteColor = null;
  }

  toggleDisplayLayer(){
    this.displayLayer = !this.displayLayer;
    this.store.dispatch(StudioActions.SetSelectedLayerDisplay({display: this.displayLayer}))
  }

  updateLayerDims(){
    this.store.dispatch(StudioActions.SetSelectedLayerDims({dims: this.dimsFormGroup.value}))
  }

  updateAlgorithmMaxValue(){
    this.store.dispatch(StudioActions.SetSelectedLayerMaxValue({maxValue: this.maxValueFormControl.value}))
  }

}

