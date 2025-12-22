import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { PortfolioOverviewTabComponent } from './portfolio-overview-tab.component';
import { PortfolioOverviewSummaryCountsComponent } from '../portfolio-overview-summary-counts/portfolio-overview-summary-counts.component';
import { PortoflioOverviewSummaryMetricsComponent } from '../portfolio-overview-summary-metrics/portfolio-overview-summary-metrics.component';
import { PortfolioOverviewGroupingComponent } from '../portfolio-overview-grouping/portfolio-overview-grouping.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { PortfolioOverviewStackedBarChartComponent } from '../portfolio-overview-stacked-bar-chart/portfolio-overview-stacked-bar-chart.component';
import { PortfolioOverviewTableComponent } from '../portfolio-overview-table/portfolio-overview-table.component';
import { IsLastColumnPipe } from '../portfolio-overview-table/table-is-last-column.pipe';
import { NgChartsModule } from 'ng2-charts';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';
import { BackLinkComponent } from '../../../shared/components/back-link/back-link.component';
import { TableModule } from 'primeng/table';
import { PortfolioOverviewAccordionComponent } from '../portfolio-overview-accordion/portfolio-overview-accordion.component';
import { PortfolioOverviewJitterChartComponent } from '../portfolio-overview-jitter-chart/portfolio-overview-jitter-chart.component';
import { DialogModule } from 'primeng/dialog';
import { PortfolioOverviewDetailsTableComponent } from '../portfolio-overview-details-table/portfolio-overview-details-table.component';
import { TooltipModule } from 'primeng/tooltip';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { PortfolioOverviewFilterExcelService } from '../portfolio-overview-filter/portfolio-overview-filter-excel-service';
import { AppStore } from '../../../../app-store';
import { MessageService } from 'primeng/api';
import { AppUserService } from '../../../../app-user.service';

describe('PortfolioOverviewTabComponent', () => {
  let component: PortfolioOverviewTabComponent;
  let fixture: ComponentFixture<PortfolioOverviewTabComponent>;
  let portfoliosService: any;

  beforeEach(async () => {
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolio']);
    const portfoliosAircraftServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);
    await TestBed.configureTestingModule({
      imports: [DropdownModule, FormsModule, NgChartsModule, RouterLink, TableModule, DialogModule, TooltipModule],
      declarations: [
        PortfolioOverviewTabComponent,
        PortfolioOverviewSummaryCountsComponent,
        PortoflioOverviewSummaryMetricsComponent,
        PortfolioOverviewGroupingComponent,
        PortfolioOverviewStackedBarChartComponent,
        PortfolioOverviewTableComponent,
        BackLinkComponent,
        IsLastColumnPipe,
        PortfolioOverviewAccordionComponent,
        PortfolioOverviewJitterChartComponent,
        PortfolioOverviewDetailsTableComponent
      ],
      providers: [
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        { provide: PortfolioAircraftService, useValue: portfoliosAircraftServiceSpy },
        PortfolioOverviewStore,
        ExportExcelService,
        PortfolioOverviewFilterExcelService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 1 })
          }
        },
        AppStore,
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } },
      ]
    }).compileComponents();
  });
  beforeEach(() => {
    portfoliosService = TestBed.inject(PortfoliosService);
    fixture = TestBed.createComponent(PortfolioOverviewTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load portfolio', fakeAsync(() => {
      component.ngOnInit();
      flush();
      expect(portfoliosService.getPortfolio).toHaveBeenCalledWith(1);
    }));
  });

});
