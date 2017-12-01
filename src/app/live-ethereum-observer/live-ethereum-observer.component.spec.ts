import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveEthereumObserverComponent } from './live-ethereum-observer.component';

describe('LiveEthereumObserverComponent', () => {
  let component: LiveEthereumObserverComponent;
  let fixture: ComponentFixture<LiveEthereumObserverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveEthereumObserverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveEthereumObserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
