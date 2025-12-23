import { Component, OnDestroy } from '@angular/core';
import {
  fleetDistributionPath,
  fleetDistributionRoute,
  fleetInsightsRoute,
  fleetTrendsPath,
  fleetTrendsRoute,
  marketActivityPath,
  marketActivityRoute
} from '../../route.constants';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, shareReplay, startWith, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'ra-fleet-insights',
    templateUrl: './fleet-insights.component.html',
    styleUrl: './fleet-insights.component.scss',
    standalone: false
})
export class FleetInsightsComponent implements OnDestroy {
  fleetDistributionPath = fleetDistributionPath;
  fleetTrendsPath = fleetTrendsPath;
  marketActivityPath = marketActivityPath;
  currentPath: string | undefined;
  private destroy$ = new Subject<void>();

  currUrl$ = this.router.events.pipe(
    takeUntil(this.destroy$),
    filter((event) => event instanceof NavigationEnd),
    map(() => this.router.url),
    startWith(this.router.url),

    shareReplay(1)
  );

  isFleetDistributionPage$ = this.currUrl$.pipe(
    map((url) => {
      return [`/${fleetInsightsRoute}`, `/${fleetDistributionRoute}`].includes(url);
    })
  );

  isFleetTrendsPage$ = this.currUrl$.pipe(
    map((url) => {
      return url === `/${fleetTrendsRoute}`;
    })
  );

  isMarketActivityPage$ = this.currUrl$.pipe(
    map((url) => {
      return url === `/${marketActivityRoute}`;
    })
  );

  isCollapsed = false;

  togglePanel(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isCollapsed = !this.isCollapsed;
  }

  constructor(private router: Router) {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
