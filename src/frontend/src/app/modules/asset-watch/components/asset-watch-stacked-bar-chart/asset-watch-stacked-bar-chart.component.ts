import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { BehaviorSubject, Subscription, tap } from 'rxjs';
import { ChartInputData } from '../../models/chart-input-data';
import * as htmlToImage from 'html-to-image';
import { DateConstants } from '../../../shared/models/date-constants';
import dayjs from 'dayjs';

@Component({
    selector: 'ra-asset-watch-stacked-bar-chart',
    templateUrl: './asset-watch-stacked-bar-chart.component.html',
    styleUrls: ['./asset-watch-stacked-bar-chart.component.scss'],
    standalone: false
})
export class AssetWatchStackedBarChartComponent implements OnInit {
  @Input() inputData$!: BehaviorSubject<ChartInputData>;
  @Input() chartname!: string;
  @Input() portfolioName!: string | null;
  @Input() isModal = false;
  @Input() loading = false;
  @Input() downloadChart$!: BehaviorSubject<Event>;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChild('chartContainer') chartContainer: ElementRef | undefined;
  barChartOptions = {};
  barChartLabels: string[] = [];
  barChartDataSets: [] = [];
  chartHeight!: number;
  legendItems: any[] = [];
  displayModal = false;
  showDownloadChart = true;
  modalTitle!: string;
  chartImageName = '';
  chartImageSubscription!: Subscription;

  private readonly computedStyle = getComputedStyle(document.documentElement);
  private readonly borderColour = this.computedStyle.getPropertyValue('--airframe-color-chart-primary-border');
  private readonly colours = [
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-1'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-2'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-3'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-4'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-5'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-6')
  ];

  private readonly groundStayColors: { [key: string]: string } = {
    'Very Short Stay (6-12hrs)': this.colours[3],
    'Short Stay (12-48 hrs)': this.colours[0],
    'Medium Stay (48 hrs - 7 Days)': this.colours[1],
    'Long Stay (>7 Days)': this.colours[2]
  };
  ngOnInit(): void {
    this.chartImageSubscription = this.downloadChart$?.subscribe(async () => {
      await this.downloadChart();
    });
    this.inputData$
      .pipe(
        tap((inputData) => {
          if (Object.keys(inputData).length === 0) {
            return;
          }

          this.barChartDataSets = this.getDataSets(inputData.chartCounts, inputData.legendItemLabels);
          this.barChartLabels = inputData.labels;
          this.legendItems = [];

          this.barChartDataSets.forEach((dataset: any) => {
            const colours = this.groundStayColors[dataset.label] || dataset.backgroundColor;
            this.legendItems.push({
              label: dataset.label,
              colour: colours
            });
          });
          this.showDownloadChart = this.barChartLabels && this.barChartLabels.length > 0 ? true : false;

          this.initChartHeight();
        })
      )
      .subscribe();
    this.setChartOptions();
  }

  showModal(): void {
    this.modalTitle = `Chart`;
    this.displayModal = true;
  }

  removeTooltip(): void {
    const tooltip = AssetWatchStackedBarChartComponent.getToolTip();
    if (tooltip) {
      tooltip.remove();
    }
  }

  async downloadChart(): Promise<void> {
    this.getChartImageName();
    this.showDownloadChart = false;
    const padding = 10;
    const scaleFactor = 2;
    const tempCanvas = document.createElement('canvas');
    const container = this.chartContainer?.nativeElement;

    if (!container) {
      return;
    }
    const contentWidth = container.scrollWidth;
    const contentHeight = container.scrollHeight;
    const { tempContext } = this.prepareCanvas(contentWidth, contentHeight, padding, scaleFactor, tempCanvas);

    try {
      const chartCanvas = await this.createChartCanvas(container);
      this.drawChartImage(chartCanvas, tempContext, padding, scaleFactor, contentWidth, contentHeight);
      this.saveImage(tempCanvas);
      this.showDownloadChart = true;
    } catch (error) {
      throw new Error('Error downloading chart');
    }
  }

  prepareCanvas(
    contentWidth: number,
    contentHeight: number,
    padding: number,
    scaleFactor: number,
    tempCanvas: HTMLCanvasElement
  ): { tempContext: CanvasRenderingContext2D } {
    const tempContext = tempCanvas.getContext('2d');

    if (!tempContext) {
      throw new Error('Canvas context not supported.');
    }

    const tempCanvasWidth = (contentWidth + 2 * padding) * scaleFactor;
    const tempCanvasHeight = (contentHeight + 2 * padding) * scaleFactor;
    tempCanvas.width = tempCanvasWidth;
    tempCanvas.height = tempCanvasHeight;
    tempContext.fillStyle = 'white';
    tempContext.fillRect(0, 0, tempCanvasWidth, tempCanvasHeight);

    return { tempContext };
  }

  getChartImageName(): void {
    const formattedDate = dayjs().format(DateConstants.DDMMYYYY);
    this.chartImageName = `${this.portfolioName}_${this.chartname}_${formattedDate}`;
  }

  async createChartCanvas(container: HTMLElement): Promise<HTMLCanvasElement> {
    return htmlToImage.toCanvas(container, {
      filter: (element: HTMLElement) => {
        return !element.classList?.contains('exclude-element');
      },
      skipFonts: true,
      preferredFontFormat: 'woff2',
      backgroundColor: 'white'
    });
  }

  drawChartImage(
    chartCanvas: HTMLCanvasElement,
    tempContext: CanvasRenderingContext2D,
    padding: number,
    scaleFactor: number,
    containerWidth: number,
    containerHeight: number
  ): void {
    tempContext.drawImage(
      chartCanvas,
      padding * scaleFactor,
      padding * scaleFactor,
      containerWidth * scaleFactor,
      containerHeight * scaleFactor
    );
  }

  saveImage(tempCanvas: HTMLCanvasElement): void {
    const dataUrl = tempCanvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.download = this.chartImageName;
    link.href = dataUrl;
    link.click();
    link.remove();
  }

  public getDataSets(chartCounts: number[][], legendItemLabels: string[]): any {
    const dataSets: {}[] = [];

    chartCounts.forEach((chartCount: number[], index: number) => {
      const chartColour = this.colours[index];
      const legendLabel = legendItemLabels[index];
      const hoverColour = this.groundStayColors[legendLabel] || chartColour;

      const chartItemData = {
        data: chartCount,
        label: legendLabel,
        backgroundColor: hoverColour,
        hoverBackgroundColor: hoverColour,
        borderWidth: 1,
        hoverBorderWidth: 2,
        borderColor: this.borderColour,
        hoverBorderColor: this.borderColour
      };
      dataSets.push(chartItemData);
    });

    return dataSets;
  }

  public static getTooltipBodyContentItems(tooltipBody: any): any {
    const tooltipBodyContents: any[] = [];

    tooltipBody.forEach((body: any) => {
      tooltipBodyContents.push({
        text: body[0].split(': ')[0],
        value: parseInt(body[0].split(': ')[1].replaceAll(',', ''), 10)
      });
    });

    if (tooltipBodyContents.filter((item) => item.value !== 0).length > 1) {
      tooltipBodyContents.push({
        text: 'Total',
        value: tooltipBodyContents.reduce((a: number, b: any) => a + b.value, 0)
      });
    }

    return tooltipBodyContents;
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
          mode: 'index',
          itemSort: (a: any, b: any) => b.formattedValue - a.formattedValue,
          external: (tooltipModel: any): void => {
            const tooltip = AssetWatchStackedBarChartComponent.buildToolTip(tooltipModel);
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

  // needs to be static to work with charts.js
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
        style = colors ? `background: ${colors.backgroundColor}; border-color: ${colors.borderColor}; width: 16px` : 'width: 16px';
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
      const tooltipBodyContentItems = this.getTooltipBodyContentItems(tooltipBody);
      let innerHtml = this.createTooltipTableStucture(tooltipModel.tooltip.title);
      innerHtml = this.createTooltipContent(tooltipBodyContentItems, tooltipModel, innerHtml);

      if (tooltip.firstElementChild) {
        tooltip.firstElementChild.innerHTML = innerHtml;
      }
      return tooltip;
    }
    return tooltip;
  }
}
