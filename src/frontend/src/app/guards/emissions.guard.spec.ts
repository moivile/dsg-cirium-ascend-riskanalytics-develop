import { TestBed } from '@angular/core/testing';
import { AppUserService } from '../app-user.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Claim } from '../modules/shared/models/claim';
import { EmissionsGuard } from './emissions.guard';
import { Router } from '@angular/router';
import { emissionsUpsellRoute } from '../route.constants';

describe('EmissionsGuard', () => {
  let guard: EmissionsGuard;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let appUserServiceSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let routerSpy: any;

  beforeEach(() => {
    appUserServiceSpy = jasmine.createSpyObj('AppUserService', ['getAppUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [EmissionsGuard, { provide: AppUserService, useValue: appUserServiceSpy }, { provide: Router, useValue: routerSpy }]
    });

    guard = TestBed.inject(EmissionsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for user with emissionsAddOn claim', (done) => {
    const user = { claims: [Claim.emissionsAddOn] };
    appUserServiceSpy.getAppUser.and.returnValue(of(user));

    guard.canActivate().subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should redirect to emissions upsell page for user without emissionsAddOn claim', (done) => {
    const user = { claims: [Claim.standard] };
    appUserServiceSpy.getAppUser.and.returnValue(of(user));
    routerSpy.navigate([emissionsUpsellRoute]);

    guard.canActivate().subscribe((result) => {
      expect(result).toBeFalse();
      done();
    });
  });

  it('should return false if getAppUser returns error', (done) => {
    appUserServiceSpy.getAppUser.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    guard.canActivate().subscribe((result) => {
      expect(result).toBeFalse();
      done();
    });
  });
});
