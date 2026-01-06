import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { Portfolio } from './modules/shared/models/portfolio';
import { Injectable } from '@angular/core';
import { PortfoliosService } from './modules/shared/services/portfolios.service';
import { Observable, Subject, merge, switchMap } from 'rxjs';
import { NoticeService } from './modules/shared/services/notice.service';
import { AppUserService, User } from './app-user.service';
import { Claim } from './modules/shared/models/claim';

export interface AppState {
  portfolios: Portfolio[];
  portfoliosLoaded: boolean;
  selectedPortfolioId: number | null;
  appUser: User | null;
}

export const initialState: AppState = {
  portfolios: [],
  portfoliosLoaded: false,
  selectedPortfolioId: localStorage.getItem('selectedPortfolioId') ? Number(localStorage.getItem('selectedPortfolioId')) : null,
  appUser: null
};

@Injectable()
export class AppStore extends ComponentStore<AppState> {
  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly noticeService: NoticeService,
    private userService: AppUserService
  ) {
    super(initialState);
  }

  readonly portfolios$ = this.select((state) => state.portfolios);
  readonly portfoliosLoaded$ = this.select((state) => state.portfoliosLoaded);

  readonly numberOfPortfolios$ = this.select(this.portfolios$, (portfolios) => portfolios.length);
  readonly isPortfoliosEmpty$ = this.select(this.portfolios$, (portfolios) => portfolios.length === 0);

  triggerSelectedPortfolioId$ = new Subject<void>();

  selectedPortfolioId$ = merge(
    this.select((state) => state.selectedPortfolioId),
    this.triggerSelectedPortfolioId$.pipe(switchMap(() => this.select((state) => state.selectedPortfolioId)))
  );

  readonly selectedPortfolioName$ = this.select(this.portfolios$, this.selectedPortfolioId$, (portfolios, selectedPortfolioId) => {
    const portfolio = portfolios.find((portfolio) => portfolio.id === selectedPortfolioId);
    return portfolio?.name || '';
  });

  readonly appUser$ = this.select((state) => state.appUser);

  readonly appUserHasAssetWatchAddOn$ = this.select(this.appUser$, (appUser) => appUser?.claims.includes(Claim.assetWatchAddOn) === true);
  readonly appUserHasEmissionsAddOn$ = this.select(this.appUser$, (appUser) => appUser?.claims.includes(Claim.emissionsAddOn) === true);
  readonly userEmailAddress$ = this.select(this.appUser$, (appUser) => appUser?.userEmailAddress || '');

  readonly setPortfolios = this.updater((state, portfolios: Portfolio[]) => ({
    ...state,
    portfolios,
    portfoliosLoaded: true
  }));

  readonly setSelectedPortfolioId = this.updater((state, selectedPortfolioId: number | null) => {
    if (localStorage.getItem('savedSearchPortfolioId') !== selectedPortfolioId?.toString()) {
      localStorage.removeItem('savedSearchPortfolioId');
      localStorage.removeItem('savedSearchId');
    }
    localStorage.setItem('selectedPortfolioId', selectedPortfolioId?.toString() || '');
    return {
      ...state,
      selectedPortfolioId
    };
  });

  readonly setAppUser = this.updater((state, appUser: User) => ({
    ...state,
    appUser
  }));

  readonly loadPortfolios = this.effect<void>((trigger$) => {
    return trigger$.pipe(
      switchMap(() =>
        this.portfoliosService.getPortfolios().pipe(
          tapResponse(
            (portfolios) => this.setPortfolios(portfolios),
            () => console.log('error loading portfolios')
          )
        )
      )
    );
  });

  readonly deletePortfolio = this.effect<Portfolio>((portfolio$: Observable<Portfolio>) => {
    return portfolio$.pipe(
      switchMap((portfolio) => {
        return this.portfoliosService.deletePortfolio(portfolio.id).pipe(
          tapResponse(
            () => {
              this.noticeService.success(`Portfolio '${portfolio.name}' has been deleted`);
              this.loadPortfolios();
            },
            () => {
              this.noticeService.error(`Portfolio '${portfolio.name}' could not be deleted`);
            }
          )
        );
      })
    );
  });

  loadAppUser = this.effect<void>(() => {
    return this.userService.getAppUser().pipe(
      tapResponse(
        (appUser) => this.setAppUser(appUser),
        () => console.log('error loading app user')
      )
    );
  });
}
