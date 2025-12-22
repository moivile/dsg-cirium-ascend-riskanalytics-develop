import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { AppUserService } from '../app-user.service';
import { Claim } from '../modules/shared/models/claim';
import { Router } from '@angular/router';
import { assetWatchUpsellRoute } from '../route.constants';

@Injectable({
  providedIn: 'root'
})
export class AssetWatchGuard {
  constructor(
    private appUserService: AppUserService,
    private readonly router: Router,
  ) {}

  canActivate(): Observable<boolean> {
    return this.appUserService.getAppUser().pipe(
      mergeMap((user) => {
        if (!user.claims.includes(Claim.assetWatchAddOn)) {
          this.router.navigate([assetWatchUpsellRoute]);
          return of(false);
        } else {
          return of(true);
        }
      }),
      catchError(() => {
        return of(false);
      })
    );
  }
}
