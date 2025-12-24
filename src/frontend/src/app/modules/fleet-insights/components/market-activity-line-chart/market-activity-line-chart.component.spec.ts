import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketActivityLineChartComponent } from './market-activity-line-chart.component';
import { BaseChartDirective  } from 'ng2-charts';
import { BehaviorSubject } from 'rxjs';
import { MarketActivityTrendsModel } from '../../models/market-activity-trends-model';
import { MetricType } from '../../models/metric-type.enum';
import { ElementRef } from '@angular/core';

describe('MarketActivityLineChartComponent', () => {
  let component: MarketActivityLineChartComponent;
  let fixture: ComponentFixture<MarketActivityLineChartComponent>;
  let mockInputData$: BehaviorSubject<MarketActivityTrendsModel[]>;
  let mockMetricType$: BehaviorSubject<MetricType>;

  beforeEach(async () => {
    mockInputData$ = new BehaviorSubject<MarketActivityTrendsModel[]>([]);
    mockMetricType$ = new BehaviorSubject<MetricType>(MetricType.Number);

    await TestBed.configureTestingModule({
      declarations: [MarketActivityLineChartComponent],
      imports: [BaseChartDirective ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketActivityLineChartComponent);
    component = fixture.componentInstance;
    component.inputData$ = mockInputData$.asObservable();
    component.metricType$ = mockMetricType$.asObservable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    // Assert
    expect(component.isModal).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(component.chartHeight).toBe(500);
    expect(component.currentMetricType).toBe(MetricType.Number);
    expect(component.tooManyGroupings).toBeFalse();
    expect(component.lineChartLabels).toEqual([]);
    expect(component.lineChartDataSets).toEqual([]);
  });

  it('should update chart data when new data is received', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: '2023Q1', numberOfEvents: 30, percentageOfTotal: 15.5, grouping: 'Boeing 737' },
      { period: '2023Q2', numberOfEvents: 40, percentageOfTotal: 20.2, grouping: 'Boeing 737' },
      { period: '2023Q1', numberOfEvents: 20, percentageOfTotal: 10.3, grouping: 'Airbus A320' },
      { period: '2023Q2', numberOfEvents: 25, percentageOfTotal: 12.6, grouping: 'Airbus A320' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartLabels).toEqual(['2023Q1', '2023Q2']);
    expect(component.lineChartDataSets.length).toBe(2);
    expect(component.lineChartDataSets[0].label).toBe('Boeing 737');
    expect(component.lineChartDataSets[1].label).toBe('Airbus A320');
    expect(component.lineChartDataSets[0].data).toEqual([30, 40]);
    expect(component.lineChartDataSets[1].data).toEqual([20, 25]);
  });

  it('should handle empty data arrays', () => {
    // Arrange
    const emptyData: MarketActivityTrendsModel[] = [];

    // Act
    mockInputData$.next(emptyData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartLabels).toEqual([]);
    expect(component.lineChartDataSets).toEqual([]);
  });

  it('should use percentage values when metric type is percentage', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: '2023Q1', numberOfEvents: 30, percentageOfTotal: 15.5, grouping: 'Boeing 737' },
      { period: '2023Q2', numberOfEvents: 40, percentageOfTotal: 20.2, grouping: 'Boeing 737' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Percentage);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartDataSets[0].data).toEqual([15.5, 20.2]);
  });

  it('should use number values when metric type is number', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: '2023Q1', numberOfEvents: 30, percentageOfTotal: 15.5, grouping: 'Boeing 737' },
      { period: '2023Q2', numberOfEvents: 40, percentageOfTotal: 20.2, grouping: 'Boeing 737' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartDataSets[0].data).toEqual([30, 40]);
  });

  it('should handle missing percentageOfTotal values', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: '2023Q1', numberOfEvents: 30, grouping: 'Boeing 737' },
      { period: '2023Q2', numberOfEvents: 40, percentageOfTotal: 20.2, grouping: 'Boeing 737' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Percentage);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartDataSets[0].data).toEqual([0, 20.2]);
  });

  it('should sort periods chronologically for quarterly data', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: 'Q2 2023', numberOfEvents: 40, grouping: 'Boeing 737' },
      { period: 'Q1 2023', numberOfEvents: 30, grouping: 'Boeing 737' },
      { period: 'Q4 2022', numberOfEvents: 25, grouping: 'Boeing 737' },
      { period: 'Q3 2023', numberOfEvents: 35, grouping: 'Boeing 737' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartLabels).toEqual(['Q4 2022', 'Q1 2023', 'Q2 2023', 'Q3 2023']);
    expect(component.lineChartDataSets[0].data).toEqual([25, 30, 40, 35]);
  });

  it('should sort periods chronologically for monthly data', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: 'Mar 2023', numberOfEvents: 30, grouping: 'Boeing 737' },
      { period: 'Jan 2023', numberOfEvents: 25, grouping: 'Boeing 737' },
      { period: 'Feb 2023', numberOfEvents: 28, grouping: 'Boeing 737' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartLabels).toEqual(['Jan 2023', 'Feb 2023', 'Mar 2023']);
    expect(component.lineChartDataSets[0].data).toEqual([25, 28, 30]);
  });

  it('should sort periods chronologically for yearly data', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: '2023', numberOfEvents: 40, grouping: 'Boeing 737' },
      { period: '2021', numberOfEvents: 30, grouping: 'Boeing 737' },
      { period: '2022', numberOfEvents: 35, grouping: 'Boeing 737' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartLabels).toEqual(['2021', '2022', '2023']);
    expect(component.lineChartDataSets[0].data).toEqual([30, 35, 40]);
  });

  it('should limit groupings to maximum allowed and set tooManyGroupings flag', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [];
    for (let i = 1; i <= 12; i++) {
      testData.push({
        period: '2023Q1',
        numberOfEvents: i * 10,
        grouping: `Aircraft ${i}`
      });
    }

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.tooManyGroupings).toBeTrue();
    expect(component.lineChartDataSets).toEqual([]);
    expect(component.lineChartLabels).toEqual([]);
  });

  it('should not set tooManyGroupings flag when within limit', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [];
    for (let i = 1; i <= 8; i++) {
      testData.push({
        period: '2023Q1',
        numberOfEvents: i * 10,
        grouping: `Aircraft ${i}`
      });
    }

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.tooManyGroupings).toBeFalse();
    expect(component.lineChartDataSets.length).toBe(8);
  });

  it('should select top groupings by total values', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: '2023Q1', numberOfEvents: 10, grouping: 'Low Volume' },
      { period: '2023Q2', numberOfEvents: 15, grouping: 'Low Volume' },
      { period: '2023Q1', numberOfEvents: 50, grouping: 'High Volume' },
      { period: '2023Q2', numberOfEvents: 60, grouping: 'High Volume' },
      { period: '2023Q1', numberOfEvents: 30, grouping: 'Medium Volume' },
      { period: '2023Q2', numberOfEvents: 35, grouping: 'Medium Volume' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartDataSets[0].label).toBe('High Volume'); // Total: 110
    expect(component.lineChartDataSets[1].label).toBe('Medium Volume'); // Total: 65
    expect(component.lineChartDataSets[2].label).toBe('Low Volume'); // Total: 25
  });

  it('should use correct colors from the color palette', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: '2023Q1', numberOfEvents: 30, grouping: 'Boeing 737' },
      { period: '2023Q1', numberOfEvents: 20, grouping: 'Airbus A320' },
      { period: '2023Q1', numberOfEvents: 15, grouping: 'Boeing 777' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert
    expect(component.lineChartDataSets[0].backgroundColor).toBe('#FFAD78');
    expect(component.lineChartDataSets[1].backgroundColor).toBe('#FEE19D');
    expect(component.lineChartDataSets[2].backgroundColor).toBe('#A3B2FF');
  });

  it('should calculate optimal tick count based on container width and label type', () => {
    // Arrange
    component.lineChartLabels = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024'];
    component['chartContainer'] = {
      nativeElement: { offsetWidth: 350 }
    } as ElementRef;

    // Act
    const tickCount = component['calculateOptimalTickCount']();

    // Assert
    expect(tickCount).toBe(5);
  });

  it('should return all labels when count is less than minimum', () => {
    // Arrange
    component.lineChartLabels = ['Q1 2023', 'Q2 2023'];
    component['chartContainer'] = {
      nativeElement: { offsetWidth: 100 }
    } as ElementRef;

    // Act
    const tickCount = component['calculateOptimalTickCount']();

    // Assert
    expect(tickCount).toBe(2);
  });

  it('should handle quarterly label type correctly', () => {
    // Arrange
    const quarterlyLabel = 'Q1 2023';

    // Act
    const labelType = component['getLabelType'](quarterlyLabel);

    // Assert
    expect(labelType).toBe('quarterly');
  });

  it('should handle yearly label type correctly', () => {
    // Arrange
    const yearlyLabel = '2023';

    // Act
    const labelType = component['getLabelType'](yearlyLabel);

    // Assert
    expect(labelType).toBe('yearly');
  });

  it('should handle monthly label type correctly', () => {
    // Arrange
    const monthlyLabel = 'Jan 2023';

    // Act
    const labelType = component['getLabelType'](monthlyLabel);

    // Assert
    expect(labelType).toBe('monthly');
  });

  it('should create datasets with correct chart.js properties', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [{ period: '2023Q1', numberOfEvents: 30, grouping: 'Boeing 737' }];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    const dataset = component.lineChartDataSets[0];

    // Assert
    expect(dataset.borderWidth).toBe(3);
    expect(dataset.pointRadius).toBe(0);
    expect(dataset.pointHoverRadius).toBe(4);
    expect(dataset.tension).toBe(0.4);
    expect(dataset.fill).toBe(false);
    expect(dataset.spanGaps).toBe(true);
    expect(dataset.stepped).toBe(false);
  });

  it('should set tooltip configuration for number metric type', () => {
    // Arrange
    component.currentMetricType = MetricType.Number;

    // Act
    component['setChartOptions']();

    // Assert
    expect(component.lineChartOptions.plugins?.tooltip?.backgroundColor).toBe('rgba(88, 88, 88, 0.8)');
    expect(component.lineChartOptions.plugins?.tooltip?.titleColor).toBe('#ffffff');
    expect(component.lineChartOptions.plugins?.tooltip?.bodyColor).toBe('#ffffff');
  });

  it('should set tooltip configuration for percentage metric type', () => {
    // Arrange
    component.currentMetricType = MetricType.Percentage;

    // Act
    component['setChartOptions']();

    // Assert
    expect(component.lineChartOptions.plugins?.tooltip?.backgroundColor).toBe('rgba(88, 88, 88, 0.8)');
    expect(component.lineChartOptions.plugins?.tooltip?.titleColor).toBe('#ffffff');
    expect(component.lineChartOptions.plugins?.tooltip?.bodyColor).toBe('#ffffff');
  });

  it('should handle missing chart container gracefully', () => {
    // Arrange
    component['chartContainer'] = undefined;

    // Act
    const tickCount = component['calculateOptimalTickCount']();

    // Assert
    expect(tickCount).toBe(12); // defaultOptimalTickCount
  });

  it('should update current metric type when metricType$ emits', () => {
    // Arrange
    expect(component.currentMetricType).toBe(MetricType.Number);

    // Act
    mockMetricType$.next(MetricType.Percentage);
    fixture.detectChanges();

    // Assert
    expect(component.currentMetricType).toBe(MetricType.Percentage);
  });

  it('should not throw error when updateChart is called without chart directive', () => {
    // Arrange
    component.chart = undefined;

    // Act & Assert
    expect(() => component['updateChart']()).not.toThrow();
  });

  it('should unsubscribe on destroy', () => {
    // Arrange
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    // Act
    component.ngOnDestroy();

    // Assert
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should configure stacked area chart when metric type is percentage', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: 'Q1 2023', numberOfEvents: 30, percentageOfTotal: 30, grouping: 'A' },
      { period: 'Q2 2023', numberOfEvents: 40, percentageOfTotal: 40, grouping: 'A' },
      { period: 'Q1 2023', numberOfEvents: 20, percentageOfTotal: 20, grouping: 'B' },
      { period: 'Q2 2023', numberOfEvents: 10, percentageOfTotal: 10, grouping: 'B' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Percentage);
    fixture.detectChanges();

    // Assert: currentMetricType updated
    expect(component.currentMetricType).toBe(MetricType.Percentage);

    // y axis should be stacked for percentage mode
    expect(component.lineChartOptions.scales?.['y']?.stacked).toBeTrue();

    // datasets should have fill = true (stacked area)
    expect(component.lineChartDataSets.length).toBeGreaterThan(0);
    component.lineChartDataSets.forEach((ds) => {
      expect(ds.fill).toBeTrue();
    });
  });

  it('should not use stacked area when metric type is number', () => {
    // Arrange
    const testData: MarketActivityTrendsModel[] = [
      { period: 'Q1 2023', numberOfEvents: 30, percentageOfTotal: 30, grouping: 'A' },
      { period: 'Q2 2023', numberOfEvents: 40, percentageOfTotal: 40, grouping: 'A' }
    ];

    // Act
    mockInputData$.next(testData);
    mockMetricType$.next(MetricType.Number);
    fixture.detectChanges();

    // Assert: currentMetricType updated
    expect(component.currentMetricType).toBe(MetricType.Number);

    // y axis should not be stacked for number mode
    expect(component.lineChartOptions.scales?.['y']?.stacked).toBeFalse();

    // datasets should have fill = false (line chart)
    expect(component.lineChartDataSets.length).toBeGreaterThan(0);
    component.lineChartDataSets.forEach((ds) => {
      expect(ds.fill).toBeFalse();
    });
  });
});
