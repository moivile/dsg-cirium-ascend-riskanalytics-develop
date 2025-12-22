import { Aircraft } from '../../../shared/models/aircraft';
import { TableData } from './table-data';
import { TableService } from './table-service';
import { Group } from '../portfolio-overview-grouping/group';
import { functionalHelpers } from '../../helpers/functional-helpers';

export class PortfolioOverviewAgeTableService implements TableService {

  excelNumberFormat = '0.0';

  buildTableData(filteredFleet: Aircraft[], groupBy: Group): TableData {
    const tableData: TableData = {
      frozenColumns: [],
      scrollableColumns: [],
      tableRows: [],
      totals: [],
      headersInOrder: []
    };

    const tableHeaders = this.buildTableHeaders(groupBy.displayName);

    const [frozenColumns, ...scrollableColumns] = tableHeaders;
    tableData.frozenColumns = [frozenColumns];
    tableData.scrollableColumns = scrollableColumns;

    tableData.tableRows = this.buildTableRows(filteredFleet, groupBy);

    tableData.totals = [];
    tableData.headersInOrder = tableHeaders;

    return tableData;
  }

  private buildTableHeaders(groupBy: string): string[] {
    return [
      groupBy,
      'Youngest',
      'Mean',
      'Median',
      'Oldest'
    ];
  }

  private buildTableRows(filteredFleet: Aircraft[], groupBy: Group): {}[] {

    const tableRows: any[] = [];

    const groupedFleet = functionalHelpers.groupBy(filteredFleet, groupBy.groupName);

    Object.keys(groupedFleet).forEach((fleetGroup: string) => {

      const ageArray = groupedFleet[fleetGroup].reduce((accumulator: any, aircraft: any) => {
        const age = aircraft.aircraftAgeYears;
        if ( age !== null) {
            accumulator.push(age);
        }
        return accumulator;
      }, []);

      if (ageArray.length !== 0) {
        const mean = functionalHelpers.computeMean(ageArray, 1);
        const median = functionalHelpers.computeMedian(ageArray, 1);
        const youngest = Math.min(...ageArray);
        const oldest = Math.max(...ageArray);

        tableRows.push({
          [groupBy.displayName]: fleetGroup,
          Youngest: youngest,
          Mean: mean,
          Median: median,
          Oldest: oldest
        });
      }
    });

    return tableRows;
  }
}
