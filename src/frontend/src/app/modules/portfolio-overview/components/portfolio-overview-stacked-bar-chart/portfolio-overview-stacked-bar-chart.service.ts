import { Aircraft } from '../../../shared/models/aircraft';
import { functionalHelpers } from '../../helpers/functional-helpers';
import { SortBy } from '../../models/sortBy';
import { OperatorToggleValue } from '../../models/operator-toggle-value';

export class PortfolioOverviewBarChartService {

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
  private readonly highlightColours = [
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-1-opacity-50'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-2-opacity-50'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-3-opacity-50'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-4-opacity-50'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-5-opacity-50'),
    this.computedStyle.getPropertyValue('--airframe-color-chart-primary-6-opacity-50')
  ];

  buildChartData(filteredPortfolioAircraft: Aircraft[], groupByName: string, countBy: string, sortBy: SortBy, selectedValue: OperatorToggleValue): any {
    if (groupByName === 'operator') {
      switch (selectedValue) {
        case OperatorToggleValue.Name:
          groupByName = 'operator';
          break;
        case OperatorToggleValue.Country:
          groupByName = 'operatorCountry';
          break;
      }
    }

    const labels: string[] = [];
    const chartCounts: number[][] = [];

    const distinctCountByValues = functionalHelpers.distinct(filteredPortfolioAircraft, countBy).filter(value => {
      return value !== null;
    });

    distinctCountByValues.sort((x, y) => {
      if (x === sortBy.name) {
        return -1;
      }
      else if (y === sortBy.name) {
        return 1;
      }
      return 0;
    });

    const groupedFleet = functionalHelpers.groupBy(filteredPortfolioAircraft, groupByName);

    const sortedGroupKeys = this.getSortedGroupKeys(filteredPortfolioAircraft, groupByName, countBy, distinctCountByValues, sortBy);

    sortedGroupKeys.forEach((groupKey: any) => {

      labels.push(groupKey);

      const groupCounts = functionalHelpers.countBy(groupedFleet[groupKey], countBy);

      for (let i = 0; i < distinctCountByValues.length; i++) {

        if (!chartCounts[i]) {
          chartCounts[i] = [];
        }
        chartCounts[i].push(groupCounts[distinctCountByValues[i]] ?? 0);
      }
    });

    const dataSets = this.buildDataSets(chartCounts, distinctCountByValues, sortBy);
    return { dataSets, labels };
  }

  private buildDataSets(chartCounts: number[][], distinctCountByValues: any[], sortBy: SortBy): any[] {
    const dataSets: {}[] = [];

    if (chartCounts.length <= 6) {
      chartCounts.forEach((chartCount: number[], index: number) => {
        const chartColour = this.getAirframePrimaryChartColours(sortBy, distinctCountByValues, index);
        const chartItemData = {
          data: chartCount,
          label: distinctCountByValues[index],
          backgroundColor: chartColour,
          hoverBackgroundColor: chartColour,
          borderWidth: 1,
          hoverBorderWidth: 2,
          borderColor: this.borderColour,
          hoverBorderColor: this.borderColour
        };
        dataSets.push(chartItemData);
      });
    }
    else {
      chartCounts.forEach((chartCount: number[], index: number) => {
        const chartColour = this.getSingleAirframePrimaryChartColour(sortBy, distinctCountByValues, index);
        const chartItemData = {
          data: chartCount,
          label: distinctCountByValues[index],
          backgroundColor: chartColour,
          hoverBackgroundColor: chartColour,
          borderColor: this.borderColour,
          hoverBorderWidth: 2,
          hoverBorderColor: this.borderColour,
          borderWidth: 1.5
        };

        dataSets.push(chartItemData);
      });
    }
    return dataSets;
  }

  private getSortedGroupKeys(filteredPortfolioAircraft: Aircraft[],
    groupByName: string,
    countBy: string,
    distinctCountByValues: string[],
    sortBy: SortBy): any {

    const stackedBars: any[] = [];

    const groupedFleet = functionalHelpers.groupByExcludingNulls(filteredPortfolioAircraft, groupByName);

    Object.keys(groupedFleet).forEach(groupedFleetKey => {

      const groupCounts = functionalHelpers.countBy(groupedFleet[groupedFleetKey], countBy);

      const bar = {
        [groupByName]: groupedFleetKey
      };
      let sum = 0;
      distinctCountByValues.forEach(count => {
        if (count !== groupByName) {
          bar[count] = groupCounts[count] ?? 0;
          bar['Total'] = sum += groupCounts[count] ?? 0;
        }
      });

      stackedBars.push(bar);
    });

    if (sortBy.sortDescending) {
      functionalHelpers.sortByPropertyDescending(stackedBars, 'Total');
      functionalHelpers.sortByPropertyDescending(stackedBars, sortBy.name);
    }
    else {
      functionalHelpers.sortByPropertyAscending(stackedBars, 'Total');
      functionalHelpers.sortByPropertyAscending(stackedBars, sortBy.name);
    }

    return stackedBars.map(a => a[groupByName]);
  }

  private getAirframePrimaryChartColours(sortBy: SortBy, distinctCountByValues: any[], index: number): string {
    if (sortBy.name === 'Total') {
      return this.colours[index];
    }

    if (distinctCountByValues[index] === sortBy.name) {
      return this.colours[2];
    }

    return this.highlightColours[index];
  }

  private getSingleAirframePrimaryChartColour(sortBy: SortBy, distinctCountByValues: any[], index: number): string {
    if (sortBy.name === 'Total') {
      return this.colours[0];
    }

    if (distinctCountByValues[index] === sortBy.name) {
      return this.colours[2];
    }

    return this.highlightColours[0];
  }
}
