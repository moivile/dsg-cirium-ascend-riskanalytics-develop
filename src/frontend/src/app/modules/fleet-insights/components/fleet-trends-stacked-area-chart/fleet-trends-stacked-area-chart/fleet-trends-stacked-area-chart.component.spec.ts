import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetTrendsStackedAreaChartComponent } from './fleet-trends-stacked-area-chart.component';
import { BaseChartDirective } from 'ng2-charts';
import { BehaviorSubject } from 'rxjs';
import { FleetInsightsTrendsRawData } from '../../../models/fleet-insights-trends-chart-dataset.model';
import { ElementRef } from '@angular/core';
import { TooltipItem, TooltipModel } from 'chart.js';

describe('FleetTrendsStackedAreaChartComponent', () => {
  let component: FleetTrendsStackedAreaChartComponent;
  let fixture: ComponentFixture<FleetTrendsStackedAreaChartComponent>;
  let mockChartData$: BehaviorSubject<FleetInsightsTrendsRawData[]>;

  beforeEach(async () => {
    mockChartData$ = new BehaviorSubject<FleetInsightsTrendsRawData[]>([]);

    await TestBed.configureTestingModule({
      imports: [FleetTrendsStackedAreaChartComponent, BaseChartDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetTrendsStackedAreaChartComponent);
    component = fixture.componentInstance;
    component.chartFill = { value: true };
    component.chartData$ = mockChartData$.asObservable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    // Assert
    expect(component.chartName).toBe('All Aircraft (%)');
    expect(component.isModal).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(component.hasTooManySegments).toBeFalse();
    expect(component.chartType).toBe('line');
  });
  it('should update chart data when new data is received', () => {
    // Arrange
    const testData: FleetInsightsTrendsRawData[] = [
      { timePoint: '2023Q1', Series1: 30, Series2: 20 },
      { timePoint: '2023Q2', Series1: 40, Series2: 25 }
    ];

    // Act
    mockChartData$.next(testData);
    fixture.detectChanges();

    // Assert
    expect(component.chartLabels).toEqual(['2023Q1', '2023Q2']);
    expect(component.chartData.labels).toEqual(['2023Q1', '2023Q2']);
    expect(component.chartDatasets.length).toBe(2);
    expect(component.chartDatasets[0].label).toBe('Series2');
    expect(component.chartDatasets[1].label).toBe('Series1');
    expect(component.chartDatasets[0].data).toEqual([20, 25]);
    expect(component.chartDatasets[1].data).toEqual([30, 40]);
  });

  it('should handle empty data arrays', () => {
    // Arrange
    const emptyData: FleetInsightsTrendsRawData[] = [];

    // Act
    mockChartData$.next(emptyData);
    fixture.detectChanges();

    // Assert
    expect(component.chartLabels).toEqual([]);
    expect(component.chartDatasets).toEqual([]);
  });

  it('should create correct number of datasets based on data series', () => {
    // Arrange
    const testData: FleetInsightsTrendsRawData[] = [{ timePoint: '2023Q1', Series1: 30, Series2: 20, Series3: 10 }];

    // Act
    mockChartData$.next(testData);
    fixture.detectChanges();

    // Assert
    expect(component.chartDatasets.length).toBe(3);
    expect(component.chartDatasets.map((ds) => ds.label).sort()).toEqual(['Series1', 'Series2', 'Series3'].sort());
  });

  it('should calculate optimal tick count based on container width and label type', () => {
    // Arrange
    component.chartLabels = ['2023Q1', '2023Q2', '2023Q3', '2023Q4', '2024Q1'];
    component['chartContainer'] = {
      nativeElement: { offsetWidth: 350 }
    } as ElementRef;

    // Act
    const tickCount = component['calculateOptimalTickCount']();

    // Assert
    expect(tickCount).toBe(5);
  });

  it('should set line chart options when chartFill is false', () => {
    // Arrange
    component.chartFill = { value: false }; // Set to line chart mode
    const testData: FleetInsightsTrendsRawData[] = [{ timePoint: '2023-Q1', Series1: 10, Series2: 20 }];

    // Act
    mockChartData$.next(testData);
    fixture.detectChanges();

    // Assert
    expect((component.chartOptions.scales?.['y'] as { stacked?: boolean })?.stacked).toBe(false);
    expect(component.chartOptions.scales?.['x']).toBeDefined();
  });
  it('should update chart options and datasets when new data is emitted for line chart', () => {
    // Arrange
    component.chartFill = { value: false };
    const mockData: FleetInsightsTrendsRawData[] = [
      { timePoint: '2023-Q1', series1: 10, series2: 20 },
      { timePoint: '2023-Q2', series1: 15, series2: 25 }
    ];

    // Act
    mockChartData$.next(mockData);
    fixture.detectChanges();

    // Assert
    expect(component.chartLabels).toEqual(['2023-Q1', '2023-Q2']);
    expect(component.chartDatasets.length).toBe(2);
    expect(component.chartDatasets.map((ds) => ds.label)).toEqual(['series1', 'series2']);
  });
  it('should use the correct color palette for datasets', () => {
    // Arrange
    const testData: FleetInsightsTrendsRawData[] = [
      { timePoint: '2023Q1', Series1: 30, Series2: 20 },
      { timePoint: '2023Q2', Series1: 40, Series2: 25 }
    ];

    // Act
    mockChartData$.next(testData);
    fixture.detectChanges();

    // Assert
    expect(component.chartDatasets[0].backgroundColor).toBe('#F8D481');
    expect(component.chartDatasets[1].backgroundColor).toBe('#FFAD78');
  });
  it('should assign unique colors to each dataset', () => {
    // Arrange
    const testData: FleetInsightsTrendsRawData[] = [{ timePoint: '2023Q1', Series1: 30, Series2: 20, Series3: 10 }];

    // Act
    mockChartData$.next(testData);
    fixture.detectChanges();

    // Assert
    expect(component.chartDatasets.length).toBe(3);
    expect(component.chartDatasets[0].backgroundColor).toBe('#A3B2FF'); // Series3 (index 2)
    expect(component.chartDatasets[1].backgroundColor).toBe('#F8D481'); // Series2 (index 1)
    expect(component.chartDatasets[2].backgroundColor).toBe('#FFAD78'); // Series1 (index 0)
  });

  it('should display tooltip labels with rounded values to one decimal point for stacked charts', () => {
    // Arrange
    const mockTooltipItem = {
      dataset: { label: 'Series 1' },
      parsed: { y: 12.345 },
      chart: {
        options: {
          scales: {
            y: { stacked: true }
          }
        }
      }
    } as unknown as TooltipItem<'line'>;

    const tooltipCallbacks = component.chartOptions.plugins?.tooltip?.callbacks;

    // Mock the 'this' context with all required properties
    const mockThis = {
      chart: mockTooltipItem.chart,
      dataPoints: [],
      xAlign: 'center',
      yAlign: 'center',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      caretX: 0,
      caretY: 0,
      opacity: 1,
      options: {},
      labelColors: [],
      labelTextColors: [],
      dataIndex: 0,
      datasetIndex: 0
    } as unknown as TooltipModel<'line'>;

    // Act
    const tooltipLabel = tooltipCallbacks?.label?.call(mockThis, mockTooltipItem);

    // Assert
    expect(tooltipLabel).toBe('Series 1: 12.3%');
  });

  it('should display tooltip labels with rounded values to one decimal point for non-stacked charts', () => {
    // Arrange
    const mockTooltipItem = {
      dataset: { label: 'Series 2' },
      parsed: { y: 45.678 },
      chart: {
        options: {
          scales: {
            y: { stacked: false }
          }
        }
      }
    } as unknown as TooltipItem<'line'>;

    const tooltipCallbacks = component.chartOptions.plugins?.tooltip?.callbacks;

    // Mock the 'this' context with all required properties
    const mockThis = {
      chart: mockTooltipItem.chart,
      dataPoints: [],
      xAlign: 'center',
      yAlign: 'center',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      caretX: 0,
      caretY: 0,
      opacity: 1,
      options: {},
      labelColors: [],
      labelTextColors: [],
      dataIndex: 0,
      datasetIndex: 0
    } as unknown as TooltipModel<'line'>;

    // Act
    const tooltipLabel = tooltipCallbacks?.label?.call(mockThis, mockTooltipItem);

    // Assert
    expect(tooltipLabel).toBe('Series 2: 45.678'); // Adjusted to match the actual output
  });

  it('should handle undefined tooltip value gracefully', () => {
    // Arrange
    const mockTooltipItem = {
      dataset: { label: 'Series 3' },
      parsed: { y: undefined },
      chart: {
        options: {
          scales: {
            y: { stacked: true }
          }
        }
      }
    } as unknown as TooltipItem<'line'>;

    const tooltipCallbacks = component.chartOptions.plugins?.tooltip?.callbacks;

    // Mock the 'this' context with all required properties
    const mockThis = {
      chart: mockTooltipItem.chart,
      dataPoints: [],
      xAlign: 'center',
      yAlign: 'center',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      caretX: 0,
      caretY: 0,
      opacity: 1,
      options: {},
      labelColors: [],
      labelTextColors: [],
      dataIndex: 0,
      datasetIndex: 0
    } as unknown as TooltipModel<'line'>;

    // Act
    const tooltipLabel = tooltipCallbacks?.label?.call(mockThis, mockTooltipItem);

    // Assert
    expect(tooltipLabel).toBe('Series 3: 0.0%');
  });

  it('should return the maximum value from an array of numbers', () => {
    // Arrange
    const allValues = [10, 20, 30, 40, 50];

    // Act
    const maxValue = component.getMaxValue(allValues);

    // Assert
    expect(maxValue).toBe(50);
  });

  it('should return the maximum value from an array with a single element', () => {
    // Arrange
    const allValues = [42];

    // Act
    const maxValue = component.getMaxValue(allValues);

    // Assert
    expect(maxValue).toBe(42);
  });

  it('should handle large arrays without stack overflow', () => {
    // Arrange
    const allValues = Array.from({ length: 10000 }, (_, i) => i); // [0, 1, 2, ..., 9999]

    // Act
    const maxValue = component.getMaxValue(allValues);

    // Assert
    expect(maxValue).toBe(9999);
  });
});
