/* eslint-disable object-shorthand */
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AuthService, IdToken } from '@auth0/auth0-angular';
import { ScriptInjectorService } from './modules/shared/services/script-injector.service';
import { AnalyticsService } from './modules/shared/services/analytics-service';
import { Subject, combineLatest, filter, map, mergeMap, shareReplay, take, takeUntil, tap, withLatestFrom } from 'rxjs';
import { GlobalConstants } from './modules/shared/models/global-constants';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppStore } from './app-store';
import { FormControl } from '@angular/forms';
import {
  assetWatchRoute,
  assetWatchSavedSearchesRoute,
  fleetDistributionRoute,
  fleetInsightsRoute,
  fleetTrendsRoute,
  marketActivityRoute
} from './route.constants';

@Component({
  selector: 'ra-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  logoutURL!: string;
  profileToken: string | undefined;
  selectedPortfolioIdControl = new FormControl<number | null>(null);

  currUrl$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event) => (event as NavigationEnd).url),
    shareReplay(1)
  );
  fleetDistributionRoute = fleetDistributionRoute;
  fleetTrendsRoute = fleetTrendsRoute;
  marketActivityRoute = marketActivityRoute;

  isFleetInsightsPage$ = this.currUrl$.pipe(
    map((url) => {
      return url.startsWith(`/${fleetInsightsRoute}`);
    })
  );

  get isFleetSummary(): boolean {
    const url = this.getUrlSegments(this.router.url);
    if (url.length === 2 && url[0] === 'portfolios' && !isNaN(Number(url[1]))) {
      return true;
    } else {
      return false;
    }
  }

  get isPortfoliosPage(): boolean {
    const url = this.getUrlSegments(this.router.url);
    if (url.length === 1 && url[0] === 'portfolios') {
      return true;
    } else {
      return false;
    }
  }

  get isHoursAndCyclesPage(): boolean {
    return this.isPage('hours-and-cycles');
  }

  get isEmissionsPage(): boolean {
    return this.isPage('emissions');
  }

  get isAssetWatchPage(): boolean {
    return this.isPage('asset-watch');
  }

  private readonly headerAndFooterHeight = 130;
  private destroy$ = new Subject<void>();

  minimumContentHeight = window.innerHeight - this.headerAndFooterHeight;

  @HostListener('window:resize')
  onResize(): void {
    this.setMinimumContentHeight();
  }

  constructor(
    public readonly authService: AuthService,
    private readonly scriptInjectorService: ScriptInjectorService,
    private readonly analyticsService: AnalyticsService,
    private readonly router: Router,
    public readonly appStore: AppStore,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.appStore.loadAppUser();

    this.isFleetInsightsPage$.pipe(take(1)).subscribe((isFleetInsightsPage) => {
      if (!isFleetInsightsPage) {
        this.appStore.portfoliosLoaded$.pipe(take(1)).subscribe((loaded) => {
          if (!loaded) {
            this.appStore.loadPortfolios();
          }
        });
      }
    });

    this.selectedPortfolioIdControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((selectedPortfolioId) => {
          this.appStore.setSelectedPortfolioId(selectedPortfolioId);
        })
      )
      .subscribe();

    this.appStore.selectedPortfolioId$
      .pipe(
        takeUntil(this.destroy$),
        filter((selectedPortfolioId) => this.selectedPortfolioIdControl.value !== selectedPortfolioId),
        tap((selectedPortfolioId) => {
          this.selectedPortfolioIdControl.setValue(selectedPortfolioId);
        })
      )
      .subscribe();

    combineLatest([this.router.events.pipe(filter((event) => event instanceof NavigationEnd)), this.appStore.portfolios$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([, portfolios]) => portfolios?.length > 0),
        withLatestFrom(this.appStore.selectedPortfolioId$),
        tap(([[, portfolios], selectedPortfolioId]) => {
          const currRoute = this.rootRoute(this.activatedRoute);
          const portfolioIdParam: number = currRoute.snapshot.params['id'] || selectedPortfolioId;
          const selectedPortfolio = portfolios.find((x) => x.id == portfolioIdParam) ?? portfolios[0];
          this.appStore.setSelectedPortfolioId(selectedPortfolio?.id ?? null);
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.loadGlobalHeader();
  }

  loadGlobalHeader(): void {
    this.logoutURL = 'logout';

    this.authService
      .getAccessTokenSilently({
        authorizationParams: { audience: 'cae-user-services' }
      })
      .subscribe(async (token) => {
        setTimeout(async () => {
          this.profileToken = token;
          await this.scriptInjectorService.load([
            { name: 'id', value: 'globalHeader' },
            { name: 'src', value: GlobalConstants.globalHeaderSrc },
            { name: 'type', value: 'module' }
          ]);
        }, 5000);
      });

    this.authService.idTokenClaims$
      .pipe(
        filter((claims) => !!claims),
        take(1),
        map((claims) => claims as IdToken),
        map((claims) => {
          const auth0IdKey = 'sub';
          return claims[Object.keys(claims).filter((key) => key.startsWith(auth0IdKey))[0]];
        }),
        mergeMap((userId: string) => this.analyticsService.injectFullStoryScript(userId))
      )
      .subscribe();
  }

  navigateToAssetWatch(): void {
    const savedSearchId = localStorage.getItem('savedSearchId');

    const path = savedSearchId ? `/${assetWatchSavedSearchesRoute}/${savedSearchId}` : `/${assetWatchRoute}`;

    this.router.navigate([path]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isPage(pageName: string): boolean {
    const url = this.getUrlSegments(this.router.url);
    if (url.length === 2 && url[0] === 'portfolios' && url[1] === pageName) {
      return true;
    } else if (url.length === 3 && url[0] === 'portfolios' && !isNaN(Number(url[1])) && url[2] === pageName) {
      return true;
    } else if (
      url.length === 4 &&
      url[0] === 'portfolios' &&
      url[1] === pageName &&
      url[2] === 'saved-searches' &&
      !isNaN(Number(url[3]))
    ) {
      return true;
    } else {
      return false;
    }
  }

  private rootRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private setMinimumContentHeight(): void {
    this.minimumContentHeight = window.innerHeight - this.headerAndFooterHeight;
  }

  private getUrlSegments(url: string): string[] {
    return url.split('/').filter((segment) => segment !== '');
  }
}
