import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenObserverComponent } from './token-observer.component';

describe('TokenObserverComponent', () => {
  let component: TokenObserverComponent;
  let fixture: ComponentFixture<TokenObserverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenObserverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenObserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
