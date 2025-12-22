import { TestBed } from '@angular/core/testing';
import { AppUserService } from '../app-user.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Claim } from '../modules/shared/models/claim';

import { Router } from '@angular/router';
import { AssetWatchGuard } from './asset-watch.guard';
import { assetWatchUpsellRoute } from '../route.constants';

describe('AssetWatchGuard', () => {
  let guard: AssetWatchGuard;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let appUserServiceSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let routerSpy: any;

  beforeEach(() => {
    appUserServiceSpy = jasmine.createSpyObj('AppUserService', ['getAppUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [AssetWatchGuard, { provide: AppUserService, useValue: appUserServiceSpy }, { provide: Router, useValue: routerSpy }]
    });

    guard = TestBed.inject(AssetWatchGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for user with assetWatchAddOn claim', (done) => {
    const user = { claims: [Claim.assetWatchAddOn] };
    appUserServiceSpy.getAppUser.and.returnValue(of(user));

    guard.canActivate().subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });

  it('should redirect to Asset Watch upsell page for user without assetWatchAddOn claim', (done) => {
    const user = { claims: [Claim.standard] };
    appUserServiceSpy.getAppUser.and.returnValue(of(user));
    routerSpy.navigate([assetWatchUpsellRoute]);

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
