import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnightsTourComponent } from './knights-tour.component';

describe('KnightsTourComponent', () => {
  let component: KnightsTourComponent;
  let fixture: ComponentFixture<KnightsTourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnightsTourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnightsTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
