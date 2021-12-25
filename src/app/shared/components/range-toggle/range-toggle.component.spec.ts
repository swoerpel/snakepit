import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeToggleComponent } from './range-toggle.component';

describe('RangeToggleComponent', () => {
  let component: RangeToggleComponent;
  let fixture: ComponentFixture<RangeToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RangeToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
