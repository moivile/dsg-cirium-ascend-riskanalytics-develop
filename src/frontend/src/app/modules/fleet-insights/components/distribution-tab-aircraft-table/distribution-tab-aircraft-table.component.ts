import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { FleetInsightsService } from '../../services/fleet-insights-service';
import { FleetInsightsAircraftModel } from '../../models/fleet-insights-aircraft-model';
import { FleetInsightsSortByTypes } from '../../models/fleet-insights-sort-by-types';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { takeUntil, switchMap, debounceTime, take, map, catchError } from 'rxjs/operators';
import { TableLazyLoadEvent } from 'primeng/table';
import { tapResponse } from '@ngrx/operators';
import { PagingAndSortingParams } from '../../models/paging-and-sorting-params.model';
import { mapFiltersToFleetInsightsAircraftRequest } from '../../services/fleet-insights-mapper.util';
import { DistributionTabStore } from '../../services/distribution-tab-store';
import { AppConfigService } from '../../../../app-config.service';
import dayjs from 'dayjs';

@Component({
  selector: 'ra-distribution-tab-aircraft-table',
  templateUrl: './distribution-tab-aircraft-table.component.html',
  styleUrls: ['./distribution-tab-aircraft-table.component.scss'],
  standalone: false
})
export class DistributionTabAircraftTableComponent implements OnInit, OnDestroy {
  @Input() isActive = false;
  @Input() isAvailabilities = false;
  aircraftList: FleetInsightsAircraftModel[] = [];
  loading = false;
  defaultSortField = 'aircraftSerialNumber';
  defaultSortOrder = 1; // 1 for ascending, -1 for descending
  aircraftProfileUrlTemplate = this.appConfigService.configuration.aircraftProfileUrlTemplate;
  noAccessUrl = this.appConfigService.configuration.noAccessUrl;
  private lastLazyLoadEvent?: TableLazyLoadEvent;

  private destroy$ = new Subject<void>();
  private tableEvents$ = new Subject<TableLazyLoadEvent>();

  constructor(
    public fleetInsightsStore: FleetInsightsStore,
    public distributionTabStore: DistributionTabStore,
    private fleetInsightsService: FleetInsightsService,
    private appConfigService: AppConfigService
  ) {}

  ngOnInit(): void {
    combineLatest([this.fleetInsightsStore.distributionTabLeftPanelFilters$.pipe(debounceTime(300)), this.tableEvents$])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([filters, event]) => {
          this.loading = true;

          const pagingAndSortingParams = this.getPagingAndSortingParams(event);

          const request = mapFiltersToFleetInsightsAircraftRequest(filters, pagingAndSortingParams);
          return this.fleetInsightsService.getAircraftData(request).pipe(
            tapResponse(
              (response) => {
                this.aircraftList = response.aircraftList || [];
                this.distributionTabStore.setTotalAircraftRecords(response.totalCount);
                this.loading = false;
              },
              () => {
                console.log('error loading aircraft data ');
                this.loading = false;
              }
            )
          );
        })
      )
      .subscribe();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    // Save event for future use
    this.lastLazyLoadEvent = event;
    // Emit table events for pagination and sorting
    this.tableEvents$.next(event);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getAllAircraftForExport(): Observable<FleetInsightsAircraftModel[]> {
    // Use the last known sortEvent if available
    const maxNumberOfRows = 100000;
    const baseEvent: TableLazyLoadEvent = this.lastLazyLoadEvent ?? {
      first: 0,
      rows: maxNumberOfRows,
      sortField: this.defaultSortField,
      sortOrder: this.defaultSortOrder
    };

    // Force skip=0, take=100000 while keeping sort info
    const forcedEvent: TableLazyLoadEvent = {
      ...baseEvent,
      first: 0,
      rows: maxNumberOfRows
    };

    const pagingAndSortingParams = this.getPagingAndSortingParams(forcedEvent);
    // Get filters once and make a single request
    return this.fleetInsightsStore.distributionTabLeftPanelFilters$.pipe(
      take(1),
      switchMap((filters) => {
        const request = mapFiltersToFleetInsightsAircraftRequest(filters, pagingAndSortingParams);
        return this.fleetInsightsService.getAircraftData(request).pipe(
          map((response) => response.aircraftList || []),
          catchError((error) => {
            console.error('Error loading aircraft data for export:', error);
            return of([]);
          })
        );
      })
    );
  }

  getAircraftProfileLink(aircraft: FleetInsightsAircraftModel): string {
    if (aircraft?.aircraftId === undefined || aircraft.aircraftId === null) {
      return this.noAccessUrl;
    }
    return this.aircraftProfileUrlTemplate.replace('{aircraftID}', aircraft.aircraftId.toString());
  }

  isValidDate(date: string | undefined): boolean {
    if (!date) {
      return false;
    }

    return dayjs(date).isValid();
  }

  private getPagingAndSortingParams(event: TableLazyLoadEvent): PagingAndSortingParams {
    return {
      skip: event.first || 0,
      take: event.rows || 100,
      sortBy: this.getFleetInsightsSortByTypesItem(event?.sortField as string | undefined),
      sortDirectionAscending: event.sortOrder !== -1
    };
  }

  private getFleetInsightsSortByTypesItem(field: string | undefined): FleetInsightsSortByTypes {
    const mapping: { [key: string]: FleetInsightsSortByTypes } = {
      aircraftSerialNumber: FleetInsightsSortByTypes.AircraftSerialNumber,
      aircraftRegistrationNumber: FleetInsightsSortByTypes.AircraftRegistrationNumber,
      status: FleetInsightsSortByTypes.Status,
      aircraftManufacturer: FleetInsightsSortByTypes.AircraftManufacturer,
      aircraftSeries: FleetInsightsSortByTypes.AircraftSeries,
      engineSeries: FleetInsightsSortByTypes.EngineSeries,
      deliverydate: FleetInsightsSortByTypes.DeliveryDate,
      aircraftAgeYears: FleetInsightsSortByTypes.AircraftAgeYears,
      aircraftUsage: FleetInsightsSortByTypes.AircraftUsage,
      operator: FleetInsightsSortByTypes.Operator,
      manager: FleetInsightsSortByTypes.Manager,
      owner: FleetInsightsSortByTypes.Owner,
      ownership: FleetInsightsSortByTypes.Ownership,
      leaseStatus: FleetInsightsSortByTypes.LeaseStatus,
      leaseStart: FleetInsightsSortByTypes.LeaseStart,
      leaseEnd: FleetInsightsSortByTypes.LeaseEnd,
      availability: FleetInsightsSortByTypes.Availability
    };
    return field ? mapping[field] || FleetInsightsSortByTypes.AircraftSerialNumber : FleetInsightsSortByTypes.AircraftSerialNumber;
  }
}
