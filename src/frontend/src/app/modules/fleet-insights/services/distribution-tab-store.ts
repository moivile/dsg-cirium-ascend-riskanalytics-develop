import { ComponentStore } from '@ngrx/component-store';
import { FleetInsightsAircraftSummaryModel } from '../models/fleet-insights-aircraft-summary-model';
import { FleetInsightsAircraftSummaryRequest } from '../models/fleet-insights-aircraft-summary-request';
import { FleetInsightsService } from './fleet-insights-service';
import { FleetInsightsStore } from './fleet-insights-store';
import { debounceTime, map, switchMap, tap } from 'rxjs';
import { mapFiltersToFleetInsightsAircraftSummaryRequest } from './fleet-insights-mapper.util';
import { tapResponse } from '@ngrx/operators';
import { Injectable } from '@angular/core';

interface DistributionTabState {
  totalAircraftRecords: number;
  summaryList: FleetInsightsAircraftSummaryModel[];
  summaryLoading: boolean;
  summaryRequest?: FleetInsightsAircraftSummaryRequest;
}
@Injectable()
export class DistributionTabStore extends ComponentStore<DistributionTabState> {
  constructor(private fleetInsightsService: FleetInsightsService, private fleetInsightsStore: FleetInsightsStore) {
    super({
      totalAircraftRecords: 0,
      summaryList: [],
      summaryLoading: false
    });

    this.loadSummaryDataEffect(this.fleetInsightsStore.distributionTabSummaryFilters$.pipe(debounceTime(300)));
  }

  // Updaters
  readonly setTotalAircraftRecords = this.updater((state, totalAircraftRecords: number) => ({
    ...state,
    totalAircraftRecords
  }));

  readonly setSummaryList = this.updater((state, summaryList: FleetInsightsAircraftSummaryModel[]) => ({
    ...state,
    summaryList
  }));

  readonly setSummaryLoading = this.updater((state, summaryLoading: boolean) => ({
    ...state,
    summaryLoading
  }));

  readonly setSummaryRequest = this.updater((state, summaryRequest: FleetInsightsAircraftSummaryRequest) => ({
    ...state,
    summaryRequest
  }));

  // Selectors
  readonly totalAircraftRecords$ = this.select((state) => state.totalAircraftRecords);

  readonly summaryList$ = this.select((state) => state.summaryList);
  readonly totalSummaryRecords$ = this.select(this.summaryList$, (summaryList) => summaryList?.length || 0);
  readonly totalNumberOfAircraft$ = this.select((state) => state.summaryList?.reduce((acc, cur) => acc + cur.numberOfAircraft, 0));
  readonly summaryLoading$ = this.select((state) => state.summaryLoading);

  readonly loadSummaryDataEffect = this.effect<any>((filters$) =>
    filters$.pipe(
      // Set loading to true before request
      tap(() => this.setSummaryLoading(true)),
      map((filters) => {
        const request = mapFiltersToFleetInsightsAircraftSummaryRequest(filters);
        this.setSummaryRequest(request);
        return request;
      }),
      switchMap((request) =>
        this.fleetInsightsService.getAircraftSummaryData(request).pipe(
          tapResponse(
            (response) => {
              this.setSummaryList(response.aircraftSummaryList || []);
              this.setSummaryLoading(false);
            },
            () => {
              console.error('error loading summary table data');
              this.setSummaryLoading(false);
            }
          )
        )
      )
    )
  );
}
