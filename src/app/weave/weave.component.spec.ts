import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeaveComponent } from './weave.component';

describe('WeaveComponent', () => {
  let component: WeaveComponent;
  let fixture: ComponentFixture<WeaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
