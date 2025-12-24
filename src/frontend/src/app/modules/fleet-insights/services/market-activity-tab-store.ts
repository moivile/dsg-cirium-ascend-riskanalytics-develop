import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, tap, debounceTime, map } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { FleetInsightsMarketActivityService } from './fleet-insights-market-activity-service';
import { MarketActivitySummaryRequest } from '../models/market-activity-summary-request';
import { MarketActivitySummaryModel } from '../models/market-activity-summary-model';
import { MarketActivityTrendsRequest } from '../models/market-activity-trends-request';
import { MarketActivityTrendsModel, MarketActivityTrendsApiResponse } from '../models/market-activity-trends-model';
import { FleetInsightsStore } from './fleet-insights-store';
import { mapFiltersToMarketActivitySummaryRequest, mapFiltersToMarketActivityTrendsRequest } from './market-activity-summary-mapper.util';
import { FilterPanelFormValueModel } from '../models/filter-panel-form-model';
import { GroupAllDataByOptions } from '../models/group-all-data-by';
import { IntervalType } from '../models/interval-type.enum';

interface MarketActivityTabState {
  marketActivitySummaryData: MarketActivitySummaryModel[];
  marketActivityTrendsData: MarketActivityTrendsModel[];
  totalSummaryRecords: number;
  totalTrendsRecords: number;
  loading: boolean;
  trendsLoading: boolean;
  error: string | null;
  trendsError: string | null;
  summaryRequest?: MarketActivitySummaryRequest;
  trendsRequest?: MarketActivityTrendsRequest;
}

const initialState: MarketActivityTabState = {
  marketActivitySummaryData: [],
  marketActivityTrendsData: [],
  totalSummaryRecords: 0,
  totalTrendsRecords: 0,
  loading: false,
  trendsLoading: false,
  error: null,
  trendsError: null
};

@Injectable()
export class MarketActivityTabStore extends ComponentStore<MarketActivityTabState> {
  constructor(private marketActivityService: FleetInsightsMarketActivityService, private fleetInsightsStore: FleetInsightsStore) {
    super(initialState);

    // Auto-load data when filters change
    this.loadMarketActivitySummaryDataEffect(this.fleetInsightsStore.marketActivityTabSummaryFilters$.pipe(debounceTime(300)));
    this.loadMarketActivityTrendsDataEffect(this.fleetInsightsStore.marketActivityTabSummaryFilters$.pipe(debounceTime(300)));
  }

  // Selectors
  readonly marketActivitySummaryData$ = this.select((state) => state.marketActivitySummaryData);
  readonly marketActivityTrendsData$ = this.select((state) => state.marketActivityTrendsData);
  readonly totalTrendsRecords$ = this.select((state) => state.totalTrendsRecords);
  readonly totalNumberOfEvents$ = this.select(this.marketActivitySummaryData$, (list) =>
    list.reduce((acc, curr) => acc + curr.numberOfEvents, 0)
  );
  readonly totalSummaryRecords$ = this.select((state) => state.marketActivitySummaryData.length);
  readonly hasSummaryRecords$ = this.select(this.totalSummaryRecords$, (total) => total > 0);

  readonly loading$ = this.select((state) => state.loading);
  readonly trendsLoading$ = this.select((state) => state.trendsLoading);
  readonly error$ = this.select((state) => state.error);
  readonly trendsError$ = this.select((state) => state.trendsError);

  // Updaters
  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading
  }));

  readonly setTrendsLoading = this.updater((state, trendsLoading: boolean) => ({
    ...state,
    trendsLoading
  }));

  readonly setMarketActivitySummaryData = this.updater((state, data: MarketActivitySummaryModel[]) => ({
    ...state,
    marketActivitySummaryData: data
  }));

  readonly setMarketActivityTrendsData = this.updater((state, data: MarketActivityTrendsModel[]) => ({
    ...state,
    marketActivityTrendsData: data,
    totalTrendsRecords: data.length
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error
  }));

  readonly setTrendsError = this.updater((state, trendsError: string | null) => ({
    ...state,
    trendsError
  }));

  readonly setSummaryRequest = this.updater((state, summaryRequest: MarketActivitySummaryRequest) => ({
    ...state,
    summaryRequest
  }));

  readonly setTrendsRequest = this.updater((state, trendsRequest: MarketActivityTrendsRequest) => ({
    ...state,
    trendsRequest
  }));

  // Effects - Auto-loading effect for market activity
  readonly loadMarketActivitySummaryDataEffect = this.effect(
    (
      filters$: Observable<{
        marketActivityTabLeftPanelFilters: Partial<FilterPanelFormValueModel>;
        groupAllDataByValue: GroupAllDataByOptions;
      }>
    ) =>
      filters$.pipe(
        tap(() => this.setLoading(true)),
        map((filters) => {
          const request = mapFiltersToMarketActivitySummaryRequest(filters);
          this.setSummaryRequest(request);
          return request;
        }),
        switchMap((request) =>
          this.marketActivityService.getMarketActivitySummaryData(request).pipe(
            tapResponse(
              (response) => {
                this.setMarketActivitySummaryData(response.summaryList || []);
                this.setLoading(false);
              },
              (error) => {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                this.setError(errorMessage);
                this.setLoading(false);
              }
            )
          )
        )
      )
  );

  // Auto-loading effect for trends data
  readonly loadMarketActivityTrendsDataEffect = this.effect(
    (
      filters$: Observable<{
        marketActivityTabLeftPanelFilters: Partial<FilterPanelFormValueModel>;
        groupAllDataByValue: GroupAllDataByOptions;
      }>
    ) =>
      filters$.pipe(
        tap(() => this.setTrendsLoading(true)),
        map((filters) => {
          const request = mapFiltersToMarketActivityTrendsRequest(filters);
          this.setTrendsRequest(request);
          return request;
        }),
        switchMap((request) =>
          this.marketActivityService.getMarketActivityTrendsData(request).pipe(
            tapResponse(
              (response) => {
                const transformedData = this.transformTrendsApiResponse(response.summaryList || [], request.interval);
                this.setMarketActivityTrendsData(transformedData);
                this.setTrendsLoading(false);
              },
              (error) => {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                this.setTrendsError(errorMessage);
                this.setTrendsLoading(false);
              }
            )
          )
        )
      )
  );

  // Manual loading effect (keeping this for backwards compatibility)
  readonly loadMarketActivitySummaryData = this.effect((request$: Observable<MarketActivitySummaryRequest>) =>
    request$.pipe(
      tap(() => this.setLoading(true)),
      switchMap((request) =>
        this.marketActivityService.getMarketActivitySummaryData(request).pipe(
          tapResponse(
            (response) => {
              this.setMarketActivitySummaryData(response.summaryList || []);
              this.setLoading(false);
            },
            (error) => {
              const errorMessage = error instanceof Error ? error.message : 'An error occurred';
              this.setError(errorMessage);
              this.setLoading(false);
            }
          )
        )
      )
    )
  );

  readonly loadMarketActivityTrendsData = this.effect((request$: Observable<MarketActivityTrendsRequest>) =>
    request$.pipe(
      tap(() => this.setTrendsLoading(true)),
      switchMap((request) =>
        this.marketActivityService.getMarketActivityTrendsData(request).pipe(
          tapResponse(
            (response) => {
              const transformedData = this.transformTrendsApiResponse(response.summaryList || [], request.interval);
              this.setMarketActivityTrendsData(transformedData);
              this.setTrendsLoading(false);
            },
            (error) => {
              const errorMessage = error instanceof Error ? error.message : 'An error occurred';
              this.setTrendsError(errorMessage);
              this.setTrendsLoading(false);
            }
          )
        )
      )
    )
  );

  private transformTrendsApiResponse(
    apiResponse: MarketActivityTrendsApiResponse[],
    intervalType: IntervalType
  ): MarketActivityTrendsModel[] {
    const result: MarketActivityTrendsModel[] = [];

    apiResponse.forEach((group) => {
      group.values.forEach((value) => {
        const period = this.formatPeriod(value.year, value.timePoint, intervalType);
        result.push({
          period,
          numberOfEvents: value.numberOfEvents,
          percentageOfTotal: value.percentageOfTotal,
          grouping: group.grouping
        });
      });
    });

    return result;
  }

  private formatPeriod(year: number, timePoint: number, intervalType: IntervalType): string {
    switch (intervalType) {
      case IntervalType.Monthly: {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = timePoint - 1;
        const monthName = monthNames[monthIndex] || `Month${timePoint}`;
        return `${monthName} ${year}`;
      }

      case IntervalType.Quarter: {
        return `Q${timePoint} ${year}`;
      }

      case IntervalType.Year: {
        return `${year}`;
      }

      default: {
        return `${timePoint} ${year}`;
      }
    }
  }
}
