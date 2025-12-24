import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FleetInsightPieChartComponent } from './fleet-insight-pie-chart.component';
import { of } from 'rxjs';
import { MetricType } from '../../models/metric-type.enum';
import { FleetInsightsAircraftSummaryModel } from '../../models/fleet-insights-aircraft-summary-model';

describe('FleetInsightPieChartComponent', () => {
  let component: FleetInsightPieChartComponent;
  let fixture: ComponentFixture<FleetInsightPieChartComponent>;

  const mockData: FleetInsightsAircraftSummaryModel[] = [
    { grouping: 'Group 1', numberOfAircraft: 100, percentageOfTotal: 25 },
    { grouping: 'Group 2', numberOfAircraft: 150, percentageOfTotal: 37.5 },
    { grouping: 'Group 3', numberOfAircraft: 75, percentageOfTotal: 18.75 },
    { grouping: 'Group 4', numberOfAircraft: 75, percentageOfTotal: 18.75 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetInsightPieChartComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetInsightPieChartComponent);
    component = fixture.componentInstance;
    component.inputData$ = of(mockData);
    component.metricType$ = of(MetricType.Percentage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize chart options', () => {
    component.ngOnInit();
    expect(component.chartOptions).toBeDefined();
  });

  it('should use correct colors from palette', () => {
    const expectedColors = [
      '#FFAD78', '#FEE19D', '#A3B2FF', '#C3EBF8', '#C6B2F7',
      '#C7E7A2', '#CB8182', '#ECA2D9', '#8CB0AA', '#E3C592'
    ];

    component.ngOnInit();

    expect(component.chartOptions.series).toBeDefined();
    const series = component.chartOptions.series as any[];
    expect(series[0].fills).toEqual(expectedColors);
  });

  it('should update chart when data changes', () => {
    const newData: FleetInsightsAircraftSummaryModel[] = [
      { grouping: 'Group A', numberOfAircraft: 200, percentageOfTotal: 50 },
      { grouping: 'Group B', numberOfAircraft: 200, percentageOfTotal: 50 }
    ];

    component.inputData$ = of(newData);
    component.ngOnInit();

    expect(component.chartOptions.data).toBeDefined();
    expect((component.chartOptions.data as any[]).length).toBe(2);
  });

  it('should display percentage values when metric type is Percentage', () => {
    component.currentMetricType = MetricType.Percentage;
    component.inputData$ = of(mockData);
    component.ngOnInit();

    const chartData = component.chartOptions.data as any[];
    expect(chartData[0].value).toBe(25);
    expect(chartData[1].value).toBe(37.5);
  });

  it('should display number values when metric type is Number', () => {
    component.inputData$ = of(mockData);
    component.metricType$ = of(MetricType.Number);
    component.ngOnInit();

    const chartData = component.chartOptions.data as any[];
    expect(chartData[0].value).toBe(100);
    expect(chartData[1].value).toBe(150);
  });

  it('should handle empty data gracefully', () => {
    component.inputData$ = of([]);
    component.ngOnInit();

    expect(component.chartOptions.data).toBeDefined();
    expect((component.chartOptions.data as any[]).length).toBe(0);
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
