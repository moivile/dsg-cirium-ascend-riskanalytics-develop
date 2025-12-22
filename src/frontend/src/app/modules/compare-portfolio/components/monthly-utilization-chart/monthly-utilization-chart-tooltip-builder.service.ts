import { MonthlyUtilization } from '../../models/monthly-utilization';
import { functionalHelpers } from '../../../portfolio-overview/helpers/functional-helpers';
import { TooltipModel } from 'chart.js';

export interface ChartMetricMapper {
  [name: string]: string;
}

export class MonthlyUtilizationChartTooltipBuilderService {
  static chartMetricMapping: ChartMetricMapper = {
    numberOfAircraftWithHours: 'Hours',
    numberOfAircraftWithCycles: 'Cycles',
    numberOfAircraftWithHoursPerCycle: 'H/C',
    numberOfAircraftWithCo2GPerAsk: 'g',
    numberOfAircraftWithCo2GPerAsm: 'g',
    numberOfAircraftWithCo2KgPerSeat: 'kg'
  };

  static buildToolTip(
    tooltipModel: TooltipModel<any>,
    toolTipId: string,
    monthlyUtilizationChartData: MonthlyUtilization[][],
    aircraftInValueProperty: string
  ): HTMLElement {
    let tooltip = document.getElementById(toolTipId);

    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = toolTipId;
      tooltip.innerHTML = '<table></table>';
      document.body.appendChild(tooltip);
    }

    const tooltipLine = tooltipModel.body[0].lines[0];

    const dataPointMonthlyUtilization =
      monthlyUtilizationChartData[tooltipModel.dataPoints[0].datasetIndex][tooltipModel.dataPoints[0].dataIndex];

    const tooltipValue = this.GetToolTipValue(tooltipLine);

    let innerHtml = `<thead><tr><th class='tooltip-title'>${tooltipModel.title[0]}</th></tr></thead>`;

    innerHtml += '<tbody>';
    innerHtml += `<tr><td>Grouping: ${dataPointMonthlyUtilization.group}</td></tr>`;
    innerHtml += `<tr><td>Value: ${tooltipValue} ${this.GetMetricAircraftInValueProperty(aircraftInValueProperty)}</td></tr>`;
    innerHtml += `<tr><td>Tracked Aircraft: ${dataPointMonthlyUtilization[aircraftInValueProperty as keyof MonthlyUtilization]}</td></tr>`;
    innerHtml += `<tr><td>Aircraft in Group: ${dataPointMonthlyUtilization.numberOfAircraftInGroup}</td></tr>`;
    innerHtml += '</tbody>';

    if (tooltip.firstElementChild) {
      tooltip.firstElementChild.innerHTML = innerHtml;
    }

    return tooltip;
  }

  private static GetToolTipValue(tooltipLine: string): number {
    tooltipLine = tooltipLine.replaceAll(',', '');
    const dataPointValue = Number(tooltipLine.split(': ')[1]);
    return Number(dataPointValue.toFixed(2));
  }

  private static GetMetricAircraftInValueProperty(aircraftInValueProperty: string): string {
    return this.chartMetricMapping[aircraftInValueProperty] || '';
  }
}
