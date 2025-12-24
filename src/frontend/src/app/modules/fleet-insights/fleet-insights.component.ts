import { Component, OnDestroy } from '@angular/core';
import { assetAIRoute, fleetDistributionRoute, fleetTrendsRoute, marketActivityRoute } from '../../route.constants';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, shareReplay, startWith, Subject, takeUntil } from 'rxjs';
import { AppStore } from '../../app-store';

@Component({
  selector: 'ra-fleet-insights',
  templateUrl: './fleet-insights.component.html',
  styleUrl: './fleet-insights.component.scss',
  standalone: false
})
export class FleetInsightsComponent implements OnDestroy {
  fleetDistributionRoute = fleetDistributionRoute;
  fleetTrendsRoute = fleetTrendsRoute;
  marketActivityRoute = marketActivityRoute;
  assetAIRoute = assetAIRoute;
  currentPath: string | undefined;
  isTestFeatureEnabled$ = this.appStore.isTestFeatureEnabled$;
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
      return url === `/${fleetDistributionRoute}` || url === `/`;
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

  isAssetAiPage$ = this.currUrl$.pipe(map((url) => url === `/${assetAIRoute}`));

  isCollapsed = false;

  togglePanel(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isCollapsed = !this.isCollapsed;
  }

  constructor(private router: Router, public readonly appStore: AppStore) {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
