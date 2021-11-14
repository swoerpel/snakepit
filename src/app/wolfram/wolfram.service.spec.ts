import { TestBed } from '@angular/core/testing';

import { WolframService } from './wolfram.service';

describe('WolframService', () => {
  let service: WolframService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WolframService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
