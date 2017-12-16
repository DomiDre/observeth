import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenObserverOptionsComponent } from './token-observer-options.component';

describe('TokenObserverOptionsComponent', () => {
  let component: TokenObserverOptionsComponent;
  let fixture: ComponentFixture<TokenObserverOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenObserverOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenObserverOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
