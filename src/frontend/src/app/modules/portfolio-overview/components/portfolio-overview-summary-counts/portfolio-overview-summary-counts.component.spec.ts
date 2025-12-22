import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioOverviewSummaryCountsComponent } from './portfolio-overview-summary-counts.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';
import { PortfolioOverviewState, PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { Aircraft } from '../../../shared/models/aircraft';
import { OperatorToggleValue } from '../../models/operator-toggle-value';

describe('OverviewPortfolioSummaryCountsComponent', () => {
  let component: PortfolioOverviewSummaryCountsComponent;
  let fixture: ComponentFixture<PortfolioOverviewSummaryCountsComponent>;

  let store: PortfolioOverviewStore;
  const mockState: PortfolioOverviewState = {
    filteredPortfolioAircraft: [
      {
        aircraftAgeYears: 33.7
      } as Aircraft,
      {
        aircraftAgeYears: 33.5
      } as Aircraft,
      {
        aircraftAgeYears: 25.7
      } as Aircraft,
      {
        aircraftAgeYears: 13.5
      } as Aircraft,
      {
        aircraftAgeYears: 56.2
      } as Aircraft
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
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);

    await TestBed.configureTestingModule({
    declarations: [PortfolioOverviewSummaryCountsComponent],
    imports: [],
    providers: [PortfolioOverviewStore, { provide: PortfolioAircraftService, useValue: portfoliosServiceSpy }, provideHttpClient(withInterceptorsFromDi())]
}).compileComponents();

    fixture = TestBed.createComponent(PortfolioOverviewSummaryCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    store = TestBed.inject(PortfolioOverviewStore);
    store.setState(mockState);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets aircraft count', () => {
    const portfolioAircraft: Aircraft[] = [
      {
        aircraftAgeYears: 33.7
      } as Aircraft,
      {
        aircraftAgeYears: 33.5
      } as Aircraft,
      {
        aircraftAgeYears: 25.7
      } as Aircraft,
      {
        aircraftAgeYears: 13.5
      } as Aircraft,
      {
        aircraftAgeYears: 56.2
      } as Aircraft
    ] as Aircraft[];

    component.aircraftCount$.subscribe((count) => {
      expect(count).toEqual(portfolioAircraft.length);
    });
  });

  it('sets mean fleet age', () => {
    component.meanFleetAge$.subscribe((age) => {
      expect(age).toEqual(32.5);
    });
  });
});
