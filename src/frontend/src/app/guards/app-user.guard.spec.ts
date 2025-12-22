import { TestBed } from '@angular/core/testing';
import { AppUserGuard } from './app-user.guard';
import { AppUserService } from '../app-user.service';
import { AppConfigService } from '../app-config.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('AppUserGuard', () => {
  let guard: AppUserGuard;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let appUserServiceSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let windowSpy: any;

  beforeEach(() => {
    appUserServiceSpy = jasmine.createSpyObj('AppUserService', ['getAppUser']);
    windowSpy = jasmine.createSpyObj('Window', ['location']);

    TestBed.configureTestingModule({
      providers: [
        AppUserGuard,
        { provide: AppUserService, useValue: appUserServiceSpy },
        { provide: AppConfigService, useValue: { configuration: { noAccessUrl: '/no-access' } } },
        { provide: 'WINDOW', useValue: windowSpy }
      ]
    });

    guard = TestBed.inject(AppUserGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for user with claims', (done) => {
    const user = { claims: ['admin'] };
    appUserServiceSpy.getAppUser.and.returnValue(of(user));

    guard.canActivateChild().subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should redirect to no-access url for user without claims', (done) => {
    const user = { claims: [] };
    appUserServiceSpy.getAppUser.and.returnValue(of(user));

    guard.canActivateChild().subscribe((result) => {
      expect(result).toBeFalse();
      expect(windowSpy.location.href).toBe('/no-access');
      done();
    });
  });

  it('should redirect to no-access url for 403 error', (done) => {
    appUserServiceSpy.getAppUser.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));

    guard.canActivateChild().subscribe((result) => {
      expect(result).toBeFalse();
      expect(windowSpy.location.href).toBe('/no-access');
      done();
    });
  });

  it('should return false for other errors', (done) => {
    appUserServiceSpy.getAppUser.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    guard.canActivateChild().subscribe((result) => {
      expect(result).toBeFalse();
      done();
    });
  });
});
