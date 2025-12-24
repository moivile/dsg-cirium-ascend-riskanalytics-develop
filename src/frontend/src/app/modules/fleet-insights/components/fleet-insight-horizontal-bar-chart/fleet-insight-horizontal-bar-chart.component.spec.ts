import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseChartDirective } from 'ng2-charts';
import { of } from 'rxjs';
import { MetricType } from '../../models/metric-type.enum';
import { FleetInsightHorizontalBarChartComponent } from './fleet-insight-horizontal-bar-chart.component';

describe('FleetInsightHorizontalBarChartComponent', () => {
  let component: FleetInsightHorizontalBarChartComponent;
  let fixture: ComponentFixture<FleetInsightHorizontalBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetInsightHorizontalBarChartComponent],
      imports: [BaseChartDirective]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetInsightHorizontalBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(component.isModal).toBeFalse();
      expect(component.loading).toBeFalse();
      expect(component.barChartLabels).toEqual([]);
      expect(component.barChartDataSets).toEqual([]);
    });

    it('should set chart options on init', () => {
      component.ngOnInit();
      expect(component.barChartOptions).toBeDefined();
    });
  });

  describe('getDataSets', () => {
    it('should create correct dataset structure', () => {
      const chartCounts = [[100, 200]];
      const legendLabels = ['Test'];
      const result = component.getDataSets(chartCounts, legendLabels);

      expect(result[0]).toEqual({
        data: [100, 200],
        label: 'Test',
        backgroundColor: '#00A485',
        hoverBackgroundColor: '#00A485',
        borderWidth: 1,
        hoverBorderWidth: 2,
        borderColor: component['borderColour'],
        hoverBorderColor: '#00A485'
      });
    });
  });

  describe('tooltip handling', () => {
    it('should parse tooltip body content correctly', () => {
      const tooltipBody = [['Label A: 100'], ['Label B: 200']];
      const result = FleetInsightHorizontalBarChartComponent.getTooltipBodyContentItems(tooltipBody);

      expect(result).toEqual([
        { text: 'Label A', value: 100 },
        { text: 'Label B', value: 200 },
        { text: 'Total', value: 300 }
      ]);
    });

    it('should remove tooltip', () => {
      const mockTooltip = document.createElement('div');
      mockTooltip.id = 'stacked-bar-tooltip';
      document.body.appendChild(mockTooltip);

      component.removeTooltip();
      expect(document.getElementById('stacked-bar-tooltip')).toBeNull();
    });
  });

  describe('lifecycle hooks', () => {
    it('should cleanup subscriptions on destroy', () => {
      const nextSpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should update chart data on input changes', (done) => {
      const mockData = [{ grouping: 'Test', numberOfAircraft: 100, percentageOfTotal: 50 }];

      component.inputData$ = of(mockData);
      component.metricType$ = of('number' as MetricType);

      component.ngOnInit();
      component.chartData$.subscribe((data) => {
        expect(data.labels).toEqual(['Test']);
        expect(data.chartCounts).toEqual([[100]]);
        done();
      });
    });
  });

  describe('FleetInsightHorizontalBarChartComponent', () => {
    describe('createTooltipContent', () => {
      it('should append % symbol when metric type is Percentage', () => {
        // Arrange
        const tooltipModel = {
          tooltip: {
            dataPoints: [
              {
                raw: 45.67,
                label: 'Test Label',
                dataset: {
                  backgroundColor: '#000',
                  borderColor: '#000'
                }
              }
            ]
          }
        };
        const innerHtml = '<table>';
        const metricType = MetricType.Percentage;

        // Act
        const result = FleetInsightHorizontalBarChartComponent['createTooltipContent'](tooltipModel, innerHtml, metricType);

        // Assert
        expect(result).toContain('45.7%');
      });

      it('should not append % symbol when metric type is not Percentage', () => {
        // Arrange
        const tooltipModel = {
          tooltip: {
            dataPoints: [
              {
                raw: 450,
                label: 'Test Label',
                dataset: {
                  backgroundColor: '#000',
                  borderColor: '#000'
                }
              }
            ]
          }
        };
        const innerHtml = '<table>';
        const metricType = MetricType.Number;

        // Act
        const result = FleetInsightHorizontalBarChartComponent['createTooltipContent'](tooltipModel, innerHtml, metricType);

        // Assert
        expect(result).toContain('450');
        expect(result).not.toContain('%');
      });
    });
  });
});
