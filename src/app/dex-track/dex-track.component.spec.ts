import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DexTrackComponent } from './dex-track.component';

describe('DexTrackComponent', () => {
  let component: DexTrackComponent;
  let fixture: ComponentFixture<DexTrackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DexTrackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DexTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
