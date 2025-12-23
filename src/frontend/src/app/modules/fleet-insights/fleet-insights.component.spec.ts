import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { FleetInsightsComponent } from './fleet-insights.component';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { fleetDistributionRoute, fleetInsightsRoute, fleetTrendsRoute, marketActivityRoute } from '../../route.constants';

@Component({
    template: '<div></div>',
    standalone: false
})
export class EmptyComponent {}

@Component({
    selector: 'ra-fleet-insights-filter-panel',
    template: '<div></div>',
    standalone: false
})
class MockFleetInsightsFilterPanelComponent {}

describe('FleetInsightsComponent', () => {
  let component: FleetInsightsComponent;
  let fixture: ComponentFixture<FleetInsightsComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetInsightsComponent, EmptyComponent, MockFleetInsightsFilterPanelComponent],
      imports: [
        RouterModule.forRoot([
          {
            path: '',
            children: [
              {
                path: fleetDistributionRoute,
                component: EmptyComponent
              },
              {
                path: fleetTrendsRoute,
                component: EmptyComponent
              },
              {
                path: marketActivityRoute,
                component: EmptyComponent
              },
              { path: fleetInsightsRoute, redirectTo: fleetDistributionRoute, pathMatch: 'full' }
            ]
          }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetInsightsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect fleet distribution page', fakeAsync(() => {
    router.navigate([`/${fleetDistributionRoute}`]);
    flush();
    component.isFleetDistributionPage$.subscribe((isFleetDistributionPage) => {
      expect(isFleetDistributionPage).toBeTrue();
    });
  }));

  it('should detect fleet trends page', fakeAsync(() => {
    router.navigate([`/${fleetTrendsRoute}`]);
    flush();

    component.isFleetTrendsPage$.subscribe((isFleetTrendsPage) => {
      expect(isFleetTrendsPage).toBeTrue();
    });
  }));

  it('should detect market activity page', fakeAsync(() => {
    router.navigate([`/${marketActivityRoute}`]);
    flush();

    component.isMarketActivityPage$.subscribe((isMarketActivityPage) => {
      expect(isMarketActivityPage).toBeTrue();
    });
  }));
});
