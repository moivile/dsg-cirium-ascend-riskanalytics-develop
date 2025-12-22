import { MonthlyUtilizationChartTooltipBuilderService } from './monthly-utilization-chart-tooltip-builder.service';
import { TooltipModel } from 'chart.js';
import { MonthlyUtilization } from '../../models/monthly-utilization';

const whitespaceRegex = /\r\n|\r|\n| /g;

describe('MonthlyUtilizationChartTooltipBuilderService', () => {

  describe('buildToolTip', () => {

    it('should build tooltip with value, tracked aircraft and aircraft in group', () => {
      const toolTipModel = {
        title: [''],
        body: [{
          lines: ['Value: 123']
        }],
        dataPoints: [
          {
            datasetIndex: 0,
            dataIndex: 0
          }
        ]
      } as TooltipModel<any>;

      const monthlyUtilizationChartData: MonthlyUtilization[][] = [
        [{
          numberOfAircraftInGroup: 10,
          numberOfAircraftWithHours: 5,
          group: 'All Aircraft'
        }] as MonthlyUtilization[]
      ];

      const toolTip = MonthlyUtilizationChartTooltipBuilderService.buildToolTip(
        toolTipModel,
        'tool-tip-id',
        monthlyUtilizationChartData,
        'numberOfAircraftWithHours'
      );

      const expectedInnerHtml = `
        <table>
            <thead>
                <tr><th class="tooltip-title"></th></tr>
            </thead>
            <tbody>
                <tr><td>Grouping: All Aircraft</td></tr>
                <tr><td>Value: 123 Hours</td></tr>
                <tr><td>Tracked Aircraft: 5</td></tr>
                <tr><td>Aircraft in Group: 10</td></tr>
            </tbody>
        </table>`;

      const expectedInnerHtmlWithoutWhiteSpace = expectedInnerHtml.replace(whitespaceRegex, '');
      const actualInnerHtmlWithoutWhiteSpace = toolTip.innerHTML.replace(whitespaceRegex, '');

      expect(expectedInnerHtmlWithoutWhiteSpace).toEqual(actualInnerHtmlWithoutWhiteSpace);
    });

    it('value is less then 1 then round to 2 decimal point', () => {
      const toolTipModel = {
        title: [''],
        body: [{
          lines: ['Value: 0.8323']
        }],
        dataPoints: [
          {
            datasetIndex: 0,
            dataIndex: 0
          }
        ]
      } as TooltipModel<any>;

      const monthlyUtilizationChartData: MonthlyUtilization[][] = [
        [{
          numberOfAircraftInGroup: 10,
          numberOfAircraftWithHours: 5,
          group: 'All Aircraft'
        }] as MonthlyUtilization[]
      ];

      const toolTip = MonthlyUtilizationChartTooltipBuilderService.buildToolTip(
        toolTipModel,
        'tool-tip-id',
        monthlyUtilizationChartData,
        'numberOfAircraftWithHours'
      );

      const expectedInnerHtml = `
        <table>
            <thead>
                <tr><th class="tooltip-title"></th></tr>
            </thead>
            <tbody>
                <tr><td>Grouping: All Aircraft</td></tr>
                <tr><td>Value: 0.83 Hours</td></tr>
                <tr><td>Tracked Aircraft: 5</td></tr>
                <tr><td>Aircraft in Group: 10</td></tr>
            </tbody>
        </table>`;

      const expectedInnerHtmlWithoutWhiteSpace = expectedInnerHtml.replace(whitespaceRegex, '');
      const actualInnerHtmlWithoutWhiteSpace = toolTip.innerHTML.replace(whitespaceRegex, '');

      expect(expectedInnerHtmlWithoutWhiteSpace).toEqual(actualInnerHtmlWithoutWhiteSpace);
    });

    it('value is more than 1 then round to 2 decimal points', () => {
      const toolTipModel = {
        title: [''],
        body: [{
          lines: ['Value: 1.8345']
        }],
        dataPoints: [
          {
            datasetIndex: 0,
            dataIndex: 0
          }
        ]
      } as TooltipModel<any>;

      const monthlyUtilizationChartData: MonthlyUtilization[][] = [
        [{
          numberOfAircraftInGroup: 10,
          numberOfAircraftWithHours: 5,
          group: 'All Aircraft'
        }] as MonthlyUtilization[]
      ];

      const toolTip = MonthlyUtilizationChartTooltipBuilderService.buildToolTip(
        toolTipModel,
        'tool-tip-id',
        monthlyUtilizationChartData,
        'numberOfAircraftWithHours'
      );

      const expectedInnerHtml = `
        <table>
            <thead>
                <tr><th class="tooltip-title"></th></tr>
            </thead>
            <tbody>
                <tr><td>Grouping: All Aircraft</td></tr>
                <tr><td>Value: 1.83 Hours</td></tr>
                <tr><td>Tracked Aircraft: 5</td></tr>
                <tr><td>Aircraft in Group: 10</td></tr>
            </tbody>
        </table>`;

      const expectedInnerHtmlWithoutWhiteSpace = expectedInnerHtml.replace(whitespaceRegex, '');
      const actualInnerHtmlWithoutWhiteSpace = toolTip.innerHTML.replace(whitespaceRegex, '');

      expect(expectedInnerHtmlWithoutWhiteSpace).toEqual(actualInnerHtmlWithoutWhiteSpace);
    });

    it('value has comma in it', () => {
      const toolTipModel = {
        title: [''],
        body: [{
          lines: ['Value: 2,000.23']
        }],
        dataPoints: [
          {
            datasetIndex: 0,
            dataIndex: 0
          }
        ]
      } as TooltipModel<any>;

      const monthlyUtilizationChartData: MonthlyUtilization[][] = [
        [{
          numberOfAircraftInGroup: 10,
          numberOfAircraftWithHours: 5,
          group: 'All Aircraft'
        }] as MonthlyUtilization[]
      ];

      const toolTip = MonthlyUtilizationChartTooltipBuilderService.buildToolTip(
        toolTipModel,
        'tool-tip-id',
        monthlyUtilizationChartData,
        'numberOfAircraftWithHours'
      );

      const expectedInnerHtml = `
        <table>
            <thead>
                <tr><th class="tooltip-title"></th></tr>
            </thead>
            <tbody>
                <tr><td>Grouping: All Aircraft</td></tr>
                <tr><td>Value: 2000.23 Hours</td></tr>
                <tr><td>Tracked Aircraft: 5</td></tr>
                <tr><td>Aircraft in Group: 10</td></tr>
            </tbody>
        </table>`;

      const expectedInnerHtmlWithoutWhiteSpace = expectedInnerHtml.replace(whitespaceRegex, '');
      const actualInnerHtmlWithoutWhiteSpace = toolTip.innerHTML.replace(whitespaceRegex, '');

      expect(expectedInnerHtmlWithoutWhiteSpace).toEqual(actualInnerHtmlWithoutWhiteSpace);
    });
  });
});
