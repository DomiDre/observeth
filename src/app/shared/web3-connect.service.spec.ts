import { TestBed, inject } from '@angular/core/testing';

import { Web3ConnectService } from './web3-connect.service';

describe('Web3ConnectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Web3ConnectService]
    });
  });

  it('should be created', inject([Web3ConnectService], (service: Web3ConnectService) => {
    expect(service).toBeTruthy();
  }));
});
