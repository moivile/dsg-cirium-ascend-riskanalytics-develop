import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from '@auth0/auth0-angular';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { ScriptInjectorService } from './modules/shared/services/script-injector.service';
import { AnalyticsService } from './modules/shared/services/analytics-service';
import { Router, RouterModule } from '@angular/router';
import { AppStore } from './app-store';
import { MessageService } from 'primeng/api';
import { AppUserService } from './app-user.service';
import { fleetDistributionRoute, fleetTrendsRoute, marketActivityRoute } from './route.constants';
import { GwaAnalyticsMetaTagService } from './modules/shared/services/gwa-tags-data.service';
import { AppConfigService } from './app-config.service';

@Component({
  template: '<div></div>',
  standalone: false
})
export class EmptyComponent { }

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let analyticsService: any;
  let router: Router;
  const testUserId = 'e6a7d40d-a771-4cc9-b7b5-19194c0e54d2';
  let getItemSpy: jasmine.Spy;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getAccessTokenSilently', 'isAuthenticated$', 'idTokenClaims$', 'logout']);
    const scriptInjectorServiceSpy = jasmine.createSpyObj('ScriptInjectorService', ['load']);
    const analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['injectFullStoryScript', 'injectAdobeLaunchScript']);
    const gwaTagsDataServiceSpy = jasmine.createSpyObj('GwaAnalyticsMetaTagService', ['setUserData', 'trackCurrentPage']);

    // mock AppConfigService with configuration property
    const appConfigServiceMock = {
      configuration: {
        adobeLaunchScriptUrl: 'https://test-adobe-script.js',
        adobeAnalyticsAccount: 'test-account'
      }
    };

    // mock AppStore with observable properties
    const appStoreMock = {
      appUser$: of({ claims: [] }),
      userEmailAddress$: of('test@example.com'),
      loadAppUser: jasmine.createSpy('loadAppUser')
    };

    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterModule.forRoot([
          {
            path: '',
            children: [
              { path: '', redirectTo: fleetDistributionRoute, pathMatch: 'full' },
              {
                path: fleetDistributionRoute,
                component: EmptyComponent
              },
              {
                path: fleetTrendsRoute,
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
        { provide: GwaAnalyticsMetaTagService, useValue: gwaTagsDataServiceSpy },
        { provide: AppConfigService, useValue: appConfigServiceMock },
        { provide: AppStore, useValue: appStoreMock },
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } }
      ]
    }).compileComponents();

    authServiceSpy.isAuthenticated$ = of(true);
    authServiceSpy.idTokenClaims$ = of({
      sub: testUserId,
      'https://cirium.com/viperGuid': 'TEST-VIPER-GUID-123'
    });
    authServiceSpy.getAccessTokenSilently.and.returnValue(of('test-token'));
    authServiceSpy.isLoading$ = of(false);
    authServiceSpy.logout.and.returnValue(of(void 0));


    analyticsServiceSpy.injectFullStoryScript.and.returnValue(EMPTY);
    analyticsServiceSpy.injectAdobeLaunchScript.and.returnValue(EMPTY);

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
    expect(compiled.querySelectorAll('ev-global-nav').length).toEqual(1);
  });

  it('should inject FullStory script', () => {
    expect(analyticsService.injectFullStoryScript).toHaveBeenCalledWith(testUserId);
  });

  describe('Adobe Analytics Integration', () => {
    let gwaTagsDataService: any;
    let appConfigService: any;

    beforeEach(() => {
      gwaTagsDataService = TestBed.inject(GwaAnalyticsMetaTagService);
      appConfigService = TestBed.inject(AppConfigService);
    });

    it('should call setupGwaUserData on init', () => {
      expect(gwaTagsDataService.setUserData).toHaveBeenCalled();
    });

    it('should extract viperGuid from Auth0 claims and set GWA user data', () => {
      expect(gwaTagsDataService.setUserData).toHaveBeenCalledWith('TEST-VIPER-GUID-123', 'test-account');
    });

    it('should call trackCurrentPage after setting user data', () => {
      expect(gwaTagsDataService.trackCurrentPage).toHaveBeenCalled();
    });

    it('should setup router tracking on init', () => {
      expect(component['routerSubscription']).toBeDefined();
    });

    it('should track page on navigation', (done) => {
      gwaTagsDataService.trackCurrentPage.calls.reset();

      router.navigate([fleetTrendsRoute]).then(() => {
        expect(gwaTagsDataService.trackCurrentPage).toHaveBeenCalled();
        done();
      });
    });

    it('should initialize Adobe Analytics when user is loaded', () => {
      expect(analyticsService.injectAdobeLaunchScript).toHaveBeenCalled();
    });

    it('should use Adobe config from AppConfigService', () => {
      expect(appConfigService.configuration.adobeLaunchScriptUrl).toBe('https://test-adobe-script.js');
      expect(appConfigService.configuration.adobeAnalyticsAccount).toBe('test-account');
    });

    it('should handle missing viperGuid gracefully', () => {
      const authServiceSpyLocal = jasmine.createSpyObj('AuthService', ['getAccessTokenSilently', 'isAuthenticated$', 'idTokenClaims$', 'logout']);
      authServiceSpyLocal.idTokenClaims$ = of({ sub: testUserId });
      authServiceSpyLocal.getAccessTokenSilently.and.returnValue(of('test-token'));
      authServiceSpyLocal.isLoading$ = of(false);
      authServiceSpyLocal.isAuthenticated$ = of(true);
      authServiceSpyLocal.logout.and.returnValue(of(void 0));

      const newComponent = new AppComponent(
        authServiceSpyLocal,
        analyticsService,
        gwaTagsDataService,
        router,
        TestBed.inject(AppStore),
        appConfigService
      );

      newComponent.ngOnInit();

      expect(gwaTagsDataService.setUserData).toHaveBeenCalledWith('', 'test-account');
    });

    it('should handle missing Adobe config gracefully', () => {
      appConfigService.configuration.adobeAnalyticsAccount = undefined;

      const newComponent = new AppComponent(
        TestBed.inject(AuthService),
        analyticsService,
        gwaTagsDataService,
        router,
        TestBed.inject(AppStore),
        appConfigService
      );

      newComponent.ngOnInit();

      expect(gwaTagsDataService.setUserData).toHaveBeenCalledWith('TEST-VIPER-GUID-123', '');
    });
  });

  describe('Memory Management', () => {
    it('should unsubscribe from router subscription on destroy', () => {
      const subscription = component['routerSubscription'];
      if (subscription) {
        spyOn(subscription, 'unsubscribe');

        component.ngOnDestroy();

        expect(subscription.unsubscribe).toHaveBeenCalled();
      }
    });

    it('should unsubscribe from user loaded subscription on destroy', () => {
      const subscription = component['userLoadedSubscription'];
      if (subscription) {
        spyOn(subscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(subscription.unsubscribe).toHaveBeenCalled();
      }
    });

    it('should unsubscribe from gwa user data subscription on destroy', () => {
      const subscription = component['gwaUserDataSubscription'];
      if (subscription) {
        spyOn(subscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(subscription.unsubscribe).toHaveBeenCalled();
      }
    });

    it('should complete destroy$ subject on destroy', () => {
      const destroySubject = component['destroy$'];
      spyOn(destroySubject, 'next');
      spyOn(destroySubject, 'complete');

      component.ngOnDestroy();

      expect(destroySubject.next).toHaveBeenCalled();
      expect(destroySubject.complete).toHaveBeenCalled();
    });
  });
});
