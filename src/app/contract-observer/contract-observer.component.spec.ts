import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractObserverComponent } from './contract-observer.component';

describe('ContractObserverComponent', () => {
  let component: ContractObserverComponent;
  let fixture: ComponentFixture<ContractObserverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractObserverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractObserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
