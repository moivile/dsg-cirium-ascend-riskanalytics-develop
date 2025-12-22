import { AfterViewInit, Component, EventEmitter, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  combineLatest,
  map,
  startWith,
  switchMap,
  withLatestFrom,
  BehaviorSubject,
  tap,
  firstValueFrom,
  filter,
  merge,
  Observable,
  of,
  Subject
} from 'rxjs';
import { Portfolio } from '../../../shared/models/portfolio';
import { FormControl, FormGroup } from '@angular/forms';
import { GroupingOption } from '../../models/grouping-option';
import { AircraftWatchlistFilterForm } from '../../models/aircraft-watchlist-filter-form';
import { FilterPanelForm } from '../../models/filter-panel-form';
import { TimePeriodOption } from '../../models/time-period-option';
import { AssetWatchSummaryRequest } from '../../models/asset-watch-summary-request';
import { tapResponse } from '@ngrx/operators';
import { AssetWatchSummaryService } from '../../services/asset-watch-summary.service';
import { ChartInputData as ChartInputData } from '../../models/chart-input-data';
import { SummaryGroundEventsModel } from '../../models/summary-ground-events-model';
import { SummaryFlightsModel } from '../../models/summary-flights-model';
import { MenuItem, TreeNode } from 'primeng/api';
import { TreeSelect } from 'primeng/treeselect';
import { AssetWatchExportExcelService } from '../../services/asset-watch-export-excel.service';
import { DomHandler } from 'primeng/dom';
import { AppStore } from '../../../../../app/app-store';
import { FilterByWatchlistOption } from '../../models/filter-by-watchlist-option';
import { AircraftWatchlistFilterValues } from '../../models/aircraft-watchlist-filter-values';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetWatchSavedSearchDetailsComponent } from '../asset-watch-saved-search-details/asset-watch-saved-search-details.component';
import { SavedSearchRequest } from '../../models/saved-search-request';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { AssetWatchStore } from '../../services/asset-watch-store';
import { NoticeService } from '../../../shared/services/notice.service';
import { distinctUntilChanged, skip, take, takeUntil } from 'rxjs/operators';
import { InputNumberInputEvent } from 'primeng/inputnumber';
import { ActivatedRoute, Router } from '@angular/router';
import { assetWatchSavedSearchesRoute } from '../../../../route.constants';
import { ConfirmationDialogOptions } from '../../../shared/models/confirmation-dialog-options';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'ra-asset-watch-tab',
  templateUrl: './asset-watch-tab.component.html',
  styleUrls: ['./asset-watch-tab.component.scss'],
  providers: [DialogService]
})
export class AssetWatchTabComponent implements OnInit, AfterViewInit, OnDestroy {
  public saveSearchManagementIsActive = false;
  filterExpanded = true;
  filterPanelExpandedCollapsedClass!: string;
  expandCollapseButtonHoverText = 'Collapse';
  filterExpandedCollapsedClass!: string;
  triggerOpenSavedSearch$ = new Subject<void>();
  groupingOptions = [
    GroupingOption.Region,
    GroupingOption.Country,
    GroupingOption.City,
    GroupingOption.Airport,
    GroupingOption.Operator,
    GroupingOption.Lessor,
    GroupingOption.MarketClass,
    GroupingOption.AircraftType,
    GroupingOption.AircraftSeries,
    GroupingOption.EngineSeries
  ];
  @ViewChild('filterByAOGTreeSelect')
  filterByAOGTreeSelect!: TreeSelect;

  selectedGroupingControl = new FormControl<GroupingOption>(GroupingOption.Country, { nonNullable: true });
  aircraftWatchlistFilterForm = new FormGroup<AircraftWatchlistFilterForm>(new AircraftWatchlistFilterForm());
  filterPanelForm: FormGroup<FilterPanelForm> = new FormGroup<FilterPanelForm>(new FilterPanelForm());
  selectedTimePeriodControl = new FormControl<TimePeriodOption>(TimePeriodOption.Last7Days, { nonNullable: true });

  portfolios: Portfolio[] = [];

  currentSummaryRequest: AssetWatchSummaryRequest | undefined;

  groundStaysChartInputData$: BehaviorSubject<ChartInputData> = new BehaviorSubject<ChartInputData>({} as ChartInputData);
  flightsChartInputData$: BehaviorSubject<ChartInputData> = new BehaviorSubject<ChartInputData>({} as ChartInputData);
  downloadFlightChart$: BehaviorSubject<Event> = new BehaviorSubject<Event>({} as Event);
  downloadGroundChart$: BehaviorSubject<Event> = new BehaviorSubject<Event>({} as Event);
  chartGroupCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  groundStaysChartLoading = false;
  flightsChartLoading = false;
  get isAOGSelected(): boolean {
    const filterOptions = this.aircraftWatchlistFilterForm.value?.filterByOptions;
    return filterOptions?.length === 1 && filterOptions[0].key === FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround];
  }
  minCurrentGroundStay = 0;
  maxCurrentGroundStay = 0;
  watchlistFilterValues: AircraftWatchlistFilterValues = { currentGroundStayAOG: 0, currentMaxGroundStayAOG: 0 };
  flightchartTooltip = 'Download Flights Chart';
  groundchartTooltip = 'Download Ground Stays Chart';
  menuTooltip = 'Chart download available at 100% zoom';
  showMenuTooltip = false;

  saveSearchMenuItems: MenuItem[] = [
    { label: '' },
    { label: 'Save', command: () => this.save() },
    { label: 'Save as', command: () => this.saveAs(), disabled: true }
  ];

  exportMenuItems: MenuItem[] = [
    { label: 'Export to Excel', command: () => this.exportExcel() },
    {
      label: 'Download Flights Chart',
      disabled: true,
      title: this.flightchartTooltip,
      command: () => {
        this.downloadFlightChart$.next(new Event('Download'));
      }
    },
    {
      label: 'Download Ground Stays Chart',
      disabled: true,
      title: this.groundchartTooltip,
      command: () => {
        this.downloadGroundChart$.next(new Event('Download'));
      }
    }
  ];

  private destroy$ = new Subject<void>();

  readonly emailAlertStatusText$ = this.assetWatchStore.isActive$.pipe(
    takeUntil(this.destroy$),
    map((isActive) => {
      if (isActive === true) {
        return 'Email Alerts are turned on';
      } else if (isActive === false) {
        return 'Email Alerts are turned off';
      } else {
        return 'Email Alerts are disabled';
      }
    })
  );

  showChartForZoom = true;
  initialZoomLevel = this.zoomLevel;
  chartDownloadToolTip = 'Download Chart';

  get zoomLevel(): number {
    const zoom = (window.outerWidth - 10) / window.innerWidth;
    this.showChartForZoom = zoom * 100 + 1 >= 100;
    return zoom;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.compareZoomLevel();
  }

  compareZoomLevel(): void {
    if (this.zoomLevel === this.initialZoomLevel) {
      this.updateExportMenuItems();
      return;
    }
    this.showChartForZoom = this.zoomLevel * 100 + 1 >= 100;
    this.showMenuTooltip =
      !this.showChartForZoom &&
      (this.flightsChartInputData$.value.labels?.length > 0 || this.groundStaysChartInputData$.value.labels?.length > 0);
    this.initialZoomLevel = this.zoomLevel;
    this.updateExportMenuItems();
  }

  updateExportMenuItems(): void {
    const flightdisabled = this.initialZoomLevel * 100 + 1 <= 100 || this.flightsChartInputData$.value.labels?.length == 0;
    const grounddisabled = this.initialZoomLevel * 100 + 1 <= 100 || this.groundStaysChartInputData$.value.labels?.length == 0;
    const flightCommand = this.exportMenuItems[1].command;
    const groundCommand = this.exportMenuItems[2].command;
    this.exportMenuItems = [
      { label: 'Export to Excel', command: () => this.exportExcel() },
      {
        label: 'Download Flights Chart',
        disabled: flightdisabled,
        title: this.flightchartTooltip,
        command: flightCommand
      },
      {
        label: 'Download Ground Stays Chart',
        disabled: grounddisabled,
        title: this.groundchartTooltip,
        command: groundCommand
      }
    ];
  }

  get isAtLeastOneAircraftWatchlistStepperSelected(): boolean {
    const { minNoOfFlights, minTotalGroundStay, minIndividualGroundStay, minCurrentGroundStay, maxIndividualGroundStay, maxCurrentGroundStay } =
      this.aircraftWatchlistFilterForm.controls;
    return (
      (minNoOfFlights?.value ?? 0) > 0 ||
      (minTotalGroundStay?.value ?? 0) > 0 ||
      (minIndividualGroundStay?.value ?? 0) > 0 ||
      (minCurrentGroundStay?.value ?? 0) > 0 ||
      (maxIndividualGroundStay?.value ?? 0) > 0 ||
      (maxCurrentGroundStay?.value ?? 0) > 0
    );
  }

  constructor(
    private readonly assetWatchSummaryService: AssetWatchSummaryService,
    private readonly assetWatchExportExcelService: AssetWatchExportExcelService,
    public readonly appStore: AppStore,
    public readonly dialogService: DialogService,
    private readonly savedSearchesService: SavedSearchesService,
    public readonly assetWatchStore: AssetWatchStore,
    private readonly noticeService: NoticeService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.canDeactivate = this.canDeactivate.bind(this);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  canDeactivate(portfolioId?: number): Observable<boolean> {
    return this.assetWatchStore.searchIsDirty$.pipe(
      takeUntil(this.destroy$),
      take(1),
      switchMap((isDirty) => {
        if (!isDirty || !this.isAtLeastOneAircraftWatchlistStepperSelected) {
          return of(true);
        }

        return this.getUnsavedChangesPopupResult$().pipe(
          switchMap(async (closeResult) => {
            if (closeResult) {
              await this.save(false, portfolioId);
            }
            return true;
          })
        );
      })
    );
  }

  async openSaveSearchManagement(): Promise<void> {
    await firstValueFrom(this.canDeactivate());

    this.saveSearchManagementIsActive = true;
  }

  closeSaveSearchManagementAfterBackClicked(): void {
    this.saveSearchManagementIsActive = false;
    this.triggerOpenSavedSearch$.next();
  }

  closeSaveSearchManagementAfterOpenSavedSearchClicked(savedSearchId: number): void {
    const routeSavedSearchId = this.activatedRoute.snapshot.paramMap.get('savedSearchId');
    const routeSavedSearchIdNumber = routeSavedSearchId ? Number(routeSavedSearchId) : null;

    if (routeSavedSearchIdNumber === savedSearchId) {
      this.triggerOpenSavedSearch$.next();
    }
    this.saveSearchManagementIsActive = false;
  }
  ngOnInit(): void {
    this.assetWatchStore.savedSearchIsNull$.subscribe((savedSearchIsNull) => {
      this.saveSearchMenuItems[2].disabled = savedSearchIsNull;
    });

    merge(
      this.filterPanelForm.valueChanges.pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        skip(1)
      ),
      this.aircraftWatchlistFilterForm.valueChanges
    )
      .pipe(
        takeUntil(this.destroy$),
        tap(() => this.assetWatchStore.setSearchIsDirty(true))
      )
      .subscribe();

    const summaryRequestChanges = combineLatest([
      this.filterPanelForm.valueChanges,
      this.selectedGroupingControl.valueChanges.pipe(startWith(this.selectedGroupingControl.value))
    ]).pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.appStore.selectedPortfolioId$),
      map(([, selectedPortfolioId]) => {
        const request = new AssetWatchSummaryRequest(
          this.filterPanelForm,
          this.selectedTimePeriodControl,
          selectedPortfolioId,
          this.selectedGroupingControl
        );
        return request;
      }),
      tap((request) => {
        this.currentSummaryRequest = request;
      })
    );

    summaryRequestChanges
      .pipe(
        tap(() => {
          this.groundStaysChartLoading = true;
        }),
        switchMap((request: AssetWatchSummaryRequest) =>
          this.assetWatchSummaryService.getSummaryGroundEvents(request).pipe(
            tapResponse(
              (summaryGroundEvents) => {
                this.updateSummaryGroundEventsChart(summaryGroundEvents);
              },
              () => {
                this.updateSummaryGroundEventsChart([]);
                console.log('error loading ground events summary');
              }
            )
          )
        )
      )
      .subscribe();

    summaryRequestChanges
      .pipe(
        tap(() => (this.flightsChartLoading = true)),
        switchMap((request: AssetWatchSummaryRequest) =>
          this.assetWatchSummaryService.getSummaryFlights(request).pipe(
            tapResponse(
              (summaryFlights) => {
                this.updateSummaryFlightsChart(summaryFlights);
              },
              () => {
                this.updateSummaryFlightsChart([]);
                console.log('error loading flights summary');
              }
            )
          )
        )
      )
      .subscribe();

    if (this.router.url.endsWith(assetWatchSavedSearchesRoute)) {
      this.openSaveSearchManagement();
    }
  }

  ngAfterViewInit(): void {
    this.decorateGroupOptionsTreeSelectOnClick();
  }

  // There is a bug in PrimeNG where unchecking a checkbox on p-treeSelect causes the overlay to hide.
  // This workaround fixes it (RA-580).
  decorateGroupOptionsTreeSelectOnClick(): void {
    const onClick = this.filterByAOGTreeSelect.onClick.bind(this.filterByAOGTreeSelect);

    this.filterByAOGTreeSelect.onClick = (event: Event) => {
      if (DomHandler.hasClass(event.target, 'p-checkbox-icon')) {
        return;
      }
      onClick(event);
    };
  }

  increaseGroundStay(eventValue: number): void {
    // Increase the ground stay duration, with a minimum of 12
    this.watchlistFilterValues.currentGroundStayAOG = Math.max(12, eventValue);
  }

  decreaseGroundStay(eventValue: number): void {
    if (eventValue < 12) {
      this.watchlistFilterValues.currentGroundStayAOG = Math.min(0, eventValue);
    } else {
      this.watchlistFilterValues.currentGroundStayAOG = eventValue;
    }
  }

  increaseMaxGroundStay(eventValue: number): void {
    const minimumMaxCurrentGroundStayValue = 12;
    this.watchlistFilterValues.currentMaxGroundStayAOG = Math.max(minimumMaxCurrentGroundStayValue, eventValue);
  }

  decreaseMaxGroundStay(eventValue: number): void {
    if (eventValue < 12) {
      this.watchlistFilterValues.currentMaxGroundStayAOG = 0;
    } else {
      this.watchlistFilterValues.currentMaxGroundStayAOG = eventValue;
    }
  }

  inputMinCurrentGroundStay(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      const eventValue = Number(target.value.replace(/,/g, ''));
      if (eventValue > 11) {
        this.watchlistFilterValues.currentGroundStayAOG = eventValue;
      } else {
        this.watchlistFilterValues.currentGroundStayAOG = 0;
      }
      if (this.watchlistFilterValues.currentGroundStayAOG === this.aircraftWatchlistFilterForm.controls.minCurrentGroundStay.value) {
        return;
      }
      this.setMinCurrentGroundStay();
    }
  }

  incrementDecrementMinCurrentGroundStay(event: InputNumberInputEvent): void {
    const formattedValue = Number(event.formattedValue);
    const eventValue = Number(event.value);
    switch (event.originalEvent.type) {
      case 'keypress':
        return;
      case 'mousedown':
        if (eventValue < formattedValue) {
          this.decreaseGroundStay(eventValue);
        } else {
          this.increaseGroundStay(eventValue);
        }
        break;
    }
    this.setMinCurrentGroundStay();
  }

  setMinCurrentGroundStay(): void {
    this.aircraftWatchlistFilterForm.controls.minCurrentGroundStay.patchValue(this.watchlistFilterValues.currentGroundStayAOG, {
      emitEvent: true
    });
  }

  inputMaxCurrentGroundStay(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      const eventValue = Number(target.value.replace(/,/g, ''));
      if (eventValue > 11) {
        this.watchlistFilterValues.currentMaxGroundStayAOG = eventValue;
      } else {
        this.watchlistFilterValues.currentMaxGroundStayAOG = 0;
      }
      if (this.watchlistFilterValues.currentMaxGroundStayAOG === this.aircraftWatchlistFilterForm.controls.maxCurrentGroundStay.value) {
        return;
      }
      this.setMaxCurrentGroundStay();
    }
  }

  incrementDecrementMaxCurrentGroundStay(event: InputNumberInputEvent): void {
    const formattedValue = Number(event.formattedValue);
    const eventValue = Number(event.value);
    switch (event.originalEvent.type) {
      case 'keypress':
        return;
      case 'mousedown':
        if (eventValue < formattedValue) {
          this.decreaseMaxGroundStay(eventValue);
        } else {
          this.increaseMaxGroundStay(eventValue);
        }
        break;
    }
    this.setMaxCurrentGroundStay();
  }

  setMaxCurrentGroundStay(): void {
    this.aircraftWatchlistFilterForm.controls.maxCurrentGroundStay.patchValue(this.watchlistFilterValues.currentMaxGroundStayAOG, {
      emitEvent: true
    });
  }

  onFilterByOptionSelect(selectedFilterByOptions: TreeNode): void {
    if (selectedFilterByOptions.key === FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround]) {
      this.aircraftWatchlistFilterForm.controls.filterByOptions.setValue([selectedFilterByOptions]);
      this.aircraftOnGroundSelected();
      return;
    }

    const aircraftOnGroundIndex = this.getIndexOfKey(FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround]);
    if (aircraftOnGroundIndex > -1) {
      const tempArray = [...(this.aircraftWatchlistFilterForm.controls.filterByOptions.value || [])];
      tempArray.splice(aircraftOnGroundIndex, 1);
      this.aircraftWatchlistFilterForm.controls.filterByOptions.setValue(tempArray, { emitEvent: false });
      this.aircraftOnGroundDeSelected();
    }

    const maintenanceActivityIndex = this.getIndexOfKey(FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity]);
    if (maintenanceActivityIndex > -1) {
      const tempArray = [...(this.aircraftWatchlistFilterForm.controls.filterByOptions.value || [])];
      if (tempArray.length < 2) {
        this.aircraftWatchlistFilterForm.controls.filterByOptions.setValue(null, { emitEvent: false });
        return;
      }
      const maintenanceElement = tempArray[maintenanceActivityIndex];
      tempArray.splice(maintenanceActivityIndex, 1);
      tempArray.push(maintenanceElement);
      this.aircraftWatchlistFilterForm.controls.filterByOptions.setValue(tempArray, { emitEvent: false });
    }
  }

  onFilterByOptionDeSelect(deSelectedFilterByOptions: TreeNode): void {
    if (deSelectedFilterByOptions?.key === FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround]) {
      this.aircraftOnGroundDeSelected();
      return;
    }
  }

  getIndexOfKey(key: string): number {
    return (this.aircraftWatchlistFilterForm?.controls?.filterByOptions?.value || []).findIndex((x) => x.key === key);
  }

  aircraftOnGroundDeSelected(): void {
    this.aircraftWatchlistFilterForm.patchValue(
      { minNoOfFlights: 0, minTotalGroundStay: 0, minIndividualGroundStay: 0, minCurrentGroundStay: null, maxIndividualGroundStay: 0, maxCurrentGroundStay: 0  },
      { emitEvent: true }
    );
    this.watchlistFilterValues.currentGroundStayAOG = null;
    this.watchlistFilterValues.currentMaxGroundStayAOG = null;
  }

  aircraftOnGroundSelected(): void {
    this.aircraftWatchlistFilterForm.patchValue(
      {
        minNoOfFlights: null,
        minTotalGroundStay: null,
        minIndividualGroundStay: null,
        minCurrentGroundStay: 0,
        maxIndividualGroundStay: null,
        maxCurrentGroundStay: 0
      },
      { emitEvent: true }
    );
    this.watchlistFilterValues.currentGroundStayAOG = 0;
    this.watchlistFilterValues.currentMaxGroundStayAOG = 0;
  }

  expandCollapseFilterPanel(): void {
    this.filterExpanded = !this.filterExpanded;
    if (this.filterExpanded) {
      this.expandCollapseButtonHoverText = 'Collapse';
      this.filterPanelExpandedCollapsedClass = 'asset-watch-filter-panel__expanded';
      this.filterExpandedCollapsedClass = 'asset-watch-filter__expanded';
    } else {
      this.expandCollapseButtonHoverText = 'Expand';
      this.filterPanelExpandedCollapsedClass = 'asset-watch-filter-panel__collapsed';
      this.filterExpandedCollapsedClass = 'asset-watch-filter__collapsed';
    }
  }

  public updateSummaryFlightsChart(summaryFlights: SummaryFlightsModel[]): void {
    this.flightsChartLoading = false;
    this.flightsChartInputData$.next(this.getFlightsChartInputData(summaryFlights));
    this.exportMenuItems[1].disabled = this.flightsChartInputData$.value.labels?.length === 0 ? true : false;

    const summaryGroundEventsLength = this.groundStaysChartInputData$.value.labels?.length ?? 0;
    const chartGroupCount = Math.max(summaryFlights.length, summaryGroundEventsLength);
    this.chartGroupCount$.next(chartGroupCount);
    this.initialZoomLevel = 100;
    this.onResize();
    this.updateExportMenuItems();
  }

  public updateSummaryGroundEventsChart(summaryGroundEvents: SummaryGroundEventsModel[]): void {
    this.groundStaysChartLoading = false;
    this.groundStaysChartInputData$.next(this.getGroundStaysChartInputData(summaryGroundEvents));

    const summaryFlightsLength = this.flightsChartInputData$.value.labels?.length ?? 0;
    const chartGroupCount = Math.max(summaryGroundEvents.length, summaryFlightsLength);
    this.exportMenuItems[2].disabled = this.groundStaysChartInputData$.value.labels?.length === 0 ? true : false;
    this.chartGroupCount$.next(chartGroupCount);
    this.initialZoomLevel = 100;
    this.onResize();
  }

  public getGroundStaysChartInputData(summaryGroundEvents: SummaryGroundEventsModel[]): ChartInputData {
    const result: ChartInputData = {
      labels: [],
      chartCounts: [[], [], [], []],
      legendItemLabels: ['Very Short Stay (6-12hrs)', 'Short Stay (12-48 hrs)', 'Medium Stay (48 hrs - 7 Days)', 'Long Stay (>7 Days)']
    };

    summaryGroundEvents.forEach((summaryGroundEvent) => {
      result.labels.push(this.capitalizeWords(summaryGroundEvent.name as string));
      result.chartCounts[0].push(summaryGroundEvent.veryShortStayCount);
      result.chartCounts[1].push(summaryGroundEvent.shortStayCount);
      result.chartCounts[2].push(summaryGroundEvent.mediumStayCount);
      result.chartCounts[3].push(summaryGroundEvent.longStayCount);
    });

    return result;
  }

  public getFlightsChartInputData(summaryFlights: SummaryFlightsModel[]): ChartInputData {
    const result: ChartInputData = {
      labels: [],
      chartCounts: [[]],
      legendItemLabels: ['Flights']
    };

    summaryFlights.forEach((summaryFlight) => {
      result.labels.push(this.capitalizeWords(summaryFlight.name as string));
      result.chartCounts[0].push(summaryFlight.count);
    });
    return result;
  }

  public exportExcel(): void {
    if (!this.currentSummaryRequest) {
      return;
    }
    this.assetWatchExportExcelService
      .exportSummaryExcel(this.flightsChartInputData$.value, this.groundStaysChartInputData$.value, this.currentSummaryRequest)
      .subscribe();
  }

  private capitalizeWords(str: string): string {
    if (str === null || str === undefined) {
      return str;
    }

    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async save(navigateToCreatedSavedSearch = true, portfolioId?: number): Promise<void> {
    const selectedPortfolioId = portfolioId || (await firstValueFrom(this.appStore.selectedPortfolioId$));

    if (!selectedPortfolioId) {
      return;
    }

    const savedSearch = await firstValueFrom(this.assetWatchStore.savedSearch$);

    if (savedSearch) {
      const savedSearchRequest = new SavedSearchRequest(
        this.filterPanelForm,
        this.selectedTimePeriodControl,
        selectedPortfolioId,
        this.aircraftWatchlistFilterForm,
        savedSearch.name,
        savedSearch.description,
        savedSearch.isActive
      );

      await firstValueFrom(
        this.savedSearchesService.updateSavedSearch(savedSearch.id, savedSearchRequest).pipe(
          takeUntil(this.destroy$),
          tapResponse(
            () => {
              this.assetWatchStore.setSearchIsDirty(false);
              this.noticeService.success(`Your changes to '${savedSearchRequest.name}' have been saved.`);
            },
            () => {
              this.noticeService.error(`Search '${savedSearchRequest.name}' could not be updated.`);
            }
          )
        )
      );

      return;
    }

    await this.createSavedSearch(selectedPortfolioId, navigateToCreatedSavedSearch);
  }

  private async saveAs(): Promise<void> {
    const selectedPortfolioId = await firstValueFrom(this.appStore.selectedPortfolioId$);
    if (!selectedPortfolioId) {
      return;
    }

    await this.createSavedSearch(selectedPortfolioId);
  }

  private async createSavedSearch(selectedPortfolioId: number, navigateToCreatedSavedSearch = true): Promise<void> {
    const onSaveClick = new EventEmitter<SavedSearchRequest>();
    this.dialogService.open(AssetWatchSavedSearchDetailsComponent, {
      header: 'Saved Search Details',
      width: '740px',
      data: {
        onSaveClick
      }
    });

    await firstValueFrom(
      onSaveClick.pipe(
        takeUntil(this.destroy$),
        take(1),
        switchMap((savedSearch) => {
          if (savedSearch === null) {
            return of(null);
          }

          const savedSearchRequest = new SavedSearchRequest(
            this.filterPanelForm,
            this.selectedTimePeriodControl,
            selectedPortfolioId,
            this.aircraftWatchlistFilterForm,
            savedSearch.name,
            savedSearch.description,
            savedSearch.isActive
          );

          return this.savedSearchesService.createSavedSearch(savedSearchRequest).pipe(
            tapResponse(
              (savedSearchId) => {
                this.assetWatchStore.setSavedSearch({
                  id: savedSearchId,
                  name: savedSearchRequest.name,
                  description: savedSearchRequest.description,
                  isActive: savedSearchRequest.isActive
                });
                this.assetWatchStore.setSearchIsDirty(false);
                this.noticeService.success(
                  `'${savedSearchRequest.name}' has been added to My Saved Searches. You can edit your saved search and alert settings from My Saved Searches.`
                );

                if (navigateToCreatedSavedSearch) {
                  this.router.navigate([`/${assetWatchSavedSearchesRoute}`, savedSearchId]);
                }
              },
              () => {
                this.noticeService.error(`Search '${savedSearchRequest.name}' could not be added.`);
              }
            )
          );
        })
      )
    );
  }

  private getUnsavedChangesPopupResult$(): Observable<boolean> {
    const onClose = new EventEmitter<boolean>();

    const confirmOptions: ConfirmationDialogOptions = {
      body: `<p>You are about to exit this page. The changes to this page will be lost if they are not saved.</p>
      <p>Do you want to save this search?</p>`,
      cancelButtonText: 'DON’T SAVE',
      okButtonText: 'SAVE',
      header: `Do you want to save changes?`,
      width: '770px',
      okButtonCssModifier: 'airframe__button--primary'
    };

    this.dialogService.open(ConfirmationDialogComponent, {
      header: confirmOptions.header,
      width: confirmOptions.width,
      styleClass: confirmOptions.styleClass,
      data: {
        body: confirmOptions.body,
        cancelButtonText: confirmOptions.cancelButtonText,
        okButtonText: confirmOptions.okButtonText,
        okButtonCssModifier: confirmOptions.okButtonCssModifier,
        onClose
      }
    });

    return onClose;
  }
}
