import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntFieldV2Component } from './ant-field-v2.component';

describe('AntFieldV2Component', () => {
  let component: AntFieldV2Component;
  let fixture: ComponentFixture<AntFieldV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AntFieldV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AntFieldV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
