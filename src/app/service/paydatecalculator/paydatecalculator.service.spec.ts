import { TestBed } from '@angular/core/testing';

import { PaydatecalculatorService } from './paydatecalculator.service';

describe('PaydatecalculatorService', () => {
  let service: PaydatecalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaydatecalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
