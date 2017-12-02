import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EtherObserverComponent } from './ether-observer.component';

describe('EtherObserverComponent', () => {
  let component: EtherObserverComponent;
  let fixture: ComponentFixture<EtherObserverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtherObserverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtherObserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
