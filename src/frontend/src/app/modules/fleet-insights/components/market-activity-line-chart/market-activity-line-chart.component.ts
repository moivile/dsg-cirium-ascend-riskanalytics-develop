import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { ChartDataset, ChartOptions, Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { takeUntil, tap, switchMap } from 'rxjs/operators';
import { FleetInsightsChartInputData } from '../../models/fleet-insights-chart-input-data';
import { MetricType } from '../../models/metric-type.enum';
import { MarketActivityTrendsModel } from '../../models/market-activity-trends-model';

// Register Chart.js components (scales, controllers, elements, plugins)
Chart.register(...registerables);

@Component({
  selector: 'ra-market-activity-line-chart',
  templateUrl: './market-activity-line-chart.component.html',
  styleUrls: ['./market-activity-line-chart.component.scss'],
  standalone: false
})
export class MarketActivityLineChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() inputData$: Observable<MarketActivityTrendsModel[]> = new Observable<MarketActivityTrendsModel[]>();
  @Input() isModal = false;
  @Input() loading = false;
  @Input() metricType$: Observable<MetricType> = new Observable<MetricType>();

  @ViewChild('chartDirective') chart?: BaseChartDirective;
  @ViewChild('chartContainer') chartContainer?: ElementRef;

  lineChartOptions: ChartOptions<'line'> = {};
  lineChartLabels: string[] = [];
  lineChartDataSets: ChartDataset<'line'>[] = [];
  chartHeight = 500;
  currentMetricType: MetricType = MetricType.Number;
  tooManyGroupings = false;
  private readonly maxGroupings = 10;
  private readonly legendBoxWidth = 12;
  private readonly legendPadding = 20;

  private readonly chartUpdateTimeout = 0;
  private readonly quarterlyPixelsPerLabel = 70;
  private readonly yearlyPixelsPerLabel = 50;
  private readonly monthlyPixelsPerLabel = 90;
  private readonly minTickCount = 4;
  private readonly defaultOptimalTickCount = 12;

  private readonly colours = ['#FFAD78', '#FEE19D', '#A3B2FF', '#C3EBF8', '#C6B2F7', '#C7E7A2', '#CB8182', '#ECA2D9', '#8CB0AA', '#E3C592'];
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    combineLatest([this.inputData$, this.metricType$])
      .pipe(
        takeUntil(this.destroy$),
        tap(([, metricType]) => {
          this.currentMetricType = metricType;
        }),
        switchMap(([inputData, metricType]) => {
          const uniqueGroupings = new Set(inputData.map((item) => item.grouping));
          const totalUniqueGroupings = uniqueGroupings.size;

          const chartData = this.transformDataToChartData(inputData, metricType);
          return of({ chartData, totalUniqueGroupings });
        }),
        tap(({ chartData, totalUniqueGroupings }) => {
          this.tooManyGroupings = totalUniqueGroupings > this.maxGroupings;

          if (this.tooManyGroupings) {
            this.lineChartDataSets = [];
            this.lineChartLabels = [];
          } else {
            this.lineChartDataSets = this.getDataSets(chartData.chartCounts, chartData.legendItemLabels);
            this.lineChartLabels = chartData.labels;
          }

          this.setChartOptions();

          setTimeout(() => {
            this.updateXAxisConfiguration();
            this.updateChart();
          }, 0);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateXAxisConfiguration();
    this.updateChart();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateXAxisConfiguration();
      this.updateChart();
    }, this.chartUpdateTimeout);
  }

  public getDataSets(chartCounts: number[][], legendItemLabels: string[]): ChartDataset<'line'>[] {
    const dataSets: ChartDataset<'line'>[] = [];

    const isPercentage = this.currentMetricType === MetricType.Percentage;

    if (isPercentage) {
      const lastValues = chartCounts.map((arr) => arr[arr.length - 1] || 0);

      const sortedIndices = lastValues
        .map((val, idx) => ({ val, idx }))
        .sort((a, b) => b.val - a.val)
        .map((obj) => obj.idx);
      chartCounts = sortedIndices.map((i) => chartCounts[i]);
      legendItemLabels = sortedIndices.map((i) => legendItemLabels[i]);
    }

    chartCounts.forEach((chartCount: number[], index: number) => {
      const legendLabel = legendItemLabels[index];
      const colour = this.colours[index % this.colours.length];

      const chartItemData: ChartDataset<'line'> = {
        data: chartCount,
        label: legendLabel,
        backgroundColor: colour,
        borderColor: colour,
        pointBackgroundColor: colour,
        pointBorderColor: colour,
        pointHoverBackgroundColor: colour,
        pointHoverBorderColor: colour,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: isPercentage,
        spanGaps: true,
        stepped: false
      };
      dataSets.push(chartItemData);
    });

    if (isPercentage) {
      dataSets.reverse();
    }

    return dataSets;
  }

  private transformDataToChartData(inputData: MarketActivityTrendsModel[], metricType: MetricType): FleetInsightsChartInputData {
    if (!inputData || inputData.length === 0) {
      return {
        labels: [],
        chartCounts: [],
        legendItemLabels: []
      };
    }
    const chartDataMap = this.createChartDataMap(inputData, metricType);

    const sortedPeriods = this.getSortedPeriods(chartDataMap);

    const topGroupings = this.getTopGroupingsByTotal(chartDataMap);

    const chartCounts = this.buildChartCountsForGroupings(chartDataMap, sortedPeriods, topGroupings);

    return {
      labels: sortedPeriods,
      chartCounts,
      legendItemLabels: topGroupings
    };
  }

  private createChartDataMap(inputData: MarketActivityTrendsModel[], metricType: MetricType): Map<string, Map<string, number>> {
    const chartDataMap = new Map<string, Map<string, number>>();

    inputData.forEach((item) => {
      if (!chartDataMap.has(item.period)) {
        chartDataMap.set(item.period, new Map());
      }

      const value = metricType === MetricType.Number ? item.numberOfEvents : item.percentageOfTotal || 0;
      const periodMap = chartDataMap.get(item.period);
      if (periodMap) {
        periodMap.set(item.grouping, value);
      }
    });

    return chartDataMap;
  }

  private getSortedPeriods(chartDataMap: Map<string, Map<string, number>>): string[] {
    return Array.from(chartDataMap.keys()).sort((a, b) => {
      const parseDate = (period: string): Date => {
        const quarterMatch = period.match(/^Q(\d+)\s+(\d+)$/);
        if (quarterMatch) {
          const quarter = parseInt(quarterMatch[1]);
          const year = parseInt(quarterMatch[2]);
          return new Date(year, (quarter - 1) * 3, 1);
        }

        const monthMatch = period.match(/^(\w{3})\s+(\d+)$/);
        if (monthMatch) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = monthNames.indexOf(monthMatch[1]);
          const year = parseInt(monthMatch[2]);
          return new Date(year, monthIndex, 1);
        }

        const yearMatch = period.match(/^(\d+)$/);
        if (yearMatch) {
          return new Date(parseInt(yearMatch[1]), 0, 1);
        }

        return new Date(period);
      };

      const dateA = parseDate(a);
      const dateB = parseDate(b);
      return dateA.getTime() - dateB.getTime();
    });
  }

  private getTopGroupingsByTotal(chartDataMap: Map<string, Map<string, number>>): string[] {
    const groupingTotals = new Map<string, number>();

    chartDataMap.forEach((periodData) => {
      periodData.forEach((value, grouping) => {
        const currentTotal = groupingTotals.get(grouping) || 0;
        groupingTotals.set(grouping, currentTotal + value);
      });
    });

    return Array.from(groupingTotals.entries())
      .sort(([, totalA], [, totalB]) => totalB - totalA)
      .slice(0, this.maxGroupings)
      .map(([grouping]) => grouping);
  }

  private buildChartCountsForGroupings(chartDataMap: Map<string, Map<string, number>>, periods: string[], groupings: string[]): number[][] {
    return groupings.map((grouping) => periods.map((period) => chartDataMap.get(period)?.get(grouping) || 0));
  }

  private getLabelType(label: string): 'quarterly' | 'yearly' | 'monthly' {
    if (label.includes('Q')) {
      return 'quarterly';
    } else if (label.length === 4 && !isNaN(parseInt(label))) {
      return 'yearly';
    } else {
      return 'monthly';
    }
  }

  private updateXAxisConfiguration(): void {
    const firstLabel = this.lineChartLabels[0] || '';
    const labelCount = this.lineChartLabels.length;

    const maxTicksLimit = this.calculateOptimalTickCount();

    if (this.lineChartOptions.scales && 'x' in this.lineChartOptions.scales) {
      const xAxis = this.lineChartOptions.scales['x'];
      if (xAxis) {
        xAxis.ticks = {
          color: 'black',
          font: {
            family: 'Montserrat'
          }
        };

        this.configureXAxisTicks(xAxis, firstLabel, labelCount, maxTicksLimit);
      }
    }
  }

  private configureXAxisTicks(
    xAxis: { ticks?: Record<string, unknown> },
    firstLabel: string,
    labelCount: number,
    maxTicksLimit: number
  ): void {
    const shouldAutoSkip = labelCount > maxTicksLimit;

    const labelType = this.getLabelType(firstLabel);
    let maxRotation: number;
    let fontSize: number;

    switch (labelType) {
      case 'quarterly':
        maxRotation = 0;
        fontSize = 11;
        break;
      case 'yearly':
        maxRotation = 0;
        fontSize = 12;
        break;
      case 'monthly':
      default:
        maxRotation = 45;
        fontSize = 10;
        break;
    }

    xAxis.ticks = {
      ...xAxis.ticks,
      maxRotation,
      autoSkip: shouldAutoSkip,
      maxTicksLimit: shouldAutoSkip ? maxTicksLimit : labelCount,
      font: {
        ...((xAxis.ticks?.['font'] as Record<string, unknown>) || {}),
        size: fontSize
      }
    };
  }

  private calculateOptimalTickCount(): number {
    if (!this.chartContainer) {
      return this.defaultOptimalTickCount;
    }

    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const firstLabel = this.lineChartLabels[0] || '';
    const labelType = this.getLabelType(firstLabel);

    let pixelsPerLabel: number;
    switch (labelType) {
      case 'quarterly':
        pixelsPerLabel = this.quarterlyPixelsPerLabel;
        break;
      case 'yearly':
        pixelsPerLabel = this.yearlyPixelsPerLabel;
        break;
      case 'monthly':
      default:
        pixelsPerLabel = this.monthlyPixelsPerLabel;
        break;
    }

    const optimalCount = Math.floor(containerWidth / pixelsPerLabel);
    const adjustedCount = Math.max(this.minTickCount, Math.min(optimalCount, this.lineChartLabels.length));

    if (this.lineChartLabels.length <= this.minTickCount) {
      return this.lineChartLabels.length;
    }

    return adjustedCount;
  }

  private updateChart(): void {
    if (this.chart?.chart) {
      this.chart.chart.update();
    }
  }

  private setChartOptions(): void {
    const isPercentage = this.currentMetricType === MetricType.Percentage;
    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: '#f0f0f0'
          },
          ticks: {
            color: 'black',
            font: { family: 'Montserrat' }
          }
        },
        y: {
          display: true,
          title: { display: false },
          grid: {
            display: true,
            color: '#f0f0f0'
          },
          beginAtZero: true,
          // If percentage mode, stack values and add '%' to tick labels
          stacked: isPercentage,
          min: isPercentage ? 0 : undefined,
          max: isPercentage ? 100 : undefined,
          ticks: {
            color: 'black',
            font: { family: 'Montserrat' },
            callback: (value) => `${value}${isPercentage ? '%' : ''}`
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: this.legendPadding,
            boxWidth: this.legendBoxWidth,
            font: { family: 'Montserrat' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(88, 88, 88, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'transparent',
          borderWidth: 0,
          cornerRadius: 3,
          displayColors: true,
          titleFont: {
            family: 'Montserrat',
            size: 12,
            weight: 300
          },
          bodyFont: {
            family: 'Montserrat',
            size: 12,
            weight: 300
          },
          padding: 4,
          callbacks: {
            title: (context) => context[0].label,
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y ?? 0;
              // If in percentage mode, format value to one decimal place and append '%'
              return isPercentage ? `${label}: ${Number(value).toFixed(1)}%` : `${label}: ${value.toLocaleString()}`;
            }
          },
          itemSort: (a, b) => (b.parsed?.y ?? 0) - (a.parsed?.y ?? 0)
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      elements: {
        line: { tension: 0.4 },
        point: { radius: 0, hoverRadius: 4 }
      }
    };
  }
}
