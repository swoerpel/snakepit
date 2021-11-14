import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StudioComponent } from './studio/studio.component';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { environment } from 'src/environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { studioReducer } from './state/studio.reducer';
import { StudioEffects } from './state/studio.effects';
import { CounterModule } from './shared/counter/counter.module';
import { OptionSelectModule } from './shared/option-select/option-select.module';
import { KnightsTourComponent } from './knights-tour/knights-tour.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EditLayerComponent } from './edit-layer/edit-layer.component';
import { GridAlgorithmComponent } from './grid-algorithm/grid-algorithm.component';
import { ImageFilterComponent } from './image-filter/image-filter.component';
import { WeaveComponent } from './weave/weave.component';
import { AntFieldComponent } from './ant-field/ant-field.component';
import { AntFieldV2Component } from './ant-field-v2/ant-field-v2.component';
import { ClockComponent } from './clock/clock.component';
import { TruchetComponent } from './truchet/truchet.component';
import { QuiltComponent } from './quilt/quilt.component';


const stateSlices = {
  studio: studioReducer,
}

const stateEffects = [
  StudioEffects
]

@NgModule({
  declarations: [
    AppComponent,
    StudioComponent,
    KnightsTourComponent,
    EditLayerComponent,
    GridAlgorithmComponent,
    ImageFilterComponent,
    WeaveComponent,
    AntFieldComponent,
    AntFieldV2Component,
    ClockComponent,
    TruchetComponent,
    QuiltComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    
    StoreRouterConnectingModule.forRoot(),
    StoreModule.forRoot(stateSlices),
    EffectsModule.forRoot(stateEffects),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    
    CounterModule,
    OptionSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
