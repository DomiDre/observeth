import { TestBed, inject } from '@angular/core/testing';

import { MywalletOptionsService } from './mywallet-options.service';

describe('MywalletOptionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MywalletOptionsService]
    });
  });

  it('should be created', inject([MywalletOptionsService], (service: MywalletOptionsService) => {
    expect(service).toBeTruthy();
  }));
});
