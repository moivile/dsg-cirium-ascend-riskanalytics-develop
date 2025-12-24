import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseChartDirective } from 'ng2-charts';
import { BehaviorSubject, of } from 'rxjs';
import { MetricType } from '../../models/metric-type.enum';
import { MarketActivitySummaryModel } from '../../models/market-activity-summary-model';
import { FleetInsightsChartInputData } from '../../models/fleet-insights-chart-input-data';
import { MarketActivityHorizontalChartComponent } from './market-activity-horizontal-chart.component';

interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  indexAxis: string;
  scales: {
    x: {
      position: string;
      stacked: boolean;
      ticks: {
        callback: (value: number) => string | number | undefined;
      };
    };
    y: {
      ticks: {
        callback: (value: string) => string;
      };
    };
  };
  plugins: {
    legend: {
      display: boolean;
    };
    tooltip: {
      enabled: boolean;
      external: (tooltipModel: unknown) => void;
    };
  };
}

describe('MarketActivityHorizontalChartComponent', () => {
  let component: MarketActivityHorizontalChartComponent;
  let fixture: ComponentFixture<MarketActivityHorizontalChartComponent>;

  const mockMarketActivityData: MarketActivitySummaryModel[] = [
    {
      grouping: 'Boeing 737',
      numberOfEvents: 150,
      percentageOfTotal: 45.5
    },
    {
      grouping: 'Airbus A320',
      numberOfEvents: 120,
      percentageOfTotal: 36.4
    },
    {
      grouping: 'Boeing 777',
      numberOfEvents: 60,
      percentageOfTotal: 18.1
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketActivityHorizontalChartComponent],
      imports: [BaseChartDirective]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketActivityHorizontalChartComponent);
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
      expect(component.currentMetricType).toBe(MetricType.Number);
      expect(component.showDownloadChart).toBeTrue();
    });

    it('should set chart options on init', () => {
      component.ngOnInit();
      expect(component.barChartOptions).toBeDefined();
      const options = component.barChartOptions as ChartOptions;
      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.indexAxis).toBe('y');
    });

    it('should initialize chartData$ with empty values', () => {
      expect(component.chartData$.value).toEqual({
        labels: [],
        chartCounts: [],
        legendItemLabels: []
      });
    });
  });

  describe('data transformation', () => {
    it('should transform input data to chart data with number metric type', (done) => {
      component.inputData$ = of(mockMarketActivityData);
      component.metricType$ = of(MetricType.Number);

      component.ngOnInit();

      component.chartData$.subscribe((chartData) => {
        if (chartData.labels.length > 0) {
          expect(chartData.labels).toEqual(['Boeing 737', 'Airbus A320', 'Boeing 777']);
          expect(chartData.chartCounts).toEqual([[150, 120, 60]]);
          expect(chartData.legendItemLabels).toEqual(['Boeing 737', 'Airbus A320', 'Boeing 777']);
          done();
        }
      });
    });

    it('should transform input data to chart data with percentage metric type', (done) => {
      component.inputData$ = of(mockMarketActivityData);
      component.metricType$ = of(MetricType.Percentage);

      component.ngOnInit();

      component.chartData$.subscribe((chartData) => {
        if (chartData.labels.length > 0) {
          expect(chartData.labels).toEqual(['Boeing 737', 'Airbus A320', 'Boeing 777']);
          expect(chartData.chartCounts).toEqual([[45.5, 36.4, 18.1]]);
          expect(chartData.legendItemLabels).toEqual(['Boeing 737', 'Airbus A320', 'Boeing 777']);
          done();
        }
      });
    });

    it('should sort data by values in descending order for number metric', (done) => {
      const unsortedData: MarketActivitySummaryModel[] = [
        { grouping: 'Low', numberOfEvents: 50, percentageOfTotal: 15 },
        { grouping: 'High', numberOfEvents: 200, percentageOfTotal: 60 },
        { grouping: 'Medium', numberOfEvents: 100, percentageOfTotal: 25 }
      ];

      component.inputData$ = of(unsortedData);
      component.metricType$ = of(MetricType.Number);

      component.ngOnInit();

      component.chartData$.subscribe((chartData) => {
        if (chartData.labels.length > 0) {
          expect(chartData.labels).toEqual(['High', 'Medium', 'Low']);
          expect(chartData.chartCounts).toEqual([[200, 100, 50]]);
          done();
        }
      });
    });

    it('should handle empty input data', (done) => {
      component.inputData$ = of([]);
      component.metricType$ = of(MetricType.Number);

      component.ngOnInit();

      component.chartData$.subscribe((chartData) => {
        expect(chartData.labels).toEqual([]);
        expect(chartData.chartCounts).toEqual([[]]);
        expect(chartData.legendItemLabels).toEqual([]);
        done();
      });
    });
  });

  describe('getDataSets', () => {
    it('should create correct dataset structure', () => {
      const chartCounts = [[100, 200, 150]];
      const legendLabels = ['Boeing 737', 'Airbus A320', 'Boeing 777'];
      const result = component.getDataSets(chartCounts, legendLabels);

      expect(result).toHaveSize(1);
      expect(result[0]).toEqual({
        data: [100, 200, 150],
        label: 'Boeing 737',
        backgroundColor: '#00A485',
        hoverBackgroundColor: '#00A485',
        borderWidth: 1,
        hoverBorderWidth: 2,
        borderColor: component['borderColour'],
        hoverBorderColor: '#00A485'
      });
    });

    it('should handle multiple datasets', () => {
      const chartCounts = [
        [100, 200],
        [150, 250]
      ];
      const legendLabels = ['Dataset 1', 'Dataset 2'];
      const result = component.getDataSets(chartCounts, legendLabels);

      expect(result).toHaveSize(2);
      expect(result[0].label).toBe('Dataset 1');
      expect(result[1].label).toBe('Dataset 2');
    });

    it('should handle empty chart counts', () => {
      const chartCounts: number[][] = [];
      const legendLabels: string[] = [];
      const result = component.getDataSets(chartCounts, legendLabels);

      expect(result).toEqual([]);
    });
  });

  describe('chart height calculation', () => {
    it('should set minimum chart height when no data', () => {
      component.barChartDataSets = [];
      component['initChartHeight']();
      expect(component.chartHeight).toBe(100);
    });

    it('should calculate chart height based on number of labels', () => {
      component.barChartDataSets = [{ data: [1, 2, 3] }];
      component.barChartLabels = ['Label 1', 'Label 2', 'Label 3'];
      component['initChartHeight']();

      const expectedHeight = 64 + 3 * 27;
      expect(component.chartHeight).toBe(expectedHeight);
    });
  });

  describe('chart options', () => {
    beforeEach(() => {
      component.currentMetricType = MetricType.Number;
      component['setChartOptions']();
    });

    it('should set correct chart options for number metric type', () => {
      const options = component.barChartOptions as ChartOptions;

      expect(options.responsive).toBe(true);
      expect(options.maintainAspectRatio).toBe(false);
      expect(options.indexAxis).toBe('y');
      expect(options.scales.x.position).toBe('top');
      expect(options.scales.x.stacked).toBe(false);
      expect(options.plugins.legend.display).toBe(false);
    });

    it('should configure tooltip to be disabled but with external handler', () => {
      const options = component.barChartOptions as ChartOptions;

      expect(options.plugins.tooltip.enabled).toBe(false);
      expect(options.plugins.tooltip.external).toBeDefined();
    });

    it('should format x-axis ticks correctly for percentage metric', () => {
      component.currentMetricType = MetricType.Percentage;
      component['setChartOptions']();

      const options = component.barChartOptions as ChartOptions;
      const tickCallback = options.scales.x.ticks.callback;

      expect(tickCallback(50)).toBe('50%');
      expect(tickCallback(50.5)).toBeUndefined(); // Non-integer values should return undefined
    });

    it('should format x-axis ticks correctly for number metric', () => {
      component.currentMetricType = MetricType.Number;
      component['setChartOptions']();

      const options = component.barChartOptions as ChartOptions;
      const tickCallback = options.scales.x.ticks.callback;

      expect(tickCallback(100)).toBe(100);
      expect(tickCallback(100.5)).toBeUndefined(); // Non-integer values should return undefined
    });

    it('should truncate long y-axis labels', () => {
      const options = component.barChartOptions as ChartOptions;
      const mockThis = {
        getLabelForValue: () => 'Very Long Label Name That Exceeds Limit'
      };

      const result = options.scales.y.ticks.callback.call(mockThis, '0');
      expect(result).toBe('Very Long ...');
    });

    it('should not truncate short y-axis labels', () => {
      const options = component.barChartOptions as ChartOptions;
      const mockThis = {
        getLabelForValue: () => 'Short'
      };

      const result = options.scales.y.ticks.callback.call(mockThis, '0');
      expect(result).toBe('Short');
    });
  });

  describe('tooltip handling', () => {
    it('should parse tooltip body content correctly', () => {
      const tooltipBody = [['Boeing 737: 100'], ['Airbus A320: 200'], ['Boeing 777: 50']];
      const result = MarketActivityHorizontalChartComponent.getTooltipBodyContentItems(tooltipBody);

      expect(result).toEqual([
        { text: 'Boeing 737', value: 100 },
        { text: 'Airbus A320', value: 200 },
        { text: 'Boeing 777', value: 50 },
        { text: 'Total', value: 350 }
      ]);
    });

    it('should handle tooltip body with commas in numbers', () => {
      const tooltipBody = [['Boeing 737: 1,500'], ['Airbus A320: 2,000']];
      const result = MarketActivityHorizontalChartComponent.getTooltipBodyContentItems(tooltipBody);

      expect(result).toEqual([
        { text: 'Boeing 737', value: 1500 },
        { text: 'Airbus A320', value: 2000 },
        { text: 'Total', value: 3500 }
      ]);
    });

    it('should filter out zero values and not add total for single item', () => {
      const tooltipBody = [['Boeing 737: 100'], ['Airbus A320: 0']];
      const result = MarketActivityHorizontalChartComponent.getTooltipBodyContentItems(tooltipBody);

      expect(result).toEqual([
        { text: 'Boeing 737', value: 100 },
        { text: 'Airbus A320', value: 0 }
      ]);
    });

    it('should remove tooltip from DOM', () => {
      const mockTooltip = document.createElement('div');
      mockTooltip.id = 'stacked-bar-tooltip';
      document.body.appendChild(mockTooltip);

      component.removeTooltip();
      expect(document.getElementById('stacked-bar-tooltip')).toBeNull();
    });

    it('should handle removeTooltip when no tooltip exists', () => {
      expect(() => component.removeTooltip()).not.toThrow();
    });
  });

  describe('tooltip creation and management', () => {
    afterEach(() => {
      const existingTooltip = document.getElementById('stacked-bar-tooltip');
      if (existingTooltip) {
        existingTooltip.remove();
      }
    });

    it('should create tooltip content with percentage format for percentage metric', () => {
      const tooltipModel = {
        tooltip: {
          dataPoints: [
            {
              raw: 45.67,
              label: 'Boeing 737',
              dataset: {
                backgroundColor: '#00A485',
                borderColor: '#000'
              }
            }
          ]
        }
      };
      const innerHtml = '<table><thead><tr><th colspan="3" class="tooltip-title">Test</th></tr></thead><tbody>';
      const metricType = MetricType.Percentage;

      const result = MarketActivityHorizontalChartComponent['createTooltipContent'](tooltipModel, innerHtml, metricType);

      expect(result).toContain('45.7%');
      expect(result).toContain('Boeing 737');
      expect(result).toContain('</tbody></table>');
    });

    it('should create tooltip content with number format for number metric', () => {
      const tooltipModel = {
        tooltip: {
          dataPoints: [
            {
              raw: 450,
              label: 'Boeing 737',
              dataset: {
                backgroundColor: '#00A485',
                borderColor: '#000'
              }
            }
          ]
        }
      };
      const innerHtml = '<table><thead><tr><th colspan="3" class="tooltip-title">Test</th></tr></thead><tbody>';
      const metricType = MetricType.Number;

      const result = MarketActivityHorizontalChartComponent['createTooltipContent'](tooltipModel, innerHtml, metricType);

      expect(result).toContain('450');
      expect(result).not.toContain('%');
      expect(result).toContain('Boeing 737');
    });

    it('should skip zero values in tooltip content', () => {
      const tooltipModel = {
        tooltip: {
          dataPoints: [
            {
              raw: 0,
              label: 'Boeing 737',
              dataset: {
                backgroundColor: '#00A485',
                borderColor: '#000'
              }
            },
            {
              raw: 100,
              label: 'Airbus A320',
              dataset: {
                backgroundColor: '#00A485',
                borderColor: '#000'
              }
            }
          ]
        }
      };
      const innerHtml = '<table><thead><tr><th colspan="3" class="tooltip-title">Test</th></tr></thead><tbody>';
      const metricType = MetricType.Number;

      const result = MarketActivityHorizontalChartComponent['createTooltipContent'](tooltipModel, innerHtml, metricType);

      expect(result).not.toContain('Boeing 737');
      expect(result).toContain('Airbus A320');
      expect(result).toContain('100');
    });

    it('should create tooltip table structure with title', () => {
      const titles = ['Market Activity Summary'];
      const result = MarketActivityHorizontalChartComponent['createTooltipTableStructure'](titles);

      expect(result).toContain('<thead>');
      expect(result).toContain(`<th colspan='3' class='tooltip-title' > Market Activity Summary </th>`);
      expect(result).toContain('</thead><tbody>');
    });

    it('should build complete tooltip', () => {
      const tooltipModel = {
        tooltip: {
          opacity: 1,
          title: ['Market Activity'],
          body: [{ lines: ['Boeing 737: 100'] }],
          dataPoints: [
            {
              raw: 100,
              label: 'Boeing 737',
              dataset: {
                backgroundColor: '#00A485',
                borderColor: '#000'
              }
            }
          ]
        }
      };

      const tooltip = MarketActivityHorizontalChartComponent['buildToolTip'](tooltipModel, MetricType.Number);

      expect(tooltip).toBeTruthy();
      expect(tooltip.id).toBe('stacked-bar-tooltip');
    });

    it('should hide tooltip when opacity is 0', () => {
      const tooltipModel = {
        tooltip: {
          opacity: 0
        }
      };

      const tooltip = MarketActivityHorizontalChartComponent['buildToolTip'](tooltipModel, MetricType.Number);

      expect(tooltip.style.opacity).toBe('0');
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

    it('should update metric type when metricType$ emits', (done) => {
      component.metricType$ = of(MetricType.Percentage);
      component.inputData$ = of([]);

      component.ngOnInit();

      setTimeout(() => {
        expect(component.currentMetricType).toBe(MetricType.Percentage);
        done();
      }, 100);
    });

    it('should update chart data when inputs change', (done) => {
      const chartDataSpy = spyOn(component.chartData$, 'next');

      component.inputData$ = of(mockMarketActivityData);
      component.metricType$ = of(MetricType.Number);

      component.ngOnInit();

      setTimeout(() => {
        expect(chartDataSpy).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('input property handling', () => {
    it('should accept chartname input', () => {
      component.chartname = 'Market Activity Chart';
      expect(component.chartname).toBe('Market Activity Chart');
    });

    it('should accept isModal input', () => {
      component.isModal = true;
      expect(component.isModal).toBe(true);
    });

    it('should accept loading input', () => {
      component.loading = true;
      expect(component.loading).toBe(true);
    });

    it('should handle custom chartData$ input', () => {
      const customChartData = new BehaviorSubject<FleetInsightsChartInputData>({
        labels: ['Custom Label'],
        chartCounts: [[100]],
        legendItemLabels: ['Custom Legend']
      });

      component.chartData$ = customChartData;
      expect(component.chartData$.value.labels).toEqual(['Custom Label']);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle undefined numberOfEvents gracefully', (done) => {
      const dataWithUndefined: MarketActivitySummaryModel[] = [
        {
          grouping: 'Test',
          numberOfEvents: undefined as unknown as number,
          percentageOfTotal: 50
        }
      ];

      component.inputData$ = of(dataWithUndefined);
      component.metricType$ = of(MetricType.Number);

      component.ngOnInit();

      component.chartData$.subscribe((chartData) => {
        if (chartData.labels.length > 0) {
          expect(chartData.chartCounts[0][0]).toBeUndefined();
          done();
        }
      });
    });

    it('should handle null percentageOfTotal gracefully', (done) => {
      const dataWithNull: MarketActivitySummaryModel[] = [
        {
          grouping: 'Test',
          numberOfEvents: 100,
          percentageOfTotal: null as unknown as number
        }
      ];

      component.inputData$ = of(dataWithNull);
      component.metricType$ = of(MetricType.Percentage);

      component.ngOnInit();

      component.chartData$.subscribe((chartData) => {
        if (chartData.labels.length > 0) {
          expect(chartData.chartCounts[0][0]).toBe(0);
          done();
        }
      });
    });

    it('should handle very long grouping names', (done) => {
      const dataWithLongNames: MarketActivitySummaryModel[] = [
        {
          grouping: 'This is a very long aircraft model name that exceeds normal limits',
          numberOfEvents: 100,
          percentageOfTotal: 50
        }
      ];

      component.inputData$ = of(dataWithLongNames);
      component.metricType$ = of(MetricType.Number);

      component.ngOnInit();

      component.chartData$.subscribe((chartData) => {
        if (chartData.labels.length > 0) {
          expect(chartData.labels[0]).toBe('This is a very long aircraft model name that exceeds normal limits');
          done();
        }
      });
    });
  });
});
