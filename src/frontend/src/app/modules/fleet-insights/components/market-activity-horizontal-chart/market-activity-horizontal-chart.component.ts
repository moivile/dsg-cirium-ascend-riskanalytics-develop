import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartDataset } from 'chart.js';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { takeUntil, tap, switchMap } from 'rxjs/operators';
import { FleetInsightsChartInputData } from '../../models/fleet-insights-chart-input-data';
import { MetricType } from '../../models/metric-type.enum';
import { MarketActivitySummaryModel } from '../../models/market-activity-summary-model';

@Component({
    selector: 'ra-market-activity-horizontal-chart',
    templateUrl: './market-activity-horizontal-chart.component.html',
    styleUrls: ['./market-activity-horizontal-chart.component.scss'],
    standalone: false
})
export class MarketActivityHorizontalChartComponent implements OnInit, OnDestroy {
  @Input() currentMetricType: MetricType = MetricType.Number;
  @Input() inputData$: Observable<MarketActivitySummaryModel[]> = new Observable<MarketActivitySummaryModel[]>();
  @Input() chartname!: string;
  @Input() isModal = false;
  @Input() loading = false;
  @Input() chartData$: BehaviorSubject<FleetInsightsChartInputData> = new BehaviorSubject<FleetInsightsChartInputData>({
    labels: [],
    chartCounts: [],
    legendItemLabels: []
  });
  @Input() metricType$: Observable<MetricType> = new Observable<MetricType>();
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChild('chartContainer') chartContainer: ElementRef | undefined;
  barChartOptions = {};
  barChartLabels: string[] = [];
  barChartDataSets: ChartDataset<'bar'>[] = [];
  chartHeight!: number;
  showDownloadChart = true;
  modalTitle!: string;

  private readonly computedStyle = getComputedStyle(document.documentElement);
  private readonly borderColour = this.computedStyle.getPropertyValue('--airframe-color-chart-primary-border');
  private readonly colours = ['#00A485'];
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    combineLatest([this.inputData$, this.metricType$])
      .pipe(
        takeUntil(this.destroy$),
        tap(([inputData, metricType]) => {
          this.currentMetricType = metricType;
        }),
        switchMap(([inputData, metricType]) => {
          return of(this.transformDataToChartData(inputData, metricType));
        }),
        tap((chartData: FleetInsightsChartInputData) => {
          this.chartData$.next(chartData);
        })
      )
      .subscribe();

    this.chartData$
      .pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          this.barChartDataSets = this.getDataSets(data.chartCounts, data.labels);
          this.barChartLabels = data.legendItemLabels;
          this.setChartOptions();
          this.initChartHeight();
        })
      )
      .subscribe();

    this.setChartOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeTooltip(): void {
    const tooltip = MarketActivityHorizontalChartComponent.getToolTip();
    if (tooltip) {
      tooltip.remove();
    }
  }
  public getDataSets(chartCounts: number[][], legendItemLabels: string[]): ChartDataset<'bar'>[] {
    const dataSets: ChartDataset<'bar'>[] = [];
    chartCounts.forEach((chartCount: number[], index: number) => {
      const legendLabel = legendItemLabels[index];
      const hoverColour = this.colours[0];

      const chartItemData: ChartDataset<'bar'> = {
        data: chartCount,
        label: legendLabel,
        backgroundColor: hoverColour,
        hoverBackgroundColor: hoverColour,
        borderWidth: 1,
        hoverBorderWidth: 2,
        borderColor: this.borderColour,
        hoverBorderColor: hoverColour
      };
      dataSets.push(chartItemData);
    });
    return dataSets;
  }

  public static getTooltipBodyContentItems(tooltipBody: any[]): { text: string; value: number }[] {
    const tooltipBodyContents = tooltipBody.map((body) => {
      const [text, valueStr] = body[0].split(': ');
      return {
        text,
        value: parseInt(valueStr.replace(/,/g, ''), 10)
      };
    });

    const nonZeroItems = tooltipBodyContents.filter((item) => item.value !== 0);
    if (nonZeroItems.length > 1) {
      const total = tooltipBodyContents.reduce((sum, item) => sum + item.value, 0);
      tooltipBodyContents.push({ text: 'Total', value: total });
    }
    return tooltipBodyContents;
  }
  private transformDataToChartData(inputData: MarketActivitySummaryModel[], metricType: MetricType): FleetInsightsChartInputData {
    const getValue = (data: MarketActivitySummaryModel): number =>
      metricType === MetricType.Number ? data.numberOfEvents : data.percentageOfTotal || 0;

    const sortedData = [...inputData].sort((a, b) => getValue(b) - getValue(a));

    return {
      labels: sortedData.map((data) => data.grouping),
      chartCounts: [sortedData.map(getValue)],
      legendItemLabels: sortedData.map((data) => data.grouping)
    };
  }

  private initChartHeight(): void {
    if (this.barChartDataSets.length === 0) {
      this.chartHeight = 100;
      return;
    }
    let chartHeight = 64;
    chartHeight = chartHeight + this.barChartLabels.length * 27;
    this.chartHeight = chartHeight;
  }

  private setChartOptions(): void {
    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      minBarLength: 1,
      scales: {
        x: {
          position: 'top',
          stacked: false,
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: 'black',
            font: {
              family: 'Montserrat'
            },
            padding: 0,
            callback: (value: any) => {
              if (value % 1 === 0) {
                return this.currentMetricType === 'percentage' ? `${value}%` : value;
              }
            }
          }
        },
        y: {
          stacked: false,
          ticks: {
            callback(value: string) {
              const newthis = this as any;
              if (newthis.getLabelForValue(value)?.length > 10) {
                return `${newthis.getLabelForValue(value).substr(0, 10)}...`;
              } else {
                return `${newthis.getLabelForValue(value)}`;
              }
            },
            color: 'black',
            font: {
              family: 'Montserrat'
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false,
          mode: 'nearest',
          itemSort: (a: any, b: any) => b.formattedValue - a.formattedValue,
          external: (tooltipModel: any): void => {
            const tooltip = MarketActivityHorizontalChartComponent.buildToolTip(tooltipModel, this.currentMetricType);
            if (tooltip) {
              const position = tooltipModel.chart.canvas.getBoundingClientRect();
              tooltip.style.opacity = '1';
              const leftPosition = position.left + window.scrollX + tooltipModel.tooltip.caretX;
              if (leftPosition > 1000) {
                tooltip.style.left = '900px';
              } else {
                tooltip.style.left = `${leftPosition}px`;
              }
              tooltip.style.top = `${position.top + window.scrollY + tooltipModel.tooltip.caretY}px`;
              tooltip.style.padding = `${tooltipModel.tooltip.yPadding}px ${tooltipModel.tooltip.xPadding}px`;
            }
          }
        }
      }
    };
  }

  private static getToolTip(): HTMLElement | null {
    return document.getElementById('stacked-bar-tooltip');
  }

  private static createToolTip(): HTMLElement {
    const tooltip = document.createElement('div');
    tooltip.id = 'stacked-bar-tooltip';
    tooltip.innerHTML = '<table></table>';
    tooltip.onmouseover = () => {
      if (tooltip) {
        tooltip.style.display = 'block';
      }
    };
    tooltip.onmouseout = () => {
      if (tooltip) {
        tooltip.style.display = 'none';
      }
    };
    document.body.appendChild(tooltip);
    return tooltip;
  }

  private static createTooltipTableStructure(title: any): string {
    let innerHtml = '<thead>';
    title.forEach((title: any) => {
      innerHtml += `<tr><th colspan='3' class='tooltip-title' > ${title} </th></tr>`;
    });
    innerHtml += '</thead><tbody>';
    return innerHtml;
  }

  private static createTooltipContent(tooltipModel: any, innerHtml: string, metricType: MetricType): string {
    if (tooltipModel.tooltip.dataPoints) {
      tooltipModel.tooltip.dataPoints.forEach((dataPoint: any) => {
        if (dataPoint.raw !== 0) {
          const style = `background: ${dataPoint.dataset.backgroundColor}; border-color: ${dataPoint.dataset.borderColor}; width: 16px`;
          const value = metricType === MetricType.Percentage ? `${Number(dataPoint.raw).toFixed(1)}%` : dataPoint.raw;
          innerHtml += `<tr>
            <td style='${style}'></td>
            <td>${dataPoint.label}</td>
            <td class='tooltip-body-value'>${value}</td>
          </tr>`;
        }
      });
    }
    innerHtml += '</tbody></table>';
    return innerHtml;
  }

  private static buildToolTip(tooltipModel: any, metricType: MetricType): HTMLElement {
    let tooltip = this.getToolTip();
    if (!tooltip) {
      tooltip = this.createToolTip();
    }

    if (tooltipModel.tooltip.opacity === 0) {
      tooltip.style.opacity = '0';
      return tooltip;
    }

    if (tooltipModel.tooltip.body) {
      let innerHtml = this.createTooltipTableStructure(tooltipModel.tooltip.title);
      innerHtml = this.createTooltipContent(tooltipModel, innerHtml, metricType);

      if (tooltip.firstElementChild) {
        tooltip.firstElementChild.innerHTML = innerHtml;
      }
      return tooltip;
    }
    return tooltip;
  }
}
