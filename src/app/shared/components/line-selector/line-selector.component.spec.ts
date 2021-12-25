import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineSelectorComponent } from './line-selector.component';

describe('LineSelectorComponent', () => {
  let component: LineSelectorComponent;
  let fixture: ComponentFixture<LineSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
