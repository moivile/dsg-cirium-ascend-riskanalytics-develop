
import { Aircraft } from '../../../shared/models/aircraft';
import { functionalHelpers } from '../../helpers/functional-helpers';
import { Group } from '../portfolio-overview-grouping/group';
import { TableData } from './table-data';
import { TableService } from './table-service';
import { OperatorToggleValue } from '../../models/operator-toggle-value';

export class PortfolioOverviewTableService implements TableService {

  private readonly totalPropertyName = 'Total';

  excelNumberFormat = '0';

  buildTableData(portfolioAircraft: Aircraft[], groupBy: Group, countBy: string, pivot: boolean, pivotColumnHeader: string, selectedValue: OperatorToggleValue): TableData {
    if (countBy === 'operator') {
      switch (selectedValue) {
        case OperatorToggleValue.Name:
          countBy = 'operator';
          break;
        case OperatorToggleValue.Country:
          countBy = 'operatorCountry';
          break;
      }
    }

    const excludeNullsPortfolioAircraft = portfolioAircraft.filter((aircraft: any) => {
      return aircraft[countBy] !== null;
    });
    let groupName = groupBy.groupName;
    const displayName = groupBy.displayName;

    if (pivot) {
      [countBy, groupName] = [groupName, countBy];
    }

    const tableData: TableData = {
      frozenColumns: [],
      scrollableColumns: [],
      tableRows: [],
      totals: [],
      headersInOrder:[]
    };

    let tableHeaders : string[];

    const orderedColumnCounts = this.getOrderedColumnCounts(excludeNullsPortfolioAircraft, countBy);

    if (pivot){
      tableHeaders = this.buildTableHeaders(pivotColumnHeader, orderedColumnCounts);
    } else {
      tableHeaders = this.buildTableHeaders(displayName, orderedColumnCounts);
    }

    const [frozenColumns, ...scrollableColumns] = tableHeaders;
    tableData.frozenColumns = [frozenColumns];
    tableData.scrollableColumns = scrollableColumns;

    tableData.tableRows = this.buildTableRows(excludeNullsPortfolioAircraft, groupName, displayName, countBy, tableHeaders, pivot, pivotColumnHeader);

    tableData.totals = [this.buildTableTotalRow(displayName, orderedColumnCounts)];

    return tableData;
  }

  private buildTableHeaders(groupBy: string, orderedColumnCounts: {}): string[] {
    return [
      groupBy,
      ...Object.keys(orderedColumnCounts)
    ];
  }

  private buildTableRows(portfolioAircraft: Aircraft[], groupName: string, displayName: string, countBy: string, tableHeaders: string[], pivot: boolean, pivotColumnHeader: string): {}[] {

    const tableRows: any[] = [];

    const groupedFleet = functionalHelpers.groupByExcludingNulls(portfolioAircraft, groupName);

    Object.keys(groupedFleet).forEach(groupedFleetKey => {

      const groupCounts = functionalHelpers.countBy(groupedFleet[groupedFleetKey], countBy);

      let row : any;

      if (pivot) {
        row = this.buildTableRowByDisplayName(pivotColumnHeader, groupedFleetKey, tableHeaders, groupCounts, groupedFleet);
      } else {
        row = this.buildTableRowByDisplayName(displayName, groupedFleetKey, tableHeaders, groupCounts, groupedFleet);
      }

      tableRows.push(row);

      row[this.totalPropertyName] = groupedFleet[groupedFleetKey].length;
    });

    return tableRows;
  }


  private buildTableTotalRow(groupByName: string, orderedColumnCounts: {}): {} {
    const totalRow: any = {};
    Object.assign(totalRow, orderedColumnCounts);
    totalRow[groupByName] = this.totalPropertyName;
    return totalRow;
  }

  private getOrderedColumnCounts(portfolioAircraft: Aircraft[], countBy: string): {} {

    const countAll = functionalHelpers.countBy(portfolioAircraft, countBy);

    const orderedColumnCountsArray: [string, number][] = Object.entries(countAll);

    orderedColumnCountsArray.sort((a, b) => {
      return b[1] - a[1];
    });
    const orderedColumnCounts = Object.fromEntries(orderedColumnCountsArray);

    orderedColumnCounts[this.totalPropertyName] = portfolioAircraft.length;

    return orderedColumnCounts;
  }

  private buildTableRowByDisplayName(displayName: string, groupedFleetKey: string, tableHeaders: string[], groupCounts: any, groupedFleet: any) : {} {
    const row = {
      [displayName]: groupedFleetKey
    };
    tableHeaders.forEach(tableHeader => {
      if (tableHeader !== displayName) {
        row[tableHeader] = groupCounts[tableHeader] ?? 0;
      }
    });

    row[this.totalPropertyName] = groupedFleet[groupedFleetKey].length;

    return row;
  }

}
