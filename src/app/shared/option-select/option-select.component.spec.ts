import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionSelectComponent } from './option-select.component';

describe('OptionSelectComponent', () => {
  let component: OptionSelectComponent;
  let fixture: ComponentFixture<OptionSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
