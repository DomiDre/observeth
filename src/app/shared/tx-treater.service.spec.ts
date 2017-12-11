import { TestBed, inject } from '@angular/core/testing';

import { TxTreaterService } from './tx-treater.service';

describe('TxTreaterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TxTreaterService]
    });
  });

  it('should be created', inject([TxTreaterService], (service: TxTreaterService) => {
    expect(service).toBeTruthy();
  }));
});
