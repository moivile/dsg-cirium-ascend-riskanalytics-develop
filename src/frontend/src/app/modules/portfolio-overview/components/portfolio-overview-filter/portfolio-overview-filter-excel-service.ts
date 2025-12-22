import { Injectable } from '@angular/core';
import { Filter } from './portfolio-overview-filter.service';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';

@Injectable()
export class PortfolioOverviewFilterExcelService {

  public buildFiltersExcelSheetData(filters: Filter[]): ExcelSheetData {
    const tableData: any[] = [];
    filters.forEach((filter) => {
      if (filter.selectedFilters.length !== 0) {
        filter.selectedFilters.forEach(selectedFilter => {
          const tableRow: any = {};
          if (tableData.filter(x => x['Filter Type'] === filter.displayName).length > 0) {
            tableRow['Filter Type'] = null;
          } else {
            tableRow['Filter Type'] = filter.displayName;
          }
          if (filter.filterOptions.find(x => x.name === selectedFilter !== undefined)) {
            const filterValue = filter.filterOptions && filter.filterOptions.find(x => x.name === selectedFilter)?.count;
            if (filterValue && filterValue > 0) {
              tableRow['Filter Name'] = selectedFilter;
              tableRow['Value'] = filterValue;
              tableData.push(tableRow);
            }
          }
        });
      }
    });
    const excelData = {} as ExcelSheetData;
    excelData.excelData = tableData;
    excelData.excelNumberFormat = '0';
    excelData.headersInOrder = ['Filter Type', 'Filter Name', 'Value'];
    excelData.isPivot = false;
    return excelData;
  }
}
