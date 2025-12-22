import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Observable, switchMap, withLatestFrom } from 'rxjs';
import { UpsertPortfolioRequest } from '../../shared/models/upsert-portfolio-request';
import { Aircraft } from '../../shared/models/aircraft';
import { NoticeService } from '../../shared/services/notice.service';
import { PortfoliosService } from '../../shared/services/portfolios.service';
import { PortfolioAircraftService } from '../../shared/services/portfolio-aircraft.service';
import { AppStore } from 'src/app/app-store';

export interface CreateEditPortfolioState extends EntityState<Aircraft> {
  id: number | undefined;
}

export const adapter: EntityAdapter<Aircraft> = createEntityAdapter<Aircraft>({
  selectId: (aircraft) => aircraft.aircraftId,
  sortComparer: (a, b) => (a.aircraftSerialNumber || '').localeCompare(b.aircraftSerialNumber || '')
});

export const initialState: CreateEditPortfolioState = adapter.getInitialState({ id: undefined });

@Injectable()
export class CreateEditPortfolioStore extends ComponentStore<CreateEditPortfolioState> {
  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly portfolioAircraftService: PortfolioAircraftService,
    private readonly noticeService: NoticeService,
    private readonly router: Router,
    private readonly appStore: AppStore
  ) {
    super(initialState);
  }

  readonly aircraftList$ = this.select((state) => adapter.getSelectors().selectAll(state));
  readonly aircraftIds$ = this.select((state) => adapter.getSelectors().selectIds(state));
  readonly numberOfAircraft$ = this.select((state) => adapter.getSelectors().selectTotal(state));
  readonly id$ = this.select((state) => state.id);

  readonly setId = this.updater((state, id: number | undefined) => ({ ...state, id }));
  readonly setAircraftList = this.updater((state, aircraftList: Aircraft[]) => adapter.setAll(aircraftList, state));

  readonly addAircraftList = this.updater((state, aircraftList: Aircraft[]) => adapter.addMany(aircraftList, state));

  readonly removeAircraftList = this.updater((state, aircraftIds: number[]) => adapter.removeMany(aircraftIds, state));

  readonly loadAircraftList = this.effect((id$: Observable<number>) => {
    return id$.pipe(
      switchMap((id) => {
        return this.portfolioAircraftService.getPortfolioAircraft(id).pipe(
          tapResponse(
            (aircraftList) => {
              this.setAircraftList(aircraftList);
            },
            () => {
              console.log('error loading aircraft list');
            }
          )
        );
      })
    );
  });

  readonly upsertPortfolio = this.effect<string>((name$: Observable<string>) => {
    return name$.pipe(
      withLatestFrom(this.aircraftIds$, this.id$),
      switchMap(([name, aircraftIds, id]) => {
        const model: UpsertPortfolioRequest = {
          id,
          name,
          aircraftIds: aircraftIds as number[]
        };

        return this.portfoliosService.upsertPortfolio(model).pipe(
          switchMap((id) =>
            this.portfoliosService.getPortfolios().pipe(
              tapResponse(
                (portfolios) => {
                  this.appStore.setPortfolios(portfolios);

                  this.noticeService.success(`Portfolio '${name}' has been ${model.id ? 'updated' : 'created'}`);
                  this.router.navigate(['portfolios', model?.id || id]);
                },
                () => {
                  console.log('error upserting portfolio');
                }
              )
            )
          )
        );
      })
    );
  });
}
