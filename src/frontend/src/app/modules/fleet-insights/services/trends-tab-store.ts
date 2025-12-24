import { Injectable } from '@angular/core';
import { GroupSummaryWithTimeline, SummaryResponseModel } from '../models/summary-response-model';
import { ComponentStore } from '@ngrx/component-store';
import { FleetInsightsTrendsSummaryRequest } from '../models/fleet-insights-trends-summary-request';
import { FleetInsightsStore } from './fleet-insights-store';
import { debounceTime, map, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { mapFiltersToFleetInsightsTrendsSummaryRequest } from './fleet-insights-trends-summary-mapper.util';
import { FleetInsightsTrendsService } from './fleet-insights-trends-service';

interface TrendsTabState {
  trendsSummaryList: SummaryResponseModel;
}
@Injectable()
export class TrendsTabStore extends ComponentStore<TrendsTabState> {
  constructor(private fleetInsightsTrendsService: FleetInsightsTrendsService, private fleetInsightsStore: FleetInsightsStore) {
    super({
      trendsSummaryList: { summaryList: [] }
    });

    this.loadSummaryDataEffect(this.fleetInsightsStore.trendsTabSummaryFilters$.pipe(debounceTime(300)));
  }

  readonly setSummaryList = this.updater((state, summaryList: GroupSummaryWithTimeline[]) => ({
    ...state,
    trendsSummaryList: { summaryList }
  }));
  readonly setSummaryRequest = this.updater((state, summaryRequest: FleetInsightsTrendsSummaryRequest) => ({
    ...state,
    trendsRequest: summaryRequest
  }));

  readonly trendsSummaryList$ = this.select((state) => state.trendsSummaryList);

  readonly loadSummaryDataEffect = this.effect<any>((filters$) =>
    filters$.pipe(
      tap(),
      map((filters) => {
        const request = mapFiltersToFleetInsightsTrendsSummaryRequest(filters);
        //mapFiltersToFleetInsightsTrendsSummaryRequest
        this.setSummaryRequest(request);
        return request;
      }),
      switchMap((request) =>
        this.fleetInsightsTrendsService.getTrendsSummaryData(request).pipe(
          tapResponse(
            (response) => {
              this.setSummaryList(response.summaryList || []);
            },
            () => {
              console.error('error loading summary table data');
            }
          )
        )
      )
    )
  );
}
