import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AgChartOptions } from 'ag-charts-community';
import { FleetInsightsAircraftSummaryModel } from '../../models/fleet-insights-aircraft-summary-model';
import { MetricType } from '../../models/metric-type.enum';

@Component({
  selector: 'ra-fleet-insight-pie-chart',
  templateUrl: './fleet-insight-pie-chart.component.html',
  styleUrls: ['./fleet-insight-pie-chart.component.scss'],
  standalone: false
})
export class FleetInsightPieChartComponent<T extends Record<string, any> = any> implements OnInit, OnDestroy {
  @Input() inputData$: Observable<T[]> = new Observable<T[]>();
  @Input() metricType$: Observable<MetricType> = new Observable<MetricType>();
  @Input() isModal = false;
  @Input() categoryKey = 'grouping';
  @Input() valueKey = 'numberOfAircraft';
  @Input() percentageKey = 'percentageOfTotal';

  chartOptions: AgChartOptions = {
    data: [],
    series: [
      {
        type: 'pie',
        angleKey: 'value',
        calloutLabelKey: 'category'
      }
    ]
  };
  currentMetricType: MetricType = MetricType.Number;
  private readonly destroy$ = new Subject<void>();

  private readonly colours = ['#FFAD78', '#FEE19D', '#A3B2FF', '#C3EBF8', '#C6B2F7', '#C7E7A2', '#CB8182', '#ECA2D9', '#8CB0AA', '#E3C592'];

  ngOnInit(): void {
    combineLatest([this.inputData$, this.metricType$])
      .pipe(
        takeUntil(this.destroy$),
        tap(([data, metricType]) => {
          this.currentMetricType = metricType;
          this.updateChart(data);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateChart(data: T[]): void {
    if (!data || data.length === 0) {
      this.chartOptions = this.getEmptyChartOptions();
      return;
    }

    const isPercentage = this.currentMetricType === MetricType.Percentage;
    const chartData = data.map((item, index) => ({
      category: item[this.categoryKey],
      value: isPercentage ? Math.round(item[this.percentageKey] * 10) / 10 : item[this.valueKey],
      color: this.colours[index % this.colours.length]
    }));

    this.chartOptions = {
      data: chartData,
      series: [
        {
          type: 'pie',
          angleKey: 'value',
          legendItemKey: 'category',
          calloutLabelKey: 'category',
          sectorLabelKey: 'value',
          fills: this.colours,
          strokes: this.colours,
          calloutLabel: {
            enabled: true,
            fontSize: 12,
            color: '#333333',
            formatter: (params: any) => {
              return params.value || '';
            }
          },
          sectorLabel: {
            enabled: false
          },
          tooltip: {
            enabled: true,
            renderer: (params: any) => {
              const category = params.datum.category;
              const value = params.datum.value;
              const color = params.datum.color || params.fill;
              return (
                '<div class="ag-chart-tooltip" style="padding: 10px;">' +
                '<div class="ag-chart-tooltip-title" style="display: flex; align-items: center; margin-bottom: 8px;">' +
                '<span class="ag-chart-tooltip-marker" style="background-color: ' + color + '; width: 10px; height: 10px; display: inline-block; margin-right: 8px; border-radius: 2px;"></span>' +
                '<span>' + category + '</span>' +
                '</div>' +
                '<div class="ag-chart-tooltip-content" style="margin-left: 18px;">' +
                value.toFixed(1) + '%' +
                '</div>' +
                '</div>'
              );
            }
          },
          highlightStyle: {
            item: {
              fillOpacity: 0.8,
              stroke: '#ffffff',
              strokeWidth: 2
            }
          }
        } as any
      ],
      legend: {
        enabled: true,
        toggleSeries: false,
        position: 'bottom',
        maxHeight: 120,
        spacing: 20,
        item: {
          marker: {
            shape: 'circle',
            size: 10
          },
          label: {
            fontSize: 11,
            color: '#333333',
            maxLength: 30
          },
          paddingY: 4,
          paddingX: 10
        }
      },
      background: {
        fill: 'transparent'
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    };
  }

  private getEmptyChartOptions(): AgChartOptions {
    return {
      data: [],
      series: [
        {
          type: 'pie',
          angleKey: 'value',
          calloutLabelKey: 'category'
        }
      ]
    };
  }
}
