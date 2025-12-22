import { Aircraft } from '../../../shared/models/aircraft';
import { Group } from '../portfolio-overview-grouping/group';
import { SortBy } from '../../models/sortBy';
import { functionalHelpers } from '../../helpers/functional-helpers';


export enum Average {
  Mean,
  Median
}

export class PortfolioOverviewJitterChartService {

  buildChartData(filteredPortfolioAircraft: Aircraft[],
    groupBy: Group,
    selectedAverage: Average | undefined,
    jitterBy: string,
    sortBy: SortBy): any {
    const averageDataSets: any = [];

    const groupedFleet = functionalHelpers.groupBy(filteredPortfolioAircraft, groupBy.groupName);

    Object.keys(groupedFleet).forEach((fleetGroup: string) => {

      const jitterByArray = groupedFleet[fleetGroup].map((a: any) => a[jitterBy]).filter((value: any) => {
        return value !== null;
      });

      if (jitterByArray.length > 0) {

        const mean = functionalHelpers.computeMean(jitterByArray, 1);
        const median = functionalHelpers.computeMedian(jitterByArray, 1);
        const youngest = Math.min(...jitterByArray);
        const oldest = Math.max(...jitterByArray);

        averageDataSets.push({
          x: selectedAverage === Average.Mean ? mean : median,
          key: fleetGroup,
          youngest,
          oldest,
          mean,
          median
        });
      }
    });

    this.sortAverageDataSets(averageDataSets, sortBy);

    const labels: string[] = [];
    averageDataSets.forEach((averageDataSet: any, i: any) => {
      averageDataSet.y = i + 1;
      labels.push(averageDataSet.key);
    });

    this.deleteSortProperties(averageDataSets);

    const jitterDataSets = this.buildJitterData(jitterBy, groupedFleet, labels);

    return { jitterDataSets, averageDataSets, labels };
  }

  private sortAverageDataSets(averageDataSets: any[], sortBy: SortBy): void {
    const sortByLowercase = sortBy.name.toLowerCase();

    if (sortBy.sortDescending === true) {
      averageDataSets.sort((a, b) => {
        if (a[sortByLowercase] === b[sortByLowercase]) {
          return a.mean - b.mean;
        }
        return a[sortByLowercase] - b[sortByLowercase];
      });
    }
    else {
      averageDataSets.sort((a, b) => {
        if (a[sortByLowercase] === b[sortByLowercase]) {
          return b.mean - a.mean;
        }
        return b[sortByLowercase] - a[sortByLowercase];
      });
    }
  }

  private deleteSortProperties(averageDataSets: any[]): void {
    averageDataSets.forEach(dataset => {
      delete dataset.youngest;
      delete dataset.oldest;
      delete dataset.mean;
      delete dataset.median;
    });
  }

  private buildJitterData(jitterBy: string, groupedFleet: {}, orderedLabels: any): any {
    const dataSets: {}[] = [];

    const orderedGroupedFleet: any = [];

    Object.entries(groupedFleet).forEach((fleetGroup: any[]) => {
      if (orderedLabels.includes(fleetGroup[0])) {
        orderedGroupedFleet.push(fleetGroup);
      }
    });

    orderedGroupedFleet.sort((a: any, b: any) => {
      return orderedLabels.indexOf(a[0]) - orderedLabels.indexOf(b[0]);
    });

    orderedGroupedFleet.forEach((fleetGroup: any[], index: number) => {
      fleetGroup[1].forEach((aircraft: any) => {
        const chartItemData = {
          x: aircraft[jitterBy],
          y: this.createJitter(index + 1),
          aircraft
        };
        dataSets.push(chartItemData);
      });
    });

    return dataSets;
  }

  private createJitter(value: number): any {
    const min = -0.3;
    const max = 0.3;
    return value + Math.random() * (min - max) + max;
  }
}
