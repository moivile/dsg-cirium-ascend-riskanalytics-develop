import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PortfolioOverviewState, PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { PortfolioOverviewSummaryMetricsService } from './portfolio-overview-summary-metrics.service';
import { PortfolioOverviewSummaryMetricsAgeService } from './portfolio-overview-summary-metrics-age.service';
import { Aircraft } from '../../../shared/models/aircraft';
import { PortoflioOverviewSummaryMetricsComponent } from './portfolio-overview-summary-metrics.component';
import { SummaryMetric } from './summaryMetrics';
import { OperatorToggleValue } from '../../models/operator-toggle-value';

describe('OverviewPortfolioSummaryMetricsComponent', () => {
  let component: PortoflioOverviewSummaryMetricsComponent;
  let fixture: ComponentFixture<PortoflioOverviewSummaryMetricsComponent>;

  let portfolioOverviewSummaryMetricsServiceSpy: jasmine.SpyObj<PortfolioOverviewSummaryMetricsService>;
  let portfolioOverviewSummaryMetricsAgeServiceSpy: jasmine.SpyObj<PortfolioOverviewSummaryMetricsAgeService>;

  let store: PortfolioOverviewStore;
  const mockState: PortfolioOverviewState = {
    filteredPortfolioAircraft: [
      { aircraftFamily: 'Boeing 737', aircraftAgeYears: 11 },
      { aircraftFamily: 'Boeing 747', aircraftAgeYears: 10 }
    ] as Aircraft[],
    portfolio: {
      id: 0,
      name: '',
      dateModified: '',
      dateCreated: '',
      numberOfAircraft: 0
    },
    groupBy: {
      displayName: '',
      groupName: ''
    },
    sortBys: [
      {
        key: 'status',
        name: 'Total',
        sortDescending: true
      },
      {
        key: 'aircraftAgeYears',
        name: 'Mean',
        sortDescending: false
      },
      {
        key: 'operator',
        name: 'Total',
        sortDescending: true
      },
      {
        key: 'details',
        name: 'aircraftSeries',
        sortDescending: false
      }
    ],
    portfolioAircraft: [],
    excelSheetData: new Map(),
    operatorToggleValue: OperatorToggleValue.Name
  };

  beforeEach(async () => {
    portfolioOverviewSummaryMetricsServiceSpy = jasmine.createSpyObj('PortfolioOverviewSummaryMetricsService', [
      'buildSummaryMetrics'
    ]);
    portfolioOverviewSummaryMetricsAgeServiceSpy = jasmine.createSpyObj('PortfolioOverviewSummaryMetricsAgeService', [
      'buildAgeSummaryMetrics'
    ]);

    await TestBed.configureTestingModule({
    declarations: [PortoflioOverviewSummaryMetricsComponent],
    imports: [],
    providers: [
        PortfolioOverviewStore,
        { provide: PortfolioOverviewSummaryMetricsService, useValue: portfolioOverviewSummaryMetricsServiceSpy },
        { provide: PortfolioOverviewSummaryMetricsAgeService, useValue: portfolioOverviewSummaryMetricsAgeServiceSpy },
        provideHttpClient(withInterceptorsFromDi())
    ]
}).compileComponents();

    fixture = TestBed.createComponent(PortoflioOverviewSummaryMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    store = TestBed.inject(PortfolioOverviewStore);
    store.setState(mockState);
  });

  describe('ngOnInit()', () => {
    it('when countBy is aircraftAgeYears, should return age summary metrics', fakeAsync(() => {
      const portfolioAircraft: Aircraft[] = [
        { aircraftFamily: 'Boeing 737', aircraftAgeYears: 11 },
        { aircraftFamily: 'Boeing 747', aircraftAgeYears: 10 }
      ] as Aircraft[];

      component.countBy = 'aircraftAgeYears';
      const portfolioOverviewStore = TestBed.inject(PortfolioOverviewStore);

      portfolioOverviewStore.filteredPortfolioAircraft$.subscribe((value) => {
        expect(value).toEqual(portfolioAircraft);
      });

      component.ngOnInit();

      tick();
      const expectedSummaryMetrics: SummaryMetric[] = [
        { label: '0-6', total: 0, percentage: 0, grouped: false },
        { label: '6-12', total: 2, percentage: 100, grouped: false },
        { label: '12-18', total: 0, percentage: 0, grouped: false },
        { label: '18-24', total: 0, percentage: 0, grouped: false },
        { label: '24-30', total: 0, percentage: 0, grouped: false },
        { label: '30+', total: 0, percentage: 0, grouped: true }
      ];

      expect(component.summaryMetrics).toEqual(expectedSummaryMetrics);
    }));
    it('when countBy is not aircraftAgeYears, should return correct summary metrics', fakeAsync(() => {
      const portfolioAircraft: Aircraft[] = [
        { aircraftFamily: 'Boeing 737', aircraftAgeYears: 11 },
        { aircraftFamily: 'Boeing 747', aircraftAgeYears: 10 }
      ] as Aircraft[];

      component.countBy = 'aircraftFamily';
      const portfolioOverviewStore = TestBed.inject(PortfolioOverviewStore);

      portfolioOverviewStore.filteredPortfolioAircraft$.subscribe((value) => {
        expect(value).toEqual(portfolioAircraft);
      });

      component.ngOnInit();

      tick();
      const expectedSummaryMetrics: SummaryMetric[] = [
        { label: 'Boeing 737', total: 1, percentage: 50, grouped: false },
        { label: 'Boeing 747', total: 1, percentage: 50, grouped: false }
      ];

      expect(component.summaryMetrics).toEqual(expectedSummaryMetrics);
    }));
  });
});
