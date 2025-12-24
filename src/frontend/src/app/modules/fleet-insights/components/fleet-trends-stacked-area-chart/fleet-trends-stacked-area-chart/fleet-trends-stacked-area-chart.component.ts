import { Component, ElementRef, Input, ViewChild, OnDestroy, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Observable, Subject, takeUntil, distinctUntilChanged } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, ChartTypeRegistry, TooltipItem, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FleetInsightsTrendsChartDataset, FleetInsightsTrendsRawData } from '../../../models/fleet-insights-trends-chart-dataset.model';

// Register Chart.js components (scales, controllers, elements, plugins)
Chart.register(...registerables);

@Component({
    selector: 'ra-fleet-trends-stacked-area-chart',
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './fleet-trends-stacked-area-chart.component.html',
    styleUrl: './fleet-trends-stacked-area-chart.component.scss'
})
export class FleetTrendsStackedAreaChartComponent implements OnDestroy, OnInit, AfterViewInit {
  private readonly chartDefaultHeight = 500;
  private readonly chartUpdateTimeout = 0;
  private readonly quarterlyPixelsPerLabel = 70;
  private readonly yearlyPixelsPerLabel = 50;
  private readonly monthlyPixelsPerLabel = 90;
  private readonly minTickCount = 4;
  private readonly defaultOptimalTickCount = 12;
  private readonly yAxisMin = 0;
  private yAxisMax = 100;
  private readonly legendBoxWidth = 12;
  private readonly legendPadding = 20;
  private readonly pointRadius = 0;
  private readonly pointHoverRadius = 4;
  private readonly lineTension = 0.4;
  private borderWidth = 2;
  private readonly titleFontSize = 13;
  private readonly colorPalette = [
    '#FFAD78',
    '#F8D481',
    '#A3B2FF',
    '#9DDAEE',
    '#C6B2F7',
    '#AED583',
    '#CB8182',
    '#ECA2D9',
    '#8CB0AA',
    '#D1AF76'
  ];
  private readonly destroy$ = new Subject<void>();

  @Input() chartName = 'All Aircraft';
  @Input() isModal = false;
  @Input() loading = false;
  @Input() hasTooManySegments = false;
  @Input() chartFill!: { value: boolean };
  @Input() chartData$: Observable<FleetInsightsTrendsRawData[]> = new Observable<FleetInsightsTrendsRawData[]>();

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChild('chartContainer') chartContainer?: ElementRef;

  chartType: keyof ChartTypeRegistry = 'line';
  chartOptions: ChartOptions = {};
  chartLabels: string[] = [];
  chartDatasets: FleetInsightsTrendsChartDataset[] = [];
  chartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  chartHeight = this.chartDefaultHeight;

  @HostListener('window:resize')
  onResize(): void {
    this.updateXAxisConfiguration();
    this.updateChart();
  }

  ngOnInit(): void {
    this.setChartOptions();
    this.setupChartDataSubscription();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateXAxisConfiguration();
      this.updateChart();
    }, this.chartUpdateTimeout);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getMaxValue(values: number[]): number {
    return values.reduce((max, value) => (value > max ? value : max), -Infinity);
  }

  private setupChartDataSubscription(): void {
    if (this.chartData$) {
      this.chartData$.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((data) => {
        this.borderWidth = this.chartFill.value === false ? 3 : 2;
        this.updateChartData(data || []);
        this.setChartOptions();
      });
    }
  }

  private updateChartData(data: FleetInsightsTrendsRawData[]): void {
    if (!data || data.length === 0) {
      this.chartLabels = [];
      this.chartDatasets = [];
      (this.chartData = {
        labels: [],
        datasets: []
      }),
        this.updateChart();
      return;
    }

    const filteredData = data;

    this.chartLabels = filteredData.map((item) => item.timePoint);

    const firstItem = filteredData[0];
    let seriesKeys = Object.keys(firstItem).filter((key) => key !== 'timePoint');

    seriesKeys = this.sortSeriesBySize(filteredData, seriesKeys);
    this.chartDatasets = this.createDatasets(filteredData, seriesKeys);

    this.chartDatasets = this.chartDatasets.reverse();

    if (filteredData.length === 1) {
      const duplicateDataPoint = { ...filteredData[0] };
      filteredData.push(duplicateDataPoint);

      this.chartDatasets.forEach((dataset) => {
        dataset.fill = this.chartFill.value;
        dataset.backgroundColor = dataset.backgroundColor || `${dataset.borderColor}33`;
        dataset.data = [dataset.data[0], dataset.data[0]];
      });

      this.chartLabels = [this.chartLabels[0], ''];
    }

    this.chartData = {
      labels: this.chartLabels,
      datasets: this.chartDatasets
    };

    this.updateXAxisConfiguration();

    this.updateChart();
  }

  private sortSeriesBySize(data: FleetInsightsTrendsRawData[], seriesKeys: string[]): string[] {
    const lastTimePoint = data[data.length - 1];

    return [...seriesKeys].sort((a, b) => (Number(lastTimePoint[b]) || 0) - (Number(lastTimePoint[a]) || 0));
  }

  private createDatasets(data: FleetInsightsTrendsRawData[], seriesKeys: string[]): FleetInsightsTrendsChartDataset[] {
    return seriesKeys.map((key, index) => {
      const color = this.colorPalette[index % this.colorPalette.length];

      return {
        data: data.map((item) => Number(item[key]) || 0),
        label: key,
        fill: this.chartFill.value,
        tension: this.lineTension,
        backgroundColor: `${color}`,
        borderColor: color,
        pointBackgroundColor: color,
        borderWidth: this.borderWidth,
        pointRadius: this.pointRadius,
        pointHoverRadius: this.pointHoverRadius
      };
    });
  }

  private updateXAxisConfiguration(): void {
    const firstLabel = this.chartLabels[0] || '';
    const labelCount = this.chartLabels.length;

    const maxTicksLimit = this.calculateOptimalTickCount();

    if (this.chartOptions.scales && 'x' in this.chartOptions.scales) {
      const xAxis = this.chartOptions.scales['x'];
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
    if (firstLabel.includes('Q')) {
      xAxis.ticks = {
        ...xAxis.ticks,
        maxRotation: 0,
        autoSkip: labelCount > maxTicksLimit,
        maxTicksLimit,
        font: {
          ...((xAxis.ticks?.['font'] as Record<string, unknown>) || {}),
          size: 11
        }
      };
    } else if (firstLabel.length === 4 && !isNaN(parseInt(firstLabel))) {
      xAxis.ticks = {
        ...xAxis.ticks,
        maxRotation: 0,
        autoSkip: labelCount > maxTicksLimit,
        maxTicksLimit,
        font: {
          ...((xAxis.ticks?.['font'] as Record<string, unknown>) || {}),
          size: 12
        }
      };
    } else {
      xAxis.ticks = {
        ...xAxis.ticks,
        maxRotation: 45,
        autoSkip: labelCount > maxTicksLimit,
        maxTicksLimit,
        font: {
          ...((xAxis.ticks?.['font'] as Record<string, unknown>) || {}),
          size: 10
        }
      };
    }
  }

  private calculateOptimalTickCount(): number {
    if (!this.chartContainer) {
      return this.defaultOptimalTickCount;
    }

    const containerWidth = this.chartContainer.nativeElement.offsetWidth;

    const firstLabel = this.chartLabels[0] || '';
    let pixelsPerLabel: number;

    if (firstLabel.includes('Q')) {
      pixelsPerLabel = this.quarterlyPixelsPerLabel;
    } else if (firstLabel.length === 4 && !isNaN(parseInt(firstLabel))) {
      pixelsPerLabel = this.yearlyPixelsPerLabel;
    } else {
      pixelsPerLabel = this.monthlyPixelsPerLabel;
    }

    const optimalCount = Math.floor(containerWidth / pixelsPerLabel);
    return Math.max(this.minTickCount, Math.min(optimalCount, this.chartLabels.length));
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.update();
    }
  }

  private calculateYmax(data: FleetInsightsTrendsChartDataset[]): number {
    if (!data || data.length === 0) {
      return this.yAxisMax;
    }
    const allValues = data.flatMap((dataset) => (Array.isArray(dataset.data) ? dataset.data : []));
    if (allValues.length === 0) {
      return this.yAxisMax;
    }

    const maxValue = this.getMaxValue(allValues);

    const baseInterval = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const interval = maxValue <= baseInterval * 5 ? baseInterval * 0.5 : baseInterval;
    const yMax = Math.ceil(maxValue / interval) * interval;
    if (yMax === maxValue) {
      return yMax + interval;
    }

    return yMax;
  }

  private setChartOptions(): void {
    this.chartFill.value === false ? (this.chartName = 'All Aircraft') : (this.chartName = 'All Aircraft (%)');
    this.yAxisMax = this.chartFill.value === false ? this.calculateYmax(this.chartDatasets) : 100;
    this.chartOptions = this.chartFill.value ? this.getAreaChartOptions() : this.getLineChartOptions();
  }

  private getLineChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: this.getXAxisOptions(),
        y: this.getYAxisOptions(false)
      },
      plugins: this.getPluginsOptions(),
      interaction: {
        mode: 'index',
        intersect: false
      }
    };
  }

  private getAreaChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: this.getXAxisOptions(),
        y: this.getYAxisOptions(true)
      },
      plugins: this.getPluginsOptions(),
      interaction: {
        mode: 'index',
        intersect: false
      }
    };
  }

  private getXAxisOptions(): Record<string, unknown> {
    return {
      grid: {
        display: true,
        color: '#f0f0f0'
      },
      ticks: {
        color: 'black',
        font: {
          family: 'Montserrat'
        }
      }
    };
  }

  private getYAxisOptions(isStacked: boolean): Record<string, unknown> {
    return {
      stacked: isStacked,
      grid: {
        display: true,
        color: '#f0f0f0'
      },
      ticks: {
        color: 'black',
        font: {
          family: 'Montserrat'
        },
        callback: (value: number | string): string => (isStacked ? `${value}%` : `${value}`)
      },
      min: this.yAxisMin,
      max: this.yAxisMax
    };
  }

  private getPluginsOptions(): Record<string, unknown> {
    return {
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        titleColor: 'white',
        titleFont: {
          family: 'Montserrat'
        },
        bodyColor: 'white',
        bodyFont: {
          family: 'Montserrat'
        },
        itemSort: (a: TooltipItem<'line'>, b: TooltipItem<'line'>): number =>
          (b.parsed?.y ?? 0) - (a.parsed?.y ?? 0),
        callbacks: {
          label: (tooltipItem: TooltipItem<'line'>): string => {
            const label = tooltipItem.dataset.label || '';
            const value = tooltipItem.parsed.y ?? 0;
            const isStacked = (tooltipItem.chart.options.scales?.['y'] as { stacked?: boolean })?.stacked ?? false;
            return isStacked ? `${label}: ${Number(value).toFixed(1)}%` : `${label}: ${value}`;
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: this.legendPadding,
          boxWidth: this.legendBoxWidth,
          font: {
            family: 'Montserrat'
          }
        }
      },
      title: {
        display: true,
        text: this.chartName,
        align: 'center',
        padding: {
          top: 10,
          bottom: 20
        },
        font: {
          size: this.titleFontSize,
          family: 'Montserrat',
          weight: 'bold'
        },
        color: '#000000'
      }
    };
  }
}
