import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AntFieldV2Component } from './ant-field-v2/ant-field-v2.component';
import { AntFieldComponent } from './ant-field/ant-field.component';
import { ClockComponent } from './clock/clock.component';
import { GridAlgorithmComponent } from './grid-algorithm/grid-algorithm.component';
import { ImageFilterComponent } from './image-filter/image-filter.component';
import { KnightsTourComponent } from './knights-tour/knights-tour.component';
import { QuadtreeComponent } from './quadtree/quadtree.component';
import { QuiltComponent } from './quilt/quilt.component';
import { SprawlComponent } from './sprawl/sprawl.component';
import { StudioComponent } from './studio/studio.component';
import { TruchetComponent } from './truchet/truchet.component';
import { WeaveComponent } from './weave/weave.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'studio',
    pathMatch: 'full'
  },
  {
    path: 'tour',
    component: KnightsTourComponent,
  },
  {
    path: 'studio',
    component: StudioComponent,
  },
  {
    path: 'grid',
    component: GridAlgorithmComponent,
  },
  {
    path: 'image-filter',
    component: ImageFilterComponent,
  },
  {
    path: 'weave',
    component: WeaveComponent,
  },
  {
    path: 'ant-field',
    component: AntFieldComponent,
  },
  {
    path: 'ant-field-v2',
    component: AntFieldV2Component,
  },
  {
    path: 'clock',
    component: ClockComponent,
  },
  {
    path: 'truchet',
    component: TruchetComponent,
  },
  {
    path: 'quilt',
    component: QuiltComponent,
  },
  {
    path: 'sprawl',
    component: SprawlComponent,
  },
  {
    path: 'quadtree',
    component: QuadtreeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
