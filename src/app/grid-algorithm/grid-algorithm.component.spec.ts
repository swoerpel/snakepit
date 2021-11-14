import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridAlgorithmComponent } from './grid-algorithm.component';

describe('GridAlgorithmComponent', () => {
  let component: GridAlgorithmComponent;
  let fixture: ComponentFixture<GridAlgorithmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridAlgorithmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridAlgorithmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
