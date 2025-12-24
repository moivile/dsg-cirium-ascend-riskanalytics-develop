import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AuthService, IdToken } from '@auth0/auth0-angular';
import { AnalyticsService } from './modules/shared/services/analytics-service';
import { GwaAnalyticsMetaTagService } from './modules/shared/services/gwa-tags-data.service';
import { Subject, filter, map, mergeMap, shareReplay, take, Subscription, distinctUntilChanged, tap } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { AppStore } from './app-store';
import { FormControl } from '@angular/forms';
import { fleetDistributionRoute, fleetTrendsRoute, marketActivityRoute } from './route.constants';
import { AppConfigService } from './app-config.service';

@Component({
  selector: 'ra-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  readonly headerTitle = 'Fleet Insights';
  readonly apiHost: string;



  logoutUrl!: string;
  token: string | undefined;
  showGlobalNav = false;
  selectedPortfolioIdControl = new FormControl<number | null>(null);

  currUrl$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event) => (event as NavigationEnd).url),
    shareReplay(1)
  );
  fleetDistributionRoute = fleetDistributionRoute;
  fleetTrendsRoute = fleetTrendsRoute;
  marketActivityRoute = marketActivityRoute;

  private readonly authAudience: string = 'cae-user-services';
  private readonly headerAndFooterHeight = 130;
  private destroy$ = new Subject<void>();
  private routerSubscription: Subscription | undefined;
  private userLoadedSubscription: Subscription | undefined;
  private gwaUserDataSubscription: Subscription | undefined;
  private globalHeaderSubscription: Subscription | undefined;
  private fullStorySubscription: Subscription | undefined;
  private cachedViperGuidKey: string | null = null;

  minimumContentHeight = window.innerHeight - this.headerAndFooterHeight;

  @HostListener('window:resize')
  onResize(): void {
    this.setMinimumContentHeight();
  }

  constructor(
    public readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly gwaTagsDataService: GwaAnalyticsMetaTagService,
    private readonly router: Router,
    public readonly appStore: AppStore,
    private readonly appConfigService: AppConfigService
  ) {
    this.apiHost = this.appConfigService.configuration.myCiriumApiUrl;
    this.appStore.loadAppUser();
  }

  ngOnInit(): void {
    this.setupGwaUserData();
    this.loadGlobalHeader();
    this.setupRouterTracking();
    this.initializeAdobeAnalytics();
  }

  loadGlobalHeader(): void {

    this.globalHeaderSubscription = this.authService.isLoading$
      .pipe(
        filter(loading => loading === false),
        take(1),
        mergeMap(() => this.authService.isAuthenticated$),
        filter(isAuth => isAuth === true),
        take(1),
        mergeMap(() =>
          this.authService.getAccessTokenSilently({
            authorizationParams: { audience: this.authAudience }
          })
        ),
        tap((token) => {
          this.token = token;
          this.showGlobalNav = true;

        }))
      .subscribe();

    this.fullStorySubscription = this.authService.idTokenClaims$
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

    this.authService.logout({
      // do not actually log out at this stage
      // override default logout functionality and just get the logout url for future use
      openUrl: (url) => {
        this.logoutUrl = url;
      },
      logoutParams: { returnTo: document.location.origin }
    }).subscribe();

  }

  setupGwaUserData(): void {
    this.gwaUserDataSubscription = this.authService.idTokenClaims$
      .pipe(
        filter((claims) => !!claims),
        take(1),
        map((claims) => {
          if (!this.cachedViperGuidKey) {
            const claimKeys = Object.keys(claims);
            this.cachedViperGuidKey = claimKeys.find((key) => key.endsWith('viperGuid')) || '';
          }

          const userId = claims[this.cachedViperGuidKey] || '';
          return userId;
        })
      )
      .subscribe((userId: string) => {
        try {
          const gwaAccount = this.appConfigService?.configuration?.adobeAnalyticsAccount || '';

          this.gwaTagsDataService.setUserData(userId, gwaAccount);
          this.gwaTagsDataService.trackCurrentPage();
        } catch (error) { }
      });
  }

  setupRouterTracking(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        try {
          this.gwaTagsDataService.trackCurrentPage();
        } catch (error) { }
      });
  }

  initializeAdobeAnalytics(): void {
    this.userLoadedSubscription = this.appStore.appUser$
      .pipe(
        filter((user) => !!user),
        take(1),
        distinctUntilChanged()
      )
      .subscribe({
        next: async () => {
          try {
            await this.analyticsService.injectAdobeLaunchScript();
          } catch (error) { }
        },
        error: () => { }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.routerSubscription?.unsubscribe();
    this.userLoadedSubscription?.unsubscribe();
    this.gwaUserDataSubscription?.unsubscribe();
    this.globalHeaderSubscription?.unsubscribe();
    this.fullStorySubscription?.unsubscribe();
  }

  private setMinimumContentHeight(): void {
    this.minimumContentHeight = window.innerHeight - this.headerAndFooterHeight;
  }

}
