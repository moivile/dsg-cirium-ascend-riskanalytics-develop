import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import * as htmlToImage from 'html-to-image';
import { ChartOptions, Chart, registerables  } from 'chart.js';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { Metric } from '../../models/metric';
import { MonthlyUtilizationChartTooltipBuilderService } from './monthly-utilization-chart-tooltip-builder.service';
import { AppConfigService } from '../../../../app-config.service';
import { ToastMessageOptions } from 'primeng/api';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { DateConstants } from '../../../shared/models/date-constants';
import dayjs from 'dayjs';
import { MonthlyUtilizationChartObject } from '../../models/monthly-utilization-chart-object';
Chart.register(...registerables);
@Component({
  selector: 'ra-monthly-utilization-chart[monthlyUtilizationChartData][metric][yScaleSuggestedMax][chartLabels][chartXAxisTitle]',
  templateUrl: './monthly-utilization-chart.component.html',
  styleUrls: ['./monthly-utilization-chart.component.scss'],
  standalone: false
})
export class MonthlyUtilizationChartComponent implements OnInit, OnChanges {
  @Input() metric!: Metric;
  @Input() monthlyUtilizationChartData!: MonthlyUtilization[][];
  @Input() chartLabels: string[] = [];
  @Input() chartXAxisTitle!: string;
  @Input() yScaleSuggestedMax?: number;
  @Input() upsell = false;
  @Input() isComparisonPortfolio!: boolean;
  @Input() isEmissions!: boolean;
  @Input() isHoursAndCycle!: boolean;
  @Input() yMax!: any[];
  @Input() portfolioName!: string;
  @Input() graphNoticeMessage!: string;
  @Output() yAxisScaleChange = new EventEmitter<any>();
  @ViewChild('chartContainer') chartContainer: ElementRef | undefined;
  chartImageName = '';
  @Input() isModal = false;
  yMaxVal!: number;
  displayModal = false;
  message!: ToastMessageOptions;
  comparisonPortfolio_chartDataSet = '';
  referencePortFolio_chartDataset = '';

  lastSelectedGroupOption: any;
  chartOptions: ChartOptions<'line'> = {};
  chartDataSets: MonthlyUtilizationChartObject[] = [];
  legendItems: { colour: string; label: string }[] = [];
  marketingUrl!: string;
  showNoticeMessage = false;
  showDownloadChart = true;
  showChartForZoom = true;
  upsellOverlayPlugin = {
    id: 'upsellOverlay',
    beforeDraw: (chart: any) => {
      const overlayImage = new Image();
      overlayImage.src = 'https://d1vbw5keesufbh.cloudfront.net/riskanalytics/emissions-upsell-overlay.png';
      overlayImage.onload = () => {
        chart.ctx.drawImage(overlayImage, chart.chartArea.left, chart.chartArea.top, chart.chartArea.width, chart.chartArea.height);
      };
    }
  };
  private readonly toolTipId = 'chart-tooltip';
  private readonly computedStyle = getComputedStyle(document.documentElement);
  private readonly colours = ['#00C19F', '#0084D4', '#FF8200', '#E0034D', '#FFC72C'];
  private readonly fontFamily = 'Montserrat, sans-serif';
  initialZoomLevel = this.zoomLevel;
  chartDownloadToolTip = 'Download Chart';

  get zoomLevel(): number {
    const zoom = (window.outerWidth - 10) / window.innerWidth;
    this.showChartForZoom = zoom * 100 + 1 >= 100;
    return zoom;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.compareZoomLevel();
  }

  compareZoomLevel(): void {
    if (this.zoomLevel !== this.initialZoomLevel) {
      this.showChartForZoom = this.zoomLevel * 100 + 1 >= 100;
      if (this.showDownloadChart) {
        this.chartDownloadToolTip = this.showChartForZoom ? 'Download Chart' : 'Chart download available at 100% zoom';
      }
      this.initialZoomLevel = this.zoomLevel;
    }
  }

  constructor(private readonly appConfigService: AppConfigService) { }

  ngOnInit(): void {
    this.marketingUrl = this.appConfigService.configuration.marketingUrl;
  }

  ngOnChanges(): void {
    if (this.portfolioName?.length < 1) {
      return;
    }
    this.comparisonPortfolio_chartDataSet = 'comparisonPortfolio_chartDataSet';
    this.referencePortFolio_chartDataset = 'referencePortFolio_chartDataset';
    this.showDownloadChart = true;
    Object.entries(this.monthlyUtilizationChartData).forEach(([, monthlyUtilization], index) => {
      const dataset = this.buildChartDataObject(monthlyUtilization, this.colours[index]);
      this.updateYMaxValues(dataset);
    });
    this.setChartOptions();
    this.checkNoticeMessage();
    if (this.resetChartDataIfEmpty()) {
      return;
    }
    const chartDataSets: MonthlyUtilizationChartObject[] = [];
    Object.entries(this.monthlyUtilizationChartData).forEach(([, monthlyUtilization], index) => {
      chartDataSets.push(this.buildChartDataObject(monthlyUtilization, this.colours[index]));
    });

    this.chartDataSets = chartDataSets;
    if (this.isComparisonPortfolio !== undefined) {
      if (this.isComparisonPortfolio) {
        this.chartDataSets = this.checkColorFromBackup(chartDataSets, this.yMax[0][this.referencePortFolio_chartDataset]);
      } else {
        this.chartDataSets = this.checkColorFromBackup(chartDataSets, this.yMax[0][this.comparisonPortfolio_chartDataSet]);
      }
    }

    this.legendItems = this.getLegendItems(chartDataSets, this.metric.valuePropertyName);
    this.chartDownloadToolTip = this.showChartForZoom ? 'Download Chart' : 'Chart download available at 100% zoom';
  }

  resetChartDataIfEmpty(): boolean {
    if (!this.monthlyUtilizationChartData || this.monthlyUtilizationChartData.length === 0) {
      this.chartDataSets = [];
      this.legendItems = [];
      this.showDownloadChart = false;
      return true;
    }
    return false;
  }

  getLegendItems(chartDataSets: MonthlyUtilizationChartObject[], propertyName: string): { colour: string; label: string }[] {
    const legendItems: { colour: string; label: string }[] = [];
    chartDataSets.forEach((dataset: MonthlyUtilizationChartObject) => {
      legendItems.push({
        label: dataset.label,
        colour: dataset.borderColor
      });
      this.yMax[0].name = propertyName;
      this.updateYMaxValues(dataset);
    });
    return legendItems;
  }

  checkNoticeMessage(): void {
    this.showNoticeMessage = this.graphNoticeMessage?.trim().length > 0 ? true : false;
    if (this.showNoticeMessage) {
      this.message = {
        severity: 'error',
        detail: this.graphNoticeMessage,
        summary: 'No results for:'
      };
    }
  }

  buildChartDataObject(monthlyUtilization: MonthlyUtilization[], colour: string): MonthlyUtilizationChartObject {
    return {
      data: monthlyUtilization.map((x: MonthlyUtilization) => x[this.metric.valuePropertyName as keyof MonthlyUtilization]),
      label: this.buildChartLegendItem(monthlyUtilization[0]),
      fill: false,
      tension: 0,
      borderColor: colour,
      pointBackgroundColor: colour,
      pointBorderColor: colour,
      pointHoverBorderColor: colour
    };
  }

  updateYMaxValues(dataset: MonthlyUtilizationChartObject): void {
    if (this.yMax === undefined) {
      return;
    }
    if (this.isComparisonPortfolio !== undefined) {
      if (this.isComparisonPortfolio) {
        this.yMax[0][this.comparisonPortfolio_chartDataSet] = this.updateYmaxChartDataset(
          this.yMax[0][this.comparisonPortfolio_chartDataSet],
          dataset
        );
      } else {
        this.yMax[0][this.referencePortFolio_chartDataset] = this.updateYmaxChartDataset(
          this.yMax[0][this.referencePortFolio_chartDataset],
          dataset
        );
      }
    }
  }

  updateYmaxChartDataset(
    chartDataArray: MonthlyUtilizationChartObject[],
    dataset: MonthlyUtilizationChartObject
  ): MonthlyUtilizationChartObject[] {
    const datasetIndex = chartDataArray.findIndex((x: MonthlyUtilizationChartObject) => x.label == dataset.label);
    if (datasetIndex !== -1) {
      chartDataArray[datasetIndex] = dataset;
    } else {
      chartDataArray.push(dataset);
    }
    if (chartDataArray.length > 1) {
      const allAircraftIndex = chartDataArray.findIndex((x: MonthlyUtilizationChartObject) => x.label == 'All aircraft');
      if (allAircraftIndex !== -1) {
        chartDataArray.splice(allAircraftIndex, 1);
      }
    }
    return chartDataArray;
  }

  buildChartLegendItem(monthlyUtilization: MonthlyUtilization): string {
    if (!monthlyUtilization.aircraftType) {
      return monthlyUtilization.group;
    }
    return monthlyUtilization.group + ' (' + monthlyUtilization.aircraftType + ')';
  }

  async downloadChart(): Promise<void> {
    this.getChartImageName();
    this.showDownloadChart = false;
    const padding = 10;
    const scaleFactor = 1.5;
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
      throw Error('Error downloading chart');
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
    const portfolioType: string = this.portfolioName;
    const metricType: string = this.isEmissions ? 'EmissionTrend' : 'UtilizationTrend';
    const formattedDate = dayjs().format(DateConstants.DDMMYYYY);
    this.chartImageName = `${portfolioType}_${metricType}_${formattedDate}`;
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

  checkColorFromBackup(chartDataSet: any, chartDataSetBackup: any): any {
    const datasetIndexArray = [];
    const colArray = Object.assign([], this.colours);
    if (chartDataSetBackup !== undefined && chartDataSetBackup.length > 0) {
      for (let index = 0; index < chartDataSet.length; index++) {
        const duplicateValuesArray = chartDataSetBackup.filter((x: { label: any }) => x.label == chartDataSet[index].label);
        if (duplicateValuesArray.length > 0) {
          const color = duplicateValuesArray[duplicateValuesArray.length - 1].borderColor;
          const colorIndex = colArray.findIndex((colorFromArray) => colorFromArray == color);
          chartDataSet[index] = this.applyColorToGraphElements(chartDataSet[index], color);
          colArray.splice(colorIndex, 1);
        } else {
          datasetIndexArray.push(index);
        }
      }
    }
    for (let index = 0; index < datasetIndexArray.length; index++) {
      const num: number = datasetIndexArray[index];
      datasetIndexArray[index] = this.applyColorToGraphElements(chartDataSet[num], colArray[index]);
    }
    return chartDataSet;
  }

  applyColorToGraphElements(element: any, color: string): any {
    element.borderColor = color;
    element.pointBackgroundColor = color;
    element.pointBorderColor = color;
    element.pointHoverBorderColor = color;
    return element;
  }

  removeTooltip(): void {
    document.getElementById(this.toolTipId)?.remove();
  }

  updateYMax(valuePropertyName: string, yTemp: number, chartDataSet: any, type: string): void {
    const index = this.yMax.findIndex(
      (x) =>
        x.name === this.metric.valuePropertyName &&
        x.isComparisonPortfolio === this.isComparisonPortfolio &&
        this.isComparisonPortfolio !== undefined
    );
    if (index !== -1) {
      this.yMax.splice(index, 1);
    }
    if (this.yMax.length === 0) {
      this.yMax = [
        {
          name: valuePropertyName,
          value: yTemp,
          [this.comparisonPortfolio_chartDataSet]: [],
          [this.referencePortFolio_chartDataset]: []
        }
      ];
    }
    if (this.isComparisonPortfolio) {
      this.yMax[0][this.comparisonPortfolio_chartDataSet] = chartDataSet;
    } else {
      this.yMax[0][this.referencePortFolio_chartDataset] = chartDataSet;
    }
    if (this.yMaxVal !== yTemp) {
      this.yMaxVal = yTemp;
      this.yAxisScaleChange.emit(this.yMax);
    }
  }

  showModal(): void {
    this.displayModal = true;
  }

  findYMax(): number {
    let result;
    let yTemp = 0;
    for (let index = 0; index < this.monthlyUtilizationChartData.length; index++) {
      result = this.monthlyUtilizationChartData[index].map((x) => x[this.metric.valuePropertyName as keyof MonthlyUtilization]);
      result = result.map((x) => parseFloat(x.toString()));
      const maxVal = Math.max(...result);
      let comparsionMaxVal = 0;
      this.yMax[0].comparisonPortfolio_chartDataSet.forEach((element: any) => {
        const tempMaxValue = Math.max(...element.data);
        if (tempMaxValue > comparsionMaxVal) {
          comparsionMaxVal = tempMaxValue;
        }
      });
      let referenceMaxVal = 0;
      this.yMax[0].referencePortFolio_chartDataset.forEach((element: any) => {
        const tempMaxValue = Math.max(...element.data);
        if (tempMaxValue > referenceMaxVal) {
          referenceMaxVal = tempMaxValue;
        }
      });
      yTemp = Math.max(maxVal, comparsionMaxVal, referenceMaxVal, yTemp);
    }
    return yTemp;
  }

  checkYAxisMaxAndScale(): void {
    if (this.monthlyUtilizationChartData.length > 0) {
      let tempY = this.findYMax();
      const countDiv = this.countDivisionsAndRemainder(tempY);
      tempY = (countDiv.remainder + 1) * Math.pow(10, countDiv.divisions);
      if (this.yMaxVal !== tempY) {
        this.yMaxVal = tempY;
      }
      if (this.isComparisonPortfolio) {
        this.updateYMax(this.metric.valuePropertyName, tempY, this.chartDataSets, 'comparisonPortfolio_chartDataSet');
      } else {
        this.updateYMax(this.metric.valuePropertyName, tempY, this.chartDataSets, 'referencePortFolio_chartDataset');
      }
      this.yMax.forEach((element) => {
        if (element.name == this.metric.valuePropertyName) {
          if (element.value !== tempY) {
            element.value = tempY;
            this.yAxisScaleChange.emit(this.yMax);
          }
          element.value = tempY;
        }
      });
    } else {
      this.yScaleSuggestedMax ? (this.yMaxVal = this.yScaleSuggestedMax) : null;
    }
  }

  countDivisionsAndRemainder(number: number): { divisions: number; remainder: number } {
    let divisions = 0;
    while (number >= 10) {
      number /= 10;
      divisions++;
    }
    const remainder = Math.ceil(number);
    return { divisions, remainder };
  }

  private setChartOptions(): void {
    const monthlyUtilizationChartData = this.monthlyUtilizationChartData;
    if (!this.yMax && monthlyUtilizationChartData.length > 0) {
      this.yMax = [
        {
          name: this.metric.valuePropertyName,
          value: this.yScaleSuggestedMax,
          [this.comparisonPortfolio_chartDataSet]: [],
          [this.referencePortFolio_chartDataset]: []
        }
      ];
    }
    this.checkYAxisMaxAndScale();
    const toolTipId = this.toolTipId;
    const aircraftInValueProperty = this.metric.numberOfAircraftPropertyName;

    this.chartOptions = {
      responsive: true,
      aspectRatio: 2,
      maintainAspectRatio: true,
      scales: {
        x: {
          ticks: {
            color: 'black',
            font: {
              family: this.fontFamily,
              size: 12,
              weight: 'normal'
            }
          },
          title: {
            display: true,
            text: this.chartXAxisTitle,
            font: {
              family: this.fontFamily,
              size: 14,
              weight: 'bold'
            },
            color: 'black'
          }
        },
        y: {
          min: 0,
          max: this.yMaxVal,
          suggestedMax: this.yScaleSuggestedMax,
          ticks: {
            color: 'black',
            font: {
              family: this.fontFamily,
              size: 12,
              weight: 'normal'
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false,
          position: 'right'
        },
        tooltip: {
          enabled: false,
          position: 'nearest',
          mode: 'nearest',
          itemSort: (a: any, b: any) => b.formattedValue - a.formattedValue,
          external(tooltipModel: any): void {
            const tooltip = MonthlyUtilizationChartTooltipBuilderService.buildToolTip(
              tooltipModel.tooltip,
              toolTipId,
              monthlyUtilizationChartData,
              aircraftInValueProperty
            );
            if (tooltip) {
              const position = tooltipModel.chart.canvas.getBoundingClientRect();
              tooltip.style.opacity = '1';
              const leftPosition = position.left + window.scrollX + tooltipModel.tooltip.caretX;
              tooltip.style.left = `${leftPosition}px`;
              tooltip.style.top = `${position.top + window.scrollY + tooltipModel.tooltip.caretY}px`;
              tooltip.style.padding = `${tooltipModel.tooltip.yPadding}px ${tooltipModel.tooltip.xPadding}px`;
            }
          }
        }
      }
    };
  }
}
