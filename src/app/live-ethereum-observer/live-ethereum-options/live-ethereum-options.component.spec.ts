import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveEthereumOptionsComponent } from './live-ethereum-options.component';

describe('LiveEthereumOptionsComponent', () => {
  let component: LiveEthereumOptionsComponent;
  let fixture: ComponentFixture<LiveEthereumOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveEthereumOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveEthereumOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
