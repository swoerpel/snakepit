import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { scaleLinear, ScaleLinear, select } from 'd3';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { Dims } from '../shared/models';
import { StudioActions, StudioSelectors } from '../state';
import {  GridLayer } from '../state/studio.models';



@Component({
  selector: 'app-studio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit {

  public layers$: Observable<GridLayer[]>;
  public selectedLayerIndex$: Observable<number>;
  public selectedLayer$: Observable<GridLayer>;

  public svg: any;

  public layerGroups: any[];

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;
  public cellWidth: number;
  public cellHeight: number;

  constructor(
    private store: Store,
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.setupCanvas();
    this.layers$ = this.store.select(StudioSelectors.getGridLayers);
    this.selectedLayerIndex$ = this.store.select(StudioSelectors.getSelectedLayerIndex);
    this.selectedLayer$ = this.store.select(StudioSelectors.getSelectedLayer);
    
    this.layers$.pipe(
      tap((layers: GridLayer[]) => {
        this.svg.innerHTML = ''
        layers.forEach((layer: GridLayer) => {
          const layerGroup = this.svg.append('g');
          const cellWidth = 1 / layer.dims.width;
          const cellHeight = 1 / layer.dims.height;
          let index = 0;
          for(let i = 0; i < layer.dims.height; i++){
            for(let j = 0; j < layer.dims.width; j++){
              layerGroup.append('rect')
                .attr('x',this.xScale(j * cellWidth))
                .attr('y',this.yScale(i * cellHeight))
                .attr('width',this.xScale(cellWidth))
                .attr('height',this.yScale(cellHeight))
                .attr("fill-opacity", layer.opacity / 100)
                .attr('fill',layer.activeColors[index % layer.algorithmParams.maxValue]);
              index++;
            }
          }
        })
      })
    ).subscribe();

  }

  ngAfterViewInit(){
 
  
  }

  setSelectedLayerIndex(index: number){
    this.store.dispatch(StudioActions.SetSelectedLayerIndex({index}))
  }

  addNewLayer(){
    this.store.dispatch(StudioActions.AddNewLayer())
  }

  private setupCanvas(){
    const canvas: HTMLElement = this.elementRef.nativeElement.querySelector('#canvas');
    canvas.innerHTML = '';
    const preview: HTMLElement = this.elementRef.nativeElement.querySelector('.preview');
    const {height} = preview.getBoundingClientRect();
    const padding = 0.1;
    const canvasDims: Dims = {
      width: Math.floor(height) * (1 - padding),
      height: Math.floor(height) * (1 - padding),
    }

    this.xScale = scaleLinear().domain([0,1]).range([0,canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,canvasDims.height]);

    this.svg = select('#canvas')
      .append("svg")
      .attr('width', canvasDims.width)
      .attr('height', canvasDims.height)
      .style('background-color','white');
  }

}
