import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, mergeMap, of } from 'rxjs';

import { AppConfigService } from '../app-config.service';
import { AppUserService } from '../app-user.service';

@Injectable({
  providedIn: 'root'
})
export class AppUserGuard {
  constructor(
    private readonly appUserService: AppUserService,
    private readonly appConfigService: AppConfigService,
    @Inject('WINDOW') private readonly window: Window
  ) {}

  canActivateChild(): Observable<boolean> {
    return this.appUserService.getAppUser().pipe(
      mergeMap((user) => {
        if (!user.claims || user.claims.length === 0) {
          this.window.location.href = this.appConfigService.configuration.noAccessUrl;
          return of(false);
        } else {
          return of(true);
        }
      }),
      catchError((error) => {
        if (error.status === 403) {
          this.window.location.href = this.appConfigService.configuration.noAccessUrl;
        }
        return of(false);
      })
    );
  }
}
