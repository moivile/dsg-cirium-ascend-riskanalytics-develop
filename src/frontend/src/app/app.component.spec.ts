/* eslint-disable object-shorthand */
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from '@auth0/auth0-angular';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { ScriptInjectorService } from './modules/shared/services/script-injector.service';
import { AnalyticsService } from './modules/shared/services/analytics-service';
import { Router, RouterModule } from '@angular/router';
import { AppStore } from './app-store';
import { PortfoliosService } from './modules/shared/services/portfolios.service';
import { Portfolio } from './modules/shared/models/portfolio';
import { MessageService } from 'primeng/api';
import { AppUserService } from './app-user.service';
import {
  assetWatchRoute,
  assetWatchSavedSearchesRoute,
  fleetDistributionRoute,
  fleetInsightsRoute,
  fleetTrendsRoute,
  marketActivityRoute
} from './route.constants';

@Component({
  template: '<div></div>'
})
export class EmptyComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let analyticsService: any;
  let portfoliosService: any;
  let router: Router;
  const testUserId = 'e6a7d40d-a771-4cc9-b7b5-19194c0e54d2';
  let getItemSpy: jasmine.Spy;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getAccessTokenSilently', 'isAuthenticated$', 'idTokenClaims$']);
    const scriptInjectorServiceSpy = jasmine.createSpyObj('ScriptInjectorService', ['load']);
    const analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['injectFullStoryScript']);
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolios']);

    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterModule.forRoot([
          {
            path: '',
            children: [
              { path: fleetInsightsRoute, redirectTo: fleetDistributionRoute, pathMatch: 'full' },
              {
                path: fleetDistributionRoute,
                component: EmptyComponent
              }
            ]
          }
        ])
      ],
      declarations: [AppComponent, EmptyComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ScriptInjectorService, useValue: scriptInjectorServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        AppStore,
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } }
      ]
    }).compileComponents();

    portfoliosService = TestBed.inject(PortfoliosService);
    portfoliosService.getPortfolios['and'].returnValue(of(testPortfolios));

    authServiceSpy.isAuthenticated$ = of(true);
    authServiceSpy.idTokenClaims$ = of({ sub: testUserId });
    authServiceSpy.getAccessTokenSilently.and.returnValue(of({ token: 'blah' }));

    analyticsServiceSpy.injectFullStoryScript.and.returnValue(EMPTY);

    analyticsService = TestBed.inject(AnalyticsService);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    getItemSpy = spyOn(localStorage, 'getItem');

    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render global header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('af-global-header').length).toEqual(1);
  });

  it('should inject FullStory script', () => {
    expect(analyticsService.injectFullStoryScript).toHaveBeenCalledWith(testUserId);
  });

  it('should return true if isPortfoliosPage', () => {
    defineRouterUrlProperty('/portfolios');
    expect(component.isPortfoliosPage).toBeTrue();

    defineRouterUrlProperty('/portfolios/123');
    expect(component.isPortfoliosPage).toBeFalse();
  });

  it('should return true if isHoursAndCyclesPage', () => {
    defineRouterUrlProperty('/portfolios/123/hours-and-cycles');
    expect(component.isHoursAndCyclesPage).toBeTrue();

    defineRouterUrlProperty('/portfolios/hours-and-cycles');
    expect(component.isHoursAndCyclesPage).toBeTrue();

    defineRouterUrlProperty('/portfolios/123');
    expect(component.isHoursAndCyclesPage).toBeFalse();
  });

  it('should return true if isEmissionsPage', () => {
    defineRouterUrlProperty('/portfolios/123/emissions');
    expect(component.isEmissionsPage).toBeTrue();

    defineRouterUrlProperty('/portfolios/emissions');
    expect(component.isEmissionsPage).toBeTrue();

    defineRouterUrlProperty('/portfolios/123');
    expect(component.isEmissionsPage).toBeFalse();
  });

  it('should return true if isAssetWatchPage', () => {
    defineRouterUrlProperty('/portfolios/asset-watch');
    expect(component.isAssetWatchPage).toBeTrue();

    defineRouterUrlProperty('/portfolios/123/asset-watch');
    expect(component.isAssetWatchPage).toBeTrue();

    defineRouterUrlProperty('/portfolios');
    expect(component.isAssetWatchPage).toBeFalse();
  });

  it('should navigate to the saved search path if savedSearchId exists in localStorage', () => {
    const savedSearchId = '123';
    getItemSpy.and.returnValue(savedSearchId);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.navigateToAssetWatch();

    expect(router.navigate).toHaveBeenCalledWith([`/${assetWatchSavedSearchesRoute}/${savedSearchId}`]);
  });

  it('should navigate to the default path if savedSearchId does not exist in localStorage', () => {
    getItemSpy.and.returnValue(null);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.navigateToAssetWatch();

    expect(router.navigate).toHaveBeenCalledWith([`/${assetWatchRoute}`]);
  });

  it('should detect fleet insights page', fakeAsync(() => {
    router.navigate([`/${fleetInsightsRoute}`]);
    flush();

    component.isFleetInsightsPage$.subscribe((isFleetInsightsPage) => {
      expect(isFleetInsightsPage).toBeTrue();
    });
  }));

  const testPortfolios: Portfolio[] = [
    {
      id: 1,
      name: 'Portfolio 1',
      dateModified: '2023-02-07T08:51:10.619238',
      dateCreated: '2023-02-07T08:51:10.619238',
      numberOfAircraft: 10
    },
    {
      id: 2,
      name: 'Portfolio 2',
      dateModified: '2023-02-07T08:51:10.619238',
      dateCreated: '2023-02-07T08:51:10.619238',
      numberOfAircraft: 12
    },
    {
      id: 3,
      name: 'Portfolio 3',
      dateModified: '2023-02-07T08:51:10.619238',
      dateCreated: '2023-02-07T08:51:10.619238',
      numberOfAircraft: 100
    }
  ];

  const defineRouterUrlProperty = (url: string): void => {
    Object.defineProperty(router, 'url', {
      get: () => url,
      configurable: true
    });
  };
});
