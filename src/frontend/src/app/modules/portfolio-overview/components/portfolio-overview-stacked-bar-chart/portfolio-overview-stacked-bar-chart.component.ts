import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { combineLatest, Subscription, tap } from 'rxjs';
import { Aircraft } from '../../../shared/models/aircraft';
import { SortBy } from '../../models/sortBy';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { Group } from '../portfolio-overview-grouping/group';
import { PortfolioOverviewBarChartService } from './portfolio-overview-stacked-bar-chart.service';
import { OperatorToggleValue } from '../../models/operator-toggle-value';

@Component({
    selector: 'ra-portfolio-overview-stacked-bar-chart[countBy][xAxisTitle]',
    templateUrl: './portfolio-overview-stacked-bar-chart.component.html',
    styleUrls: ['./portfolio-overview-stacked-bar-chart.component.scss'],
    providers: [PortfolioOverviewBarChartService],
    standalone: false
})
export class PortfolioOverviewStackedBarChartComponent implements OnInit, OnDestroy {
  @Input() countBy!: string;
  @Input() xAxisTitle!: string;
  @Input() pivot!: boolean;
  @Input() isModal = false;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  barChartOptions = {};
  barChartLabels: string[] = [];
  barChartDataSets: [] = [];
  chartHeight!: number;
  legendItems: any[] = [];
  displayModal = false;
  modalTitle!: string;
  groupBy!: Group;
  sortBy!: SortBy;
  private filteredPortfolioAircraftSubscription!: Subscription;

  constructor(
    private readonly portfolioOverviewStore: PortfolioOverviewStore,
    private readonly portfolioOverviewBarChartService: PortfolioOverviewBarChartService
  ) {}

  ngOnInit(): void {
    this.filteredPortfolioAircraftSubscription = combineLatest([
      this.portfolioOverviewStore.filteredPortfolioAircraft$,
      this.portfolioOverviewStore.groupBy$,
      this.portfolioOverviewStore.getSortOptionByKey(this.countBy),
      this.portfolioOverviewStore.operatorToggleValue$
    ])
      .pipe(
        tap(([portfolio, groupBy, sortBy, selectedValue]) => {
          this.groupBy = groupBy;
          if (sortBy) {
            this.updateChartDetails(portfolio, this.groupBy, sortBy, selectedValue);
          }
        })
      )
      .subscribe();
    this.setChartOptions();
  }

  ngOnDestroy(): void {
    this.filteredPortfolioAircraftSubscription?.unsubscribe();
  }

  removeTooltip(): void {
    const tooltip = PortfolioOverviewStackedBarChartComponent.getToolTip();
    if (tooltip) {
      tooltip.remove();
    }
  }

  showModal(): void {
    this.modalTitle = `${this.countBy[0].toUpperCase()}${this.countBy.slice(1)} Chart`;
    this.displayModal = true;
  }

  public static getTooltipBodyContent(tooltipBody:any, tooltipBodyContents: any[]): any {
    tooltipBody.forEach((body: any) => {
      tooltipBodyContents.push({
        text: body[0].split(': ')[0],
        value: parseInt(body[0].split(': ')[1].replaceAll(',', ''), 10)
      });
    });
    return tooltipBodyContents;
  }

  private setChartOptions(): void {
    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          position: 'top',
          stacked: 'single',
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
            callback(value: any) {
              if (value % 1 === 0) {
                return value;
              }
            }
          }
        },
        y: {
          stacked: true,
          ticks: {
            callback(value: string) {
              const newthis = this as any;
              if (newthis.getLabelForValue(value).length > 10) {
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
        title: {
          display: true,
          text: this.xAxisTitle,
          font: {
            weight: 'bold',
            size: 14,
            family: 'Montserrat'
          },
          color: 'black'
        },
        tooltip: {
          enabled: false,
          mode: 'index',
          itemSort: (a: any, b: any) => b.formattedValue - a.formattedValue,
          external(tooltipModel: any): void {
            const tooltip = PortfolioOverviewStackedBarChartComponent.buildToolTip(tooltipModel);
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

  private updateChartDetails(
    filteredPortfolioAircraft: Aircraft[],
    groupBy: Group,
    sortBy: SortBy,
    selectedValue: OperatorToggleValue
  ): void {
    const chartData =
      this.pivot === true
        ? this.portfolioOverviewBarChartService.buildChartData(
            filteredPortfolioAircraft,
            this.countBy,
            groupBy.groupName,
            sortBy,
            selectedValue
          )
        : this.portfolioOverviewBarChartService.buildChartData(
            filteredPortfolioAircraft,
            groupBy.groupName,
            this.countBy,
            sortBy,
            selectedValue
          );

    this.legendItems = [];
    if (chartData.dataSets.length <= 6) {
      chartData.dataSets.forEach((dataset: any) => {
        this.legendItems.push({
          label: dataset.label,
          colour: dataset.backgroundColor
        });
      });
    }

    this.barChartLabels = chartData.labels;
    this.barChartDataSets = chartData.dataSets;

    if (chartData.dataSets.length === 0) {
      this.chartHeight = 100;
      return;
    }

    let chartHeight = 64;
    chartHeight = chartHeight + this.barChartLabels.length * 27;
    this.chartHeight = chartHeight;
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

  private static createTooltipTableStucture(title: any): string {
    let innerHtml = '<thead>';
    title.forEach((title: any) => {
      innerHtml += `<tr><th colspan='3' class='tooltip-title' > ${title} </th></tr>`;
    });
    innerHtml += '</thead><tbody>';
    return innerHtml;
  }

  private static createTooltipContent(tooltipBodyContents: any[], tooltipModel: any, innerHtml: string): string {
    tooltipBodyContents.forEach((body, i) => {
      let style: string;
      if (tooltipModel.tooltip.dataPoints.length <= 6) {
        const colors = tooltipModel.tooltip.labelColors[i];
        style = `background: ${colors.backgroundColor}; border-color: ${colors.borderColor}; width: 16px`;
        if (body.value !== 0) {
          innerHtml += `<tr><td style=' ${style}'></td><td> ${body.text}</td> <td class='tooltip-body-value'> ${body.value}</td></tr>`;
        }
      }
    });
    return innerHtml;
  }

  // needs to be static to work with charts.js
  private static buildToolTip(tooltipModel: any): HTMLElement {
    let tooltip = this.getToolTip();
    if (!tooltip) {
      tooltip = this.createToolTip();
    }

    if (tooltipModel.tooltip.opacity === 0) {
      tooltip.style.opacity = '0';
      return tooltip;
    }

    if (tooltipModel.tooltip.body) {
      const tooltipBody = tooltipModel.tooltip.body.map((bodyItem: any) => {
        return bodyItem.lines;
      });
      let tooltipBodyContents: any[] = [];
      tooltipBodyContents = this.getTooltipBodyContent(tooltipBody,tooltipBodyContents);
      let innerHtml = this.createTooltipTableStucture(tooltipModel.tooltip.title);
      innerHtml = this.createTooltipContent(tooltipBodyContents, tooltipModel, innerHtml);

      if (tooltip.firstElementChild) {
        tooltip.firstElementChild.innerHTML = innerHtml;
      }
      return tooltip;
    }
    return tooltip;
  }
}
