import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketActivitySummaryTableComponent } from './market-activity-summary-table.component';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { MarketActivityTabStore } from '../../services/market-activity-tab-store';
import { FleetInsightsMarketActivityService } from '../../services/fleet-insights-market-activity-service';
import { of } from 'rxjs';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MarketActivitySummaryTableComponent', () => {
  let component: MarketActivitySummaryTableComponent;
  let fixture: ComponentFixture<MarketActivitySummaryTableComponent>;
  let service: FleetInsightsMarketActivityService;
  let marketActivityTabStore: MarketActivityTabStore;
  let fleetInsightsStore: FleetInsightsStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketActivitySummaryTableComponent],
      imports: [TableModule, FormsModule],
      providers: [
        MarketActivityTabStore,
        FleetInsightsMarketActivityService,
        FleetInsightsStore,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketActivitySummaryTableComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FleetInsightsMarketActivityService);
    marketActivityTabStore = TestBed.inject(MarketActivityTabStore);
    fleetInsightsStore = TestBed.inject(FleetInsightsStore);

    spyOn(service, 'getMarketActivitySummaryData').and.returnValue(
      of({
        summaryList: []
      })
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default sort settings', () => {
    expect(component.defaultSortField).toBe('numberOfEvents');
    expect(component.defaultSortOrder).toBe(-1);
  });
});
