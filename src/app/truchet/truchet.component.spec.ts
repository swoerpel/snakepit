import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TruchetComponent } from './truchet.component';

describe('TruchetComponent', () => {
  let component: TruchetComponent;
  let fixture: ComponentFixture<TruchetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruchetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruchetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
