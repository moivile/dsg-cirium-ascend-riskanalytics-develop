import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistributionTabSummaryTableComponent } from './distribution-tab-summary-table.component';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { FleetInsightsService } from '../../services/fleet-insights-service';
import { of } from 'rxjs';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DistributionTabStore } from '../../services/distribution-tab-store';

describe('DistributionTabSummaryTableComponent', () => {
  let component: DistributionTabSummaryTableComponent;
  let fixture: ComponentFixture<DistributionTabSummaryTableComponent>;
  let service: FleetInsightsService;
  let distributionTabStore: DistributionTabStore;
  let fleetInsightsStore: FleetInsightsStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DistributionTabSummaryTableComponent],
      imports: [TableModule, FormsModule],
      providers: [
        DistributionTabStore,
        FleetInsightsStore,
        FleetInsightsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionTabSummaryTableComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FleetInsightsService);
    distributionTabStore = TestBed.inject(DistributionTabStore);
    fleetInsightsStore = TestBed.inject(FleetInsightsStore);

    // Mocking observables and methods

    spyOn(service, 'getAircraftSummaryData').and.returnValue(
      of({
        aircraftSummaryList: [],
        skip: 0,
        take: 0,
        totalCount: 0
      })
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default sort settings', () => {
    expect(component.defaultSortField).toBe('numberOfAircraft');
    expect(component.defaultSortOrder).toBe(-1);
  });
});
