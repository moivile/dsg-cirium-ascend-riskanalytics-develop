import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { take, filter, map, tap, catchError } from 'rxjs/operators';
import { AppStore } from '../app-store';

@Injectable({
  providedIn: 'root'
})
export class PortfoliosLoadedGuard {
  constructor(private appStore: AppStore, private router: Router) {}

  canActivate(): Observable<boolean> {
    this.appStore.portfoliosLoaded$.pipe(take(1)).subscribe((loaded) => {
      if (!loaded) {
        this.appStore.loadPortfolios();
      }
    });

    return combineLatest([
      this.appStore.portfoliosLoaded$.pipe(
        filter((loaded) => loaded),
        take(1)
      ),
      this.appStore.portfolios$.pipe(take(1))
    ]).pipe(
      map(([, portfolios]) => portfolios.length > 0),
      tap((hasPortfolios) => {
        if (!hasPortfolios) {
          this.router.navigate(['/portfolios']);
        }
      }),
      catchError(() => {
        this.router.navigate(['/portfolios']);
        return of(false);
      })
    );
  }
}
