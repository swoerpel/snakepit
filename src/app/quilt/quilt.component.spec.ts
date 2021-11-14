import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiltComponent } from './quilt.component';

describe('QuiltComponent', () => {
  let component: QuiltComponent;
  let fixture: ComponentFixture<QuiltComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuiltComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuiltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
