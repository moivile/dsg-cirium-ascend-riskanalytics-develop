import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseChartDirective } from 'ng2-charts';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { PortfolioOverviewStackedBarChartComponent } from './portfolio-overview-stacked-bar-chart.component';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';

describe('PortfolioOverviewStackedBarChartComponent', () => {
  let component: PortfolioOverviewStackedBarChartComponent;
  let fixture: ComponentFixture<PortfolioOverviewStackedBarChartComponent>;

  beforeEach(async () => {
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);

    await TestBed.configureTestingModule({
      declarations: [PortfolioOverviewStackedBarChartComponent],
      imports: [BaseChartDirective],
      providers: [PortfolioOverviewStore, { provide: PortfolioAircraftService, useValue: portfoliosServiceSpy }, provideHttpClient(withInterceptorsFromDi())]
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioOverviewStackedBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('removeToolTip', () => {
    it('should remove tooltip if it exists', () => {
      const tooltip = document.createElement('div');
      tooltip.id = 'stacked-bar-tooltip';
      document.body.appendChild(tooltip);
      component.removeTooltip();
      fixture.detectChanges();
      expect(document.getElementById(tooltip.id)).toBeNull();
    });
    it('should not throw an error if the tooltip does not exist', () => {
      spyOn<any>(PortfolioOverviewStackedBarChartComponent, 'getToolTip').and.returnValue(null);
      expect(() => {
        component.removeTooltip();
      }).not.toThrow();
    });
  });

  describe('getTooltipBodyContent', () => {
    const tooltipBody = JSON.parse('[["In Service: 1,218,55"],["Cancelled: 284"],["Retired: 57"]]');
    const tooltipBodyContentsExpected = JSON.parse(
      '[{"text":"In Service","value":121855},{"text":"Cancelled","value":284},{"text":"Retired","value":57}]'
    );
    let tooltipBodyContents: any[] = [];
    it('should remove all comma from tooltip values', () => {
      tooltipBodyContents = PortfolioOverviewStackedBarChartComponent.getTooltipBodyContent(tooltipBody, tooltipBodyContents);
      expect(tooltipBodyContents).toEqual(tooltipBodyContentsExpected);
    });
  });

  describe('showModal', () => {
    it('should set modalTitle and displayModal to true', () => {
      component.countBy = 'status';
      component.showModal();
      expect(component.modalTitle).toEqual('Status Chart');
      expect(component.displayModal).toBe(true);
    });
  });
});
