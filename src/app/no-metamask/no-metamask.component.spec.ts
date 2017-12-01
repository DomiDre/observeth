import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoMetamaskComponent } from './no-metamask.component';

describe('NoMetamaskComponent', () => {
  let component: NoMetamaskComponent;
  let fixture: ComponentFixture<NoMetamaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoMetamaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoMetamaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
