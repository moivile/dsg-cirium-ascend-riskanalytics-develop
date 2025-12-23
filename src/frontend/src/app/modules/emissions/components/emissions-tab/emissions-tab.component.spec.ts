import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmissionsTabComponent } from './emissions-tab.component';
import { Component, Input } from '@angular/core';

describe('EmissionsTabComponent', () => {
  let component: EmissionsTabComponent;
  let fixture: ComponentFixture<EmissionsTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmissionsTabComponent,MockCompareComponent]
    });
    fixture = TestBed.createComponent(EmissionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
    selector: 'ra-compare',
    template: '',
    standalone: false
})
class MockCompareComponent {
  @Input() isEmissions!:boolean;
  @Input() isHoursAndCycle!:boolean;
}
