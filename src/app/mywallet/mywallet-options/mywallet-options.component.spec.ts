import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MywalletOptionsComponent } from './mywallet-options.component';

describe('MywalletOptionsComponent', () => {
  let component: MywalletOptionsComponent;
  let fixture: ComponentFixture<MywalletOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MywalletOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MywalletOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
