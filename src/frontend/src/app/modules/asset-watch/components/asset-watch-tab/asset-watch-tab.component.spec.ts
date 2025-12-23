import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { AssetWatchTabComponent } from './asset-watch-tab.component';
import { TreeSelectModule } from 'primeng/treeselect';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GroupingOption } from '../../models/grouping-option';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MultiSelectModule } from 'primeng/multiselect';
import { FilterPanelForm } from '../../models/filter-panel-form';
import { AircraftWatchlistFilterForm } from '../../models/aircraft-watchlist-filter-form';
import { Portfolio } from '../../../shared/models/portfolio';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ChartInputData } from '../../models/chart-input-data';
import { SummaryFlightsModel } from '../../models/summary-flights-model';
import { SummaryGroundEventsModel } from '../../models/summary-ground-events-model';
import { TimePeriodOption } from '../../models/time-period-option';
import { AssetWatchService } from '../../services/asset-watch.service';
import { IdNamePairModel } from '../../../shared/models/id-name-pair-model';
import { CalendarModule } from 'primeng/calendar';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { AssetWatchExportExcelService } from '../../services/asset-watch-export-excel.service';
import { AssetWatchStore } from '../../services/asset-watch-store';
import { MenuItemCommandEvent, MessageService, TreeNode } from 'primeng/api';
import { AppStore } from '../../../../../app/app-store';
import { FilterByWatchlistOption } from '../../models/filter-by-watchlist-option';
import { AppUserService } from '../../../../app-user.service';
import { MenuModule } from 'primeng/menu';
import { By } from '@angular/platform-browser';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { SavedSearchModel } from '../../models/saved-search-model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
    selector: 'ra-asset-watch-filter',
    template: '',
    standalone: false
})
class MockAssetWatchFilterComponent {
  @Input() filterExpandedCollapsedClass = '';
  @Input() selectedTimePeriodControl: FormControl<TimePeriodOption> = new FormControl<TimePeriodOption>(TimePeriodOption.Last7Days, {
    nonNullable: true
  });

  @Input()
  filterPanelForm: FormGroup<FilterPanelForm> = new FormGroup<FilterPanelForm>(new FilterPanelForm());
  @Input() aircraftWatchlistFilterForm: FormGroup<AircraftWatchlistFilterForm> = new FormGroup<AircraftWatchlistFilterForm>(
    new AircraftWatchlistFilterForm()
  );
}

@Component({
    selector: 'ra-asset-watch-details-table',
    template: '',
    standalone: false
})
class MockAssetWatchDetailsTableComponent {
  @Input() isModal = false;
  @Input() filterPanelForm: FormGroup<FilterPanelForm> = new FormGroup<FilterPanelForm>(new FilterPanelForm());
  @Input() aircraftWatchlistFilterForm: FormGroup<AircraftWatchlistFilterForm> = new FormGroup<AircraftWatchlistFilterForm>(
    new AircraftWatchlistFilterForm()
  );
  @Input() selectedPortfolioControl: FormControl<Portfolio | null> = new FormControl<Portfolio | null>(null);
  @Input() selectedTimePeriodControl: FormControl<TimePeriodOption | null> = new FormControl<TimePeriodOption | null>(null);
}

@Component({
    selector: 'ra-asset-watch-stacked-bar-chart',
    template: '',
    standalone: false
})
class MockAssetWatchStackedBarChartComponent {
  @Input() isModal = false;
  @Input() loading = false;
  @Input() chartname!: string;
  @Input() portfolioName!: string | null;
  @Input() inputData$: BehaviorSubject<ChartInputData> = new BehaviorSubject<ChartInputData>({} as ChartInputData);
  @Input() aircraftWatchlistFilterForm: FormGroup<AircraftWatchlistFilterForm> = new FormGroup<AircraftWatchlistFilterForm>(
    new AircraftWatchlistFilterForm()
  );
  @Input() selectedPortfolioControl: FormControl<Portfolio | null> = new FormControl<Portfolio | null>(null);
}

@Component({
    selector: 'ra-asset-watch-accordion[accordionContentId][defaultHeight]',
    template: '',
    standalone: false
})
class MockAssetWatchAccordionComponent {
  @Input() accordionContentId!: string;
  @Input() defaultHeight!: string;
  @Input() groupCount$!: BehaviorSubject<number>;
}

describe('AssetWatchTabComponent', () => {
  let component: AssetWatchTabComponent;
  let fixture: ComponentFixture<AssetWatchTabComponent>;
  let assetWatchServiceSpy: jasmine.SpyObj<AssetWatchService>;
  let exportExcelServiceSpy: jasmine.SpyObj<ExportExcelService>;
  let assetWatchExportExcelServiceSpy: jasmine.SpyObj<AssetWatchExportExcelService>;
  let savedSearchesServiceSpy: jasmine.SpyObj<SavedSearchesService>;
  beforeEach(async () => {
    assetWatchServiceSpy = jasmine.createSpyObj('AssetWatchService', ['getMaintenanceActivityData', 'getAssetWatchFilterData']);
    exportExcelServiceSpy = jasmine.createSpyObj('ExportExcelService', ['buildFileName', 'exportExcelSheetData']);
    assetWatchExportExcelServiceSpy = jasmine.createSpyObj('AssetWatchExportExcelService', ['exportSummaryExcel']);
    savedSearchesServiceSpy = jasmine.createSpyObj('SavedSearchesService', ['getSavedSearch']);

    TestBed.configureTestingModule({
    declarations: [
        AssetWatchTabComponent,
        MockAssetWatchDetailsTableComponent,
        MockAssetWatchStackedBarChartComponent,
        MockAssetWatchAccordionComponent,
        MockAssetWatchFilterComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TreeSelectModule,
        DropdownModule,
        InputNumberModule,
        TableModule,
        FormsModule,
        ReactiveFormsModule,
        MultiSelectModule,
        TooltipModule,
        CalendarModule,
        MenuModule],
    providers: [
        { provide: AssetWatchService, useValue: assetWatchServiceSpy },
        { provide: ExportExcelService, useValue: exportExcelServiceSpy },
        { provide: AssetWatchExportExcelService, useValue: assetWatchExportExcelServiceSpy },
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: { params: { id: '99' } }
            }
        },
        AssetWatchStore,
        AppStore,
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } },
        { provide: SavedSearchesService, useValue: savedSearchesServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetWatchTabComponent);
    component = fixture.componentInstance;
    component.exportMenuItems = [
      { label: 'Export to Excel', command: () => component.exportExcel() },
      {
        label: 'Download Flights Chart',
        disabled: true,
        command: () => {
          component.downloadFlightChart$.next(new Event('Download'));
        }
      },
      {
        label: 'Download Ground Stays Chart',
        disabled: true,
        command: () => {
          component.downloadGroundChart$.next(new Event('Download'));
        }
      }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display ev-badge when searchIsDirty$ is true and isAtLeastOneAircraftWatchlistStepperSelected() is true', () => {
    component.assetWatchStore.setSearchIsDirty(true);
    component.aircraftWatchlistFilterForm.controls.minCurrentGroundStay.setValue(1);

    fixture.detectChanges();

    const badgeElement = fixture.debugElement.query(By.css('ev-badge'));
    expect(badgeElement).toBeTruthy();
  });

  it('should not display ev-badge when searchIsDirty$ is false', () => {
    component.assetWatchStore.setSearchIsDirty(false);
    fixture.detectChanges();

    const badgeElement = fixture.debugElement.query(By.css('ev-badge'));
    expect(badgeElement).toBeFalsy();
  });

  it('should have Country as default value for selectedGroupingControl', () => {
    expect(component.selectedGroupingControl.value).toEqual(GroupingOption.Country);
  });

  it('should update summary flights chart', () => {
    const summaryFlights = [{}, {}, {}] as SummaryFlightsModel[];
    const getFlightsChartInputDataSpy = spyOn(component, 'getFlightsChartInputData').and.returnValue({} as ChartInputData);
    const chartGroupCountSpy = spyOn(component.chartGroupCount$, 'next');

    component.updateSummaryFlightsChart(summaryFlights);

    expect(summaryFlights.length).toBe(3);
    expect(getFlightsChartInputDataSpy).toHaveBeenCalled();
    expect(component.flightsChartLoading).toBe(false);
    expect(chartGroupCountSpy).toHaveBeenCalledWith(3);
  });

  it('should update summary ground events chart', () => {
    const summaryGroundEvents = [{}, {}, {}] as SummaryGroundEventsModel[];
    const getGroundStaysChartInputDataSpy = spyOn(component, 'getGroundStaysChartInputData').and.returnValue({} as ChartInputData);
    const chartGroupCountSpy = spyOn(component.chartGroupCount$, 'next');

    component.updateSummaryGroundEventsChart(summaryGroundEvents);

    expect(getGroundStaysChartInputDataSpy).toHaveBeenCalled();
    expect(component.groundStaysChartLoading).toBe(false);
    expect(chartGroupCountSpy).toHaveBeenCalledWith(3);
  });

  it('should get ground stays chart input data', () => {
    const summaryGroundEvents = [
      { veryShortStayCount: 0, shortStayCount: 1, mediumStayCount: 2, longStayCount: 3, name: 'name1' },
      { veryShortStayCount: 7, shortStayCount: 4, mediumStayCount: 5, longStayCount: 6, name: 'name2' }
    ] as SummaryGroundEventsModel[];

    const result = component.getGroundStaysChartInputData(summaryGroundEvents);

    expect(result.labels).toEqual(['Name1', 'Name2']);
    expect(result.chartCounts).toEqual([
      [0, 7],
      [1, 4],
      [2, 5],
      [3, 6]
    ]);
    expect(result.legendItemLabels).toEqual([
      'Very Short Stay (6-12hrs)',
      'Short Stay (12-48 hrs)',
      'Medium Stay (48 hrs - 7 Days)',
      'Long Stay (>7 Days)'
    ]);
  });

  describe('minNoOfFlights tooltip tests', () => {
    it('a tooltip for minNoOfFlights should exist', () => {
      const emElement = document.querySelector('.fa-circle-question.minflights') as HTMLElement;
      expect(emElement).toBeTruthy();
    });
    it('tooltip for minNoOfFlights should have required text', () => {
      const emElement = document.querySelector('.fa-circle-question.minflights') as HTMLElement;
      expect(emElement.getAttribute('pTooltip')).toBe('Use to set a minimum number of flights in the selected time period.');
    });

    it('tooltip for minNoOfFlights should be positioned right', () => {
      const emElement = document.querySelector('.fa-circle-question.minflights') as HTMLElement;
      expect(emElement.getAttribute('tooltipPosition')).toBe('right');
    });

    it('tooltip for minNoOfFlights should have the required style class helptip', () => {
      const emElement = document.querySelector('.fa-circle-question.minflights') as HTMLElement;
      expect(emElement.getAttribute('tooltipStyleClass')).toBe('helptip');
    });
  });

  describe('minTotalGroundStay tooltip tests', () => {
    it('a tooltip for minTotalGroundStay should exist', () => {
      const emElement = document.querySelector('.fa-circle-question.groundStay') as HTMLElement;
      expect(emElement).toBeTruthy();
    });
    it('tooltip for minTotalGroundStay should have required text', () => {
      const emElement = document.querySelector('.fa-circle-question.groundStay') as HTMLElement;
      expect(emElement.getAttribute('pTooltip')).toBe(
        'Use to set a minimum sum of all hours that an aircraft has spent on the ground in the selected time period.'
      );
    });

    it('tooltip for minTotalGroundStay should be positioned right', () => {
      const emElement = document.querySelector('.fa-circle-question.groundStay') as HTMLElement;
      expect(emElement.getAttribute('tooltipPosition')).toBe('right');
    });

    it('tooltip for minTotalGroundStay should have the required style class helptip', () => {
      const emElement = document.querySelector('.fa-circle-question.groundStay') as HTMLElement;
      expect(emElement.getAttribute('tooltipStyleClass')).toBe('helptip');
    });
  });

  describe('minIndividualGroundStay tooltip tests', () => {
    it('a tooltip for minIndividualGroundStay should exist', () => {
      const emElement = document.querySelector('.fa-circle-question.minIndGroundStay') as HTMLElement;
      expect(emElement).toBeTruthy();
    });
    it('tooltip for minIndividualGroundStay should have required text', () => {
      const emElement = document.querySelector('.fa-circle-question.minIndGroundStay') as HTMLElement;
      expect(emElement.getAttribute('pTooltip')).toBe(
        'Use to set a minimum duration for each individual ground stay in the selected time period.'
      );
    });

    it('tooltip for minIndividualGroundStay should be positioned right', () => {
      const emElement = document.querySelector('.fa-circle-question.minIndGroundStay') as HTMLElement;
      expect(emElement.getAttribute('tooltipPosition')).toBe('right');
    });

    it('tooltip for minIndividualGroundStay should have the required style class helptip', () => {
      const emElement = document.querySelector('.fa-circle-question.minIndGroundStay') as HTMLElement;
      expect(emElement.getAttribute('tooltipStyleClass')).toBe('helptip');
    });
  });

  describe('maxIndividualGroundStay tooltip tests', () => {
    it('a tooltip for maxIndividualGroundStay should exist', () => {
      const emElement = document.querySelector('.fa-circle-question.maxIndGroundStay') as HTMLElement;
      expect(emElement).toBeTruthy();
    });
    it('tooltip for maxIndividualGroundStay should have required text', () => {
      const emElement = document.querySelector('.fa-circle-question.maxIndGroundStay') as HTMLElement;
      expect(emElement.getAttribute('pTooltip')).toBe(
        'Use to set a maximum duration for each individual ground stay in the selected time period.'
      );
    });

    it('tooltip for maxIndividualGroundStay should be positioned right', () => {
      const emElement = document.querySelector('.fa-circle-question.maxIndGroundStay') as HTMLElement;
      expect(emElement.getAttribute('tooltipPosition')).toBe('right');
    });

    it('tooltip for maxIndividualGroundStay should have the required style class helptip', () => {
      const emElement = document.querySelector('.fa-circle-question.maxIndGroundStay') as HTMLElement;
      expect(emElement.getAttribute('tooltipStyleClass')).toBe('helptip');
    });
  });

  describe('filter by tree-select tests', () => {
    it('maintenace activity options should have values post that', () => {
      const mockData = [
        { id: 1, name: 'C-Check' },
        { id: 2, name: 'Not Identified' }
      ];
      component.assetWatchStore.setMaintenanceActivitiesFilterOptions(mockData);
      component.ngOnInit();
      component.assetWatchStore.maintenanceActivities$.subscribe((data) => {
        expect(data).toEqual(mockData);
      });
    });
    it('filter by options should have values post that', () => {
      const mockData = [
        { id: 1, name: 'C-Check' },
        { id: 2, name: 'Not Identified' }
      ];
      const maintenanaceActivityChildren: TreeNode[] = mockData.map((element) => ({
        key: element.id.toString(),
        label: element.name
      }));
      const children: TreeNode[] = [
        {
          key: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          label: FilterByWatchlistOption.AircraftsOnGround.toString()
        },
        {
          key: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          label: FilterByWatchlistOption.MaintenanceActivity.toString(),
          children: maintenanaceActivityChildren
        }
      ];
      component.assetWatchStore.setMaintenanceActivitiesFilterOptions(mockData);
      component.ngOnInit();
      component.assetWatchStore.filterByOptions$.subscribe((filterByOptions) => {
        delete filterByOptions[0].partialSelected;
        expect(filterByOptions).toEqual(children);
      });
    });
    it('filter by options should contain Aircraft On Ground option', () => {
      const mockData = [
        { id: 1, name: 'C-Check' },
        { id: 2, name: 'Not Identified' }
      ];
      const mockOptions: Observable<IdNamePairModel[]> = of(mockData);
      assetWatchServiceSpy.getMaintenanceActivityData.and.returnValue(mockOptions);
      component.ngOnInit();
      component.assetWatchStore.filterByOptions$.subscribe((filterByOptions) => {
        expect(filterByOptions.filter((x) => x.key === FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround]).length).toBe(1);
      });
    });
    it('filter by options should contain Maintenance Activity option', () => {
      const mockData = [
        { id: 1, name: 'C-Check' },
        { id: 2, name: 'Not Identified' }
      ];
      const mockOptions: Observable<IdNamePairModel[]> = of(mockData);
      assetWatchServiceSpy.getMaintenanceActivityData.and.returnValue(mockOptions);
      component.ngOnInit();
      component.assetWatchStore.filterByOptions$.subscribe((filterByOptions) => {
        expect(filterByOptions.filter((x) => x.key === FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity]).length).toBe(
          1
        );
      });
    });
    it('On selection of Aircrafts On Ground, Maintenance Activity should get de-selected', () => {
      const mockData = [
        { id: 1, name: 'C-Check' },
        { id: 2, name: 'Not Identified' }
      ];
      const maintenanaceActivityChildren: TreeNode[] = mockData.map((element) => ({
        key: element.id.toString(),
        label: element.name
      }));
      const children: TreeNode[] = [
        {
          data: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          key: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          label: FilterByWatchlistOption.AircraftsOnGround.toString()
        },
        {
          data: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          key: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          label: FilterByWatchlistOption.MaintenanceActivity.toString(),
          children: maintenanaceActivityChildren
        }
      ];
      const mockOptions: Observable<IdNamePairModel[]> = of(mockData);
      assetWatchServiceSpy.getMaintenanceActivityData.and.returnValue(mockOptions);
      component.ngOnInit();
      component.aircraftWatchlistFilterForm.controls.filterByOptions.setValue([children[1]]);
      component.aircraftWatchlistFilterForm.controls.filterByOptions.setValue([children[0]]);
      expect(
        component.aircraftWatchlistFilterForm.controls.filterByOptions.value?.filter(
          (x) => x.key === FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity]
        ).length
      ).toBe(0);
      expect(
        component.aircraftWatchlistFilterForm.controls.filterByOptions.value?.filter(
          (x) => x.key === FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround]
        ).length
      ).toBe(1);
    });
    it('On selection of Maintenance Activity all children should get selected', () => {
      const mockData = [
        { id: 1, name: 'C-Check' },
        { id: 2, name: 'Not Identified' }
      ];
      const maintenanaceActivityChildren: TreeNode[] = mockData.map((element) => ({
        key: element.id.toString(),
        label: element.name
      }));
      const treenode: TreeNode[] = [
        {
          data: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          key: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          label: FilterByWatchlistOption.AircraftsOnGround.toString()
        },
        {
          data: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          key: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          label: FilterByWatchlistOption.MaintenanceActivity.toString(),
          children: maintenanaceActivityChildren
        }
      ];
      const mockOptions: Observable<IdNamePairModel[]> = of(mockData);
      assetWatchServiceSpy.getMaintenanceActivityData.and.returnValue(mockOptions);
      component.ngOnInit();
      component.aircraftWatchlistFilterForm.controls.filterByOptions.setValue([treenode[1]]);
      if (treenode[1].children !== undefined) {
        for (const child of treenode[1].children) {
          expect(component.filterByAOGTreeSelect.value[0].children.filter((x: TreeNode) => x.key === child.key).length).toBe(1);
        }
      }
    });
    it('On selection of Aircrafts On Ground, only minCurrentGroundStay should have value rest other steppers should not', () => {
      const mockData = [
        { id: 1, name: 'C-Check' },
        { id: 2, name: 'Not Identified' }
      ];
      const maintenanaceActivityChildren: TreeNode[] = mockData.map((element) => ({
        key: element.id.toString(),
        label: element.name
      }));
      const children: TreeNode[] = [
        {
          data: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          key: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          label: FilterByWatchlistOption.AircraftsOnGround.toString()
        },
        {
          data: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          key: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          label: FilterByWatchlistOption.MaintenanceActivity.toString(),
          children: maintenanaceActivityChildren
        }
      ];
      const mockOptions: Observable<IdNamePairModel[]> = of(mockData);
      assetWatchServiceSpy.getMaintenanceActivityData.and.returnValue(mockOptions);
      component.ngOnInit();
      component.aircraftWatchlistFilterForm.controls.filterByOptions.setValue(children as TreeNode[]);
      component.onFilterByOptionSelect(children[0]);
      expect(component.aircraftWatchlistFilterForm.controls.minNoOfFlights.value).toBeNull();
      expect(component.aircraftWatchlistFilterForm.controls.minTotalGroundStay.value).toBeNull();
      expect(component.aircraftWatchlistFilterForm.controls.minIndividualGroundStay.value).toBeNull();
      expect(component.aircraftWatchlistFilterForm.controls.minCurrentGroundStay.value).toEqual(0);
    });
    it('On deselection of Aircrafts On Ground, patchValue should have been called with correct parameters', () => {
      spyOn(component.aircraftWatchlistFilterForm, 'patchValue').and.callThrough();
      component.aircraftOnGroundDeSelected();
      fixture.detectChanges();
      expect(component.aircraftWatchlistFilterForm.patchValue).toHaveBeenCalledWith( { minNoOfFlights: 0, minTotalGroundStay: 0, minIndividualGroundStay: 0, minCurrentGroundStay: null, maxIndividualGroundStay: 0, maxCurrentGroundStay: 0 },
        { emitEvent: true });
    });
    it('On selection of Aircrafts On Ground, patchValue should have been called with correct parameters', () => {
      spyOn(component.aircraftWatchlistFilterForm, 'patchValue').and.callThrough();
      component.aircraftOnGroundSelected();
      fixture.detectChanges();
      expect(component.aircraftWatchlistFilterForm.patchValue).toHaveBeenCalledWith( { minNoOfFlights: null, minTotalGroundStay: null, minIndividualGroundStay: null, minCurrentGroundStay: 0, maxIndividualGroundStay: null,
        maxCurrentGroundStay: 0 },
        { emitEvent: true });
    });
    it('should call exportExcel functionon excel option click', () => {
      const nextSpy = spyOn(component, 'exportExcel');
      const event: MenuItemCommandEvent = { originalEvent: new Event('Download'), item: undefined };
      component.ngOnInit();
      if (component.exportMenuItems && component.exportMenuItems.length > 2 && component.exportMenuItems[0].command) {
        component.exportMenuItems[0].command(event);
      }
      expect(nextSpy).toHaveBeenCalled();
    });

    it('should emit event on Download Flights Chart option click', () => {
      const nextSpy = spyOn(component.downloadFlightChart$, 'next');
      const event: MenuItemCommandEvent = { originalEvent: new Event('Download'), item: undefined };
      component.ngOnInit();
      if (component.exportMenuItems && component.exportMenuItems.length > 2 && component.exportMenuItems[1].command) {
        component.exportMenuItems[1].command(event);
      }
      expect(nextSpy).toHaveBeenCalled();
    });

    it('should emit event on Download Ground Stays Chart option click', () => {
      const nextSpy = spyOn(component.downloadGroundChart$, 'next');
      const event: MenuItemCommandEvent = { originalEvent: new Event('Download'), item: undefined };
      component.ngOnInit();
      if (component.exportMenuItems && component.exportMenuItems.length > 2 && component.exportMenuItems[2].command) {
        component.exportMenuItems[2].command(event);
      }
      expect(nextSpy).toHaveBeenCalled();
    });

    it('On de-selection of Aircrafts On Ground, only minCurrentGroundStay should not have value rest other steppers should have', () => {
      const mockData = [
        { id: 1, name: 'C-Check' },
        { id: 2, name: 'Not Identified' }
      ];
      const maintenanaceActivityChildren: TreeNode[] = mockData.map((element) => ({
        key: element.id.toString(),
        label: element.name
      }));
      const children: TreeNode[] = [
        {
          data: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          key: FilterByWatchlistOption[FilterByWatchlistOption.AircraftsOnGround],
          label: FilterByWatchlistOption.AircraftsOnGround.toString()
        },
        {
          data: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          key: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
          label: FilterByWatchlistOption.MaintenanceActivity.toString(),
          children: maintenanaceActivityChildren
        }
      ];
      const mockOptions: Observable<IdNamePairModel[]> = of(mockData);
      assetWatchServiceSpy.getMaintenanceActivityData.and.returnValue(mockOptions);
      component.ngOnInit();
      component.aircraftWatchlistFilterForm.controls.filterByOptions.setValue(children as TreeNode[]);
      component.onFilterByOptionSelect(children[1]);
      expect(component.aircraftWatchlistFilterForm.controls.minNoOfFlights.value).toEqual(0);
      expect(component.aircraftWatchlistFilterForm.controls.minTotalGroundStay.value).toEqual(0);
      expect(component.aircraftWatchlistFilterForm.controls.minIndividualGroundStay.value).toEqual(0);
      expect(component.aircraftWatchlistFilterForm.controls.minCurrentGroundStay.value).toBeNull();
    });

    it('should increaseGroundStay watchlistFilterValues.currentMaxGroundStayAOG by 1 when watchlistFilterValues.currentMaxGroundStayAOG >= 13', () => {
      component.maxCurrentGroundStay = 16;
      component.watchlistFilterValues.currentMaxGroundStayAOG = 16;
      const event: Event = new Event('mousedown');
      const formattedValue = Number('16');
      const eventValue = Number('17');
      component.incrementDecrementMaxCurrentGroundStay({
        formattedValue: formattedValue.toString(),
        value: eventValue,
        originalEvent: event as MouseEvent
      });
      expect(component.watchlistFilterValues.currentMaxGroundStayAOG).toEqual(17);
    });

    it('should set watchlistFilterValues.currentMaxGroundStayAOG to 12 when increaseGroundStaying from default watchlistFilterValues.currentMaxGroundStayAOG 0', () => {
      component.watchlistFilterValues.currentMaxGroundStayAOG = 0;
      component.increaseMaxGroundStay(6);
      expect(component.watchlistFilterValues.currentMaxGroundStayAOG).toEqual(12);
    });

    it('should decreaseMaxGroundStay watchlistFilterValues.currentMaxGroundStayAOG by currentGroundStayStep when formattedValue >= 13', () => {
      component.watchlistFilterValues.currentMaxGroundStayAOG = 16;
      const event: Event = new Event('mousedown');
      const formattedValue = Number('16');
      const eventValue = Number('15');
      component.incrementDecrementMaxCurrentGroundStay({
        formattedValue: formattedValue.toString(),
        value: eventValue,
        originalEvent: event as MouseEvent
      });
      expect(component.watchlistFilterValues.currentMaxGroundStayAOG).toEqual(15);
    });

    it('should set watchlistFilterValues.currentMaxGroundStayAOG to 0 when formattedValue < 12', () => {
      component.maxCurrentGroundStay = 10;
      component.decreaseMaxGroundStay(10);
      expect(component.watchlistFilterValues.currentMaxGroundStayAOG).toEqual(0);
    });

    it('should call increaseMaxGroundStay with eventValue and formattedValue when eventValue >= formattedValue in incrementDecrementMaxCurrentGroundStay', () => {
      spyOn(component, 'increaseMaxGroundStay');
      const event: Event = new Event('mousedown');
      const formattedValue = Number('10');
      const eventValue = Number('15');
      component.incrementDecrementMaxCurrentGroundStay({
        formattedValue: formattedValue.toString(),
        value: eventValue,
        originalEvent: event as MouseEvent
      });
      expect(component.increaseMaxGroundStay).toHaveBeenCalled();
    });

    it('should call decreaseMaxGroundStay with eventValue and formattedValue when eventValue < formattedValue in incrementDecrementMaxCurrentGroundStay', () => {
      spyOn(component, 'decreaseMaxGroundStay');
      const event: Event = new Event('mousedown');
      const formattedValue = Number('15');
      const eventValue = Number('14');
      component.incrementDecrementMaxCurrentGroundStay({
        formattedValue: formattedValue.toString(),
        value: eventValue,
        originalEvent: event
      });
      expect(component.decreaseMaxGroundStay).toHaveBeenCalledWith(eventValue);
    });

    it('should increaseGroundStay watchlistFilterValues.currentGroundStayAOG by 1 when watchlistFilterValues.currentGroundStayAOG >= 13', () => {
      component.minCurrentGroundStay = 16;
      component.watchlistFilterValues.currentGroundStayAOG = 16;
      const event: Event = new Event('mousedown');
      const formattedValue = Number('16');
      const eventValue = Number('17');
      component.incrementDecrementMinCurrentGroundStay({
        formattedValue: formattedValue.toString(),
        value: eventValue,
        originalEvent: event as MouseEvent
      });
      expect(component.watchlistFilterValues.currentGroundStayAOG).toEqual(17);
    });

    it('should set watchlistFilterValues.currentGroundStayAOG to 12 when increaseGroundStaying from default watchlistFilterValues.currentGroundStayAOG 0', () => {
      component.watchlistFilterValues.currentGroundStayAOG = 0;
      component.increaseGroundStay(6);
      expect(component.watchlistFilterValues.currentGroundStayAOG).toEqual(12);
    });

    it('should decreaseGroundStay watchlistFilterValues.currentGroundStayAOG by currentGroundStayStep when formattedValue >= 13', () => {
      component.watchlistFilterValues.currentGroundStayAOG = 16;
      const event: Event = new Event('mousedown');
      const formattedValue = Number('16');
      const eventValue = Number('15');
      component.incrementDecrementMinCurrentGroundStay({
        formattedValue: formattedValue.toString(),
        value: eventValue,
        originalEvent: event as MouseEvent
      });
      expect(component.watchlistFilterValues.currentGroundStayAOG).toEqual(15);
    });

    it('should set watchlistFilterValues.currentGroundStayAOG to 0 when formattedValue < 12', () => {
      component.minCurrentGroundStay = 10;
      component.decreaseGroundStay(10);
      expect(component.watchlistFilterValues.currentGroundStayAOG).toEqual(0);
    });

    it('should call increaseGroundStay with eventValue and formattedValue when eventValue >= formattedValue in incrementDecrementMinCurrentGroundStay', () => {
      spyOn(component, 'increaseGroundStay');
      const event: Event = new Event('mousedown');
      const formattedValue = Number('10');
      const eventValue = Number('15');
      component.incrementDecrementMinCurrentGroundStay({
        formattedValue: formattedValue.toString(),
        value: eventValue,
        originalEvent: event as MouseEvent
      });
      expect(component.increaseGroundStay).toHaveBeenCalled();
    });

    it('should call decreaseGroundStay with eventValue and formattedValue when eventValue < formattedValue in incrementDecrementMinCurrentGroundStay', () => {
      spyOn(component, 'decreaseGroundStay');
      const event: Event = new Event('mousedown');
      const formattedValue = Number('15');
      const eventValue = Number('14');
      component.incrementDecrementMinCurrentGroundStay({
        formattedValue: formattedValue.toString(),
        value: eventValue,
        originalEvent: event
      });
      expect(component.decreaseGroundStay).toHaveBeenCalledWith(eventValue);
    });
  });

  it('should set saveSearchManagementIsActive to true when openSaveSearchManagement is called', async () => {
    spyOn(component, 'canDeactivate').and.returnValue(of(true));
    await component.openSaveSearchManagement();
    expect(component.saveSearchManagementIsActive).toBeTrue();
  });
  it('should call canDeactivate when openSaveSearchManagement is called', async () => {
    const canDeactivateSpy = spyOn(component, 'canDeactivate').and.returnValue(of(true));
    await component.openSaveSearchManagement();
    expect(canDeactivateSpy).toHaveBeenCalled();
  });

  it('should set saveSearchManagementIsActive to false and call next on triggerOpenSavedSearch$ when closeSaveSearchManagementAfterBackClicked is called', () => {
    spyOn(component.triggerOpenSavedSearch$, 'next');

    component.closeSaveSearchManagementAfterBackClicked();

    expect(component.saveSearchManagementIsActive).toBe(false);
    expect(component.triggerOpenSavedSearch$.next).toHaveBeenCalled();
  });
});
