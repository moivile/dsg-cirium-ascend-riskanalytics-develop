import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetInsightsFilterPanelComponent } from './fleet-insights-filter-panel.component';

describe('FleetInsightsFilterPanelComponent', () => {
  let component: FleetInsightsFilterPanelComponent;
  let fixture: ComponentFixture<FleetInsightsFilterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetInsightsFilterPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetInsightsFilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
