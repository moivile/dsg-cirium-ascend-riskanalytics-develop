import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { FleetInsightsComponent } from './fleet-insights.component';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { fleetDistributionRoute, fleetTrendsRoute, marketActivityRoute } from '../../route.constants';
import { AppStore } from '../../app-store';
import { AppUserService } from '../../app-user.service';
import { of } from 'rxjs';

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
class MockFleetInsightsFilterPanelComponent {
  @Input() isFleetDistributionPage = false;
  @Input() isFleetTrendsPage$ = of(false);
  @Input() isMarketActivityPage$ = of(false);
}

describe('FleetInsightsComponent', () => {
  let component: FleetInsightsComponent;
  let fixture: ComponentFixture<FleetInsightsComponent>;
  let router: Router;
  let appStore: AppStore;

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
              { path: '', redirectTo: fleetDistributionRoute, pathMatch: 'full' }
            ]
          }
        ])
      ],
      providers: [AppStore, { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } }]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetInsightsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    appStore = TestBed.inject(AppStore);
    appStore.setAppUser({ claims: [], userEmailAddress: 'fgpremiumtest@rbi.co.uk' });
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
