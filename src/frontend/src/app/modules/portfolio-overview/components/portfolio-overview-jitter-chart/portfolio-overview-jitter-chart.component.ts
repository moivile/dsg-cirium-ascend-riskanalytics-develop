import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Group } from '../portfolio-overview-grouping/group';
import { Aircraft } from '../../../shared/models/aircraft';
import { Subscription, combineLatest, tap } from 'rxjs';
import { SortBy } from '../../models/sortBy';
import { Average, PortfolioOverviewJitterChartService } from './portfolio-overview-jitter-chart.service';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';

@Component({
  selector: 'ra-portfolio-overview-jitter-chart',
  templateUrl: './portfolio-overview-jitter-chart.component.html',
  styleUrls: ['./portfolio-overview-jitter-chart.component.scss'],
  providers: [PortfolioOverviewJitterChartService]
})
export class PortfolioOverviewJitterChartComponent implements OnInit, OnDestroy {
  @Input() jitterBy!: string;
  @Input() xAxisTitle!: string;
  @Input() tooltipLabel!: string;
  @Input() isModal = false;
  @Input() selectedAverage: Average | undefined = Average.Mean;

  @Output() averageChanged = new EventEmitter();

  jitterChartOptions = {};
  jitterChartDataSets!: any[];
  displayModal = false;
  modalTitle!: string;
  filteredPortfolioAircraft!: Aircraft[];
  groupBy!: Group;
  chartHeight!: number;
  tooltipText = `Each point on the chart is an individual aircraft. Jitter has been added to the points so they can be more easily seen.`;

  private sharedDataSubscription!: Subscription;
  private sortBy!: SortBy;
  private portfolioAircraft!: Aircraft[];

  constructor(private readonly portfolioOverviewJitterChartService: PortfolioOverviewJitterChartService,
    private readonly portfolioOverviewStore: PortfolioOverviewStore) {

  }

  ngOnInit(): void {
    this.sharedDataSubscription = combineLatest(
      [
        this.portfolioOverviewStore.filteredPortfolioAircraft$,
        this.portfolioOverviewStore.groupBy$,
        this.portfolioOverviewStore.getSortOptionByKey(this.jitterBy),
      ]).pipe(
        tap(([portfolioAircraft, groupBy, sortBy]) => {
          this.groupBy = groupBy;
          if (sortBy) {
            this.sortBy = sortBy;
            this.portfolioAircraft = portfolioAircraft;
            this.updateChartDetails(portfolioAircraft, this.groupBy, sortBy);
          }
        }
        )).subscribe();
  }

  ngOnDestroy(): void {
    this.sharedDataSubscription?.unsubscribe();
  }

  toggleSelectedAverage(selectedAverage: Average): void {
    this.selectedAverage = selectedAverage;
    this.updateChartDetails(this.portfolioAircraft, this.groupBy, this.sortBy);
    if (this.isModal) {
      this.averageChanged.emit(this.selectedAverage);
    }
  }

  get Average(): typeof Average {
    return Average;
  }

  removeTooltip(): void {
    const tooltip = PortfolioOverviewJitterChartComponent.getToolTip();
    if (tooltip) {
      tooltip.remove();
    }
  }

  showModal(): void {
    this.modalTitle = `Age Chart`;
    this.displayModal = true;
  }

  recheckSelectedAverageRadioButton(): void {
    const tempSelectedAverage = this.selectedAverage;
    this.selectedAverage = undefined;
    setTimeout(() => {
      this.selectedAverage = tempSelectedAverage;
    }, 0);
  }
  private updateChartDetails(filteredPortfolioAircraft: Aircraft[], groupBy: Group, sortBy: SortBy): void {
    const chartData = this.portfolioOverviewJitterChartService.buildChartData(filteredPortfolioAircraft, groupBy, this.selectedAverage, this.jitterBy, sortBy);

    this.jitterChartDataSets = [
      {
        label: 'AverageDataset',
        data: chartData.averageDataSets,
        pointRadius: 12,
        pointBorderWidth: 2,
        pointRotation: 90,
        pointStyle: 'line',
        pointBackgroundColor: 'black',
        pointBorderColor: 'black',
        pointHoverBorderColor: 'grey',
        pointHoverBackgroundColor: 'black',
        pointHoverRadius: 20,
        pointHoverBorderWidth: 6
      },
      {
        label: 'JitterDataset',
        data: chartData.jitterDataSets,
        pointBackgroundColor: 'rgb(0, 133, 108, 0.3)',
        pointBorderColor: 'rgb(0, 133, 108, 0.2)',
        pointHoverBackgroundColor: 'rgb(0, 133, 108, 0.3)',
        pointHoverBorderColor: 'rgb(0, 133, 108, 0.2)'
      }
    ];
    const aircraft = chartData.jitterDataSets.map((a: any) => a.aircraft);
    const labels = chartData.labels;

    this.setChartOptions(aircraft, labels);

    const chartArea = document.getElementById('jitterChartArea');
    if (chartArea) {

      let chartHeight = 95;
      chartHeight = chartHeight + labels.length * 28;
      this.chartHeight = chartHeight;
    }
  }

  private setChartOptions(aircraft: Aircraft[], labels: string[]): void {
    const label = this.tooltipLabel;
    const selectedAverage = this.selectedAverage;
    this.jitterChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      scales: {
        y: {
          ticks: {
            color: 'black',
            font: {
              family: 'Montserrat'
            },
            autoSkip: false,
            stepSize: 1,
            min: 0,
            max: labels.length + 1,
            callback: (value: any) => {
              if (labels[value - 1]) {
                if (labels[value - 1].length > 10) {
                  return labels[value - 1].substr(0, 10) + '...';
                }
                else {
                  return labels[value - 1];
                }
              }
              return '';
            }
          },
          grid: {
            offset: true,
          }
        },
        x: {
          position: 'top',
          grid: {
            display: false,
            drawBorder: false,
            offset: true
          },
          ticks: {
            color: 'black',
            font: {
              family: 'Montserrat'
            },
            stepSize: 6,
            padding: 0
          }
        },
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: this.xAxisTitle,
          font: {
            weight: 'bold',
            size: 14,
            family: 'Montserrat',
          },
          color: 'black'
        },
        tooltip: {
          enabled: false,
          displayColors: true,
          mode: 'nearest',
          intersect: true,
          itemSort: (a: any, b: any) => b.formattedValue - a.formattedValue,
          external(tooltipModel: any): void {
            const tooltip = PortfolioOverviewJitterChartComponent.buildToolTip(tooltipModel, aircraft, label, labels, selectedAverage);
            if (tooltip) {
              const position = tooltipModel.chart.canvas.getBoundingClientRect();
              tooltip.style.opacity = '1';
              tooltip.style.left = `${position.left + window.scrollX + tooltipModel.tooltip.caretX + 15}px`;
              tooltip.style.top = `${position.top + window.scrollY + tooltipModel.tooltip.caretY + 15}px`;
            }
          }
        }
      }
    };
  }

  private static getToolTip(): HTMLElement | null {
    return document.getElementById('jitter-tooltip');
  }

  // needs to be static to work with charts.js
  private static buildToolTip(tooltipModel: any, aircraft: Aircraft[], label: string, labels: string[], selectedAverage: Average | undefined): HTMLElement {
    let tooltip = this.getToolTip();
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'jitter-tooltip';
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
    }

    if (tooltipModel.tooltip.opacity === 0) {
      tooltip.style.opacity = '0';
      return tooltip;
    }

    if (tooltipModel.tooltip.body) {
      let innerHtml = '<thead>';
      tooltipModel.tooltip.dataPoints.forEach((dataPoint: any) => {
        if (dataPoint.datasetIndex === 1) {
          innerHtml += `<tr><th colspan="3" class="tooltip-title"> ${dataPoint.raw.x} ${label} </th></tr>`;
          innerHtml += '</thead><tbody>';
          const toolTipAircraft = aircraft[dataPoint.dataIndex];
          innerHtml += `<tr><td> ${toolTipAircraft.status} </td></tr>`;
          innerHtml += `<tr><td> ${toolTipAircraft.aircraftRegistrationNumber} </td></tr>`;
          innerHtml += `<tr><td> ${toolTipAircraft.aircraftSeries} </td></tr>`;
          innerHtml += '</tbody>';
        }
        else {
          const yAxisLabel = labels[dataPoint.dataIndex];
          innerHtml += `<tr><th colspan="3" class="tooltip-title"> ${yAxisLabel}</th></tr>`;
          innerHtml += '</thead><tbody>';
          if (selectedAverage === Average.Mean) {
            innerHtml += `<tr><td> Mean Age: ${dataPoint.raw.x} years</td></tr>`;
            innerHtml += '</tbody>';
          }
          else {
            innerHtml += `<tr><td> Median Age: ${dataPoint.raw.x} years</td></tr>`;
            innerHtml += '</tbody>';
          }
        }
      });
      if (tooltip.firstElementChild) {
        tooltip.firstElementChild.innerHTML = innerHtml;
      }
      return tooltip;
    }
    return tooltip;
  }

}

