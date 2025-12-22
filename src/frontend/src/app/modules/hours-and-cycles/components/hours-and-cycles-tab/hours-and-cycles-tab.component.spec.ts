import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursAndCyclesTabComponent } from './hours-and-cycles-tab.component';
import { Component, Input } from '@angular/core';

describe('HoursAndCyclesTabComponent', () => {
  let component: HoursAndCyclesTabComponent;
  let fixture: ComponentFixture<HoursAndCyclesTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HoursAndCyclesTabComponent,MockCompareComponent]
    });
    fixture = TestBed.createComponent(HoursAndCyclesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
@Component({
  selector: 'ra-compare',
  template: ''
})
class MockCompareComponent {
  @Input() isEmissions!:boolean;
  @Input() isHoursAndCycle!:boolean;
}
