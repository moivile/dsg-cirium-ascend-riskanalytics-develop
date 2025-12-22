import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as xlsx from 'xlsx';
import { ExcelSheetData } from '../models/excel-sheet-data';
import * as dayjs from 'dayjs';
import { DateConstants } from '../models/date-constants';
import { PortfolioDetailOptions } from '../../compare-portfolio/models/portfolio-detail-options';
import { MetricOptions } from '../../compare-portfolio/models/metric-options';
type ExcelData = { [key: string]: string | number };

@Injectable()
export class ExportExcelService {
  exportExcel(tableData: any[], fileName: string, excelNumberFormat: any, headersInOrder = undefined, showDecimal?: boolean): void {
    if (!tableData || tableData.length === 0) {
      return;
    }

    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(tableData, {
        dateNF: 'dd-mmm-yyyy;@',
        cellDates: true,
        header: headersInOrder
      });

      this.addRangeToWorksheet(tableData, worksheet, excelNumberFormat, showDecimal);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(fileName, excelBuffer);
    });
  }

  exportExcelSheetData(
    tableData: Map<string, ExcelSheetData>,
    fileName: string,
    excelSheetsMustBeSorted = true,
    showDecimal?: boolean
  ): void {
    if (this.isEmptySheet(tableData)) {
      return;
    }

    import('xlsx').then((xlsx) => {
      const workbook = xlsx.utils.book_new();

      const sortedTableData = excelSheetsMustBeSorted ? new Map([...tableData.entries()].sort()) : tableData;
      sortedTableData.forEach((data: ExcelSheetData, worksheetName: string) => {
        if (!data || data.excelData.length === 0) {
          return;
        }
        const jsonData = data.excelData;

        const worksheet = xlsx.utils.json_to_sheet(jsonData, {
          dateNF: 'dd-mmm-yyyy;@',
          cellDates: true,
          header: data.headersInOrder ? data.headersInOrder : undefined
        });

        this.setColumnWidths(data, worksheet);

        this.addRangeToWorksheet(jsonData, worksheet, data.excelNumberFormat, showDecimal);

        xlsx.utils.book_append_sheet(workbook, worksheet, this.toTitleCase(worksheetName));
      });
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(fileName, excelBuffer);
    });
  }

  getDistinctPropertyValues<T, K extends keyof T>(array: T[], propertyName: K): T[K][] {
    const uniqueValues = new Set(array.map((item) => item[propertyName]));
    return Array.from(uniqueValues);
  }

  populateHoursAndCycleDataArrays(
    tableData: Map<string, ExcelSheetData[]>,
    portfolioDetails?: PortfolioDetailOptions,
    comparisonPortfolioDetails?: PortfolioDetailOptions
  ): {
    trackedAircraftsArray: ExcelData[];
    totalMonthlyTrackedHoursArray: ExcelData[];
    totalMonthlyTrackedCyclesArray: ExcelData[];
    totalCo2GPerAsk: ExcelData[];
    totalCo2GPerAsm: ExcelData[];
    totalCo2KgPerSeat: ExcelData[];
  } {
    const trackedAircraftsArray: ExcelData[] = [];
    const totalMonthlyTrackedHoursArray: ExcelData[] = [];
    const totalMonthlyTrackedCyclesArray: ExcelData[] = [];
    const totalCo2GPerAsk: ExcelData[] = [];
    const totalCo2GPerAsm: ExcelData[] = [];
    const totalCo2KgPerSeat: ExcelData[] = [];

    for (const element of Array.from(tableData)[1][1]) {
      const metrics = (element.excelData[0] as ExcelData)['Metrics'];
      let filteredData: ExcelData[] = [];
      const portfolioElements = [portfolioDetails, comparisonPortfolioDetails];
      portfolioElements.forEach((portfolio) => {
        if (portfolio == null || portfolio == undefined) {
          return;
        }
        let checkRows: ExcelData[] = [];
        if (portfolio.groupByOptions?.filterIds?.length ?? 0 > 0) {
          checkRows = element.excelData.filter(
            (data: ExcelData) => data['Grouping'] !== 'All aircraft' && data['Portfolio'] === portfolio.portfolioName
          );
        } else {
          checkRows = element.excelData.filter(
            (data: ExcelData) => data['Grouping'] === 'All aircraft' && data['Portfolio'] === portfolio.portfolioName
          );
        }
        filteredData = checkRows;

        switch (metrics) {
          case 'Tracked Aircraft':
            trackedAircraftsArray.push(...filteredData);
            break;
          case 'Total Monthly Tracked Hours':
            totalMonthlyTrackedHoursArray.push(...filteredData);
            break;
          case 'Total Monthly Tracked Cycles':
            totalMonthlyTrackedCyclesArray.push(...filteredData);
            break;
          case 'Total Monthly CO2 per ASK (g)':
            totalCo2GPerAsk.push(...filteredData);
            break;
          case 'Total Monthly CO2 per ASM (g)':
            totalCo2GPerAsm.push(...filteredData);
            break;
          case 'Total Monthly CO2 per Seat (kg)':
            totalCo2KgPerSeat.push(...filteredData);
            break;
        }
      });
    }

    return {
      trackedAircraftsArray,
      totalMonthlyTrackedHoursArray,
      totalMonthlyTrackedCyclesArray,
      totalCo2GPerAsk,
      totalCo2GPerAsm,
      totalCo2KgPerSeat
    };
  }

  createSummaryComparisonWorksheet = (
    detailColumnCount: number,
    workbook: xlsx.WorkBook,
    sheetName: string,
    tableData: Map<string, ExcelSheetData[]>,
    portfolioDetails?: PortfolioDetailOptions,
    comparisonPortfolioDetails?: PortfolioDetailOptions
  ): xlsx.WorkBook => {
    const worksheet = xlsx.utils.json_to_sheet([], {
      dateNF: 'dd-mmm-yyyy;@',
      cellDates: true,
      header: undefined // Headers will be added later
    });
    let currentRowIndex = 0;
    const {
      trackedAircraftsArray,
      totalMonthlyTrackedHoursArray,
      totalMonthlyTrackedCyclesArray,
      totalCo2GPerAsk,
      totalCo2GPerAsm,
      totalCo2KgPerSeat
    } = this.populateHoursAndCycleDataArrays(tableData, portfolioDetails, comparisonPortfolioDetails);

    const unwantedKeys = ['Metrics', 'Total of Selected Period'];
    for (let index = 0; index < Array.from(tableData)[1][1].length; index++) {
      const element = Array.from(tableData)[1][1][index];
      const metricName = (element.excelData[0] as ExcelData)['Metrics'];
      const metricsNotToInclude = [
        'Aircraft in Group',
        'Tracked Aircraft',
        'Total Monthly CO2 per ASK (g)',
        'Total Monthly CO2 per ASM (g)'
      ];
      if (!element || element.excelData.length === 0) {
        continue;
      }
      if (metricsNotToInclude.includes(metricName.toString())) {
        continue;
      }
      let skipHeaderRow = false;
      const portfolioElements = [portfolioDetails, comparisonPortfolioDetails];
      portfolioElements.forEach((portfolio) => {
        let jsonData: ExcelData[] = element.excelData.filter(
          (data: ExcelData) =>
            data['Portfolio'] === portfolio?.portfolioName &&
            data['Operator'] === portfolio?.operatorName &&
            data['Lessor'] === portfolio?.lessorName
        );
        if (portfolio?.groupByOptions?.filterIds?.length ?? 0 > 0) {
          const groupArray = portfolio?.groupByOptions?.value ?? [];
          const groupByOptions: string[] = [];
          groupArray.forEach((group) => {
            if (group !== null && group !== undefined) {
              groupByOptions.push(group.name);
            }
          });
          jsonData = jsonData.filter((data: ExcelData) => {
            const groupingString = data['Grouping'].toString();
            return groupByOptions.some((option) => option.includes(groupingString));
          });
        } else {
          jsonData = jsonData.filter((data: ExcelData) => data['Grouping'] === 'All aircraft');
        }
        if (jsonData.length === 0) {
          return;
        }
        jsonData = this.removeColumnsFromExcelData(jsonData, unwantedKeys);
        jsonData = this.removeDuplicates(jsonData);
        let jsonDataWithTotals!: Record<string, string | number>[];
        switch (metricName) {
          case 'Average Monthly Tracked Hours': {
            const totalMetricArray = totalMonthlyTrackedHoursArray;
            const divisorArray = trackedAircraftsArray;
            jsonDataWithTotals = this.addSummaryMetricsTotalRow(detailColumnCount, jsonData, totalMetricArray, divisorArray, portfolio);
            break;
          }
          case 'Average Monthly Tracked H/C Ratio': {
            const totalMetricArray = totalMonthlyTrackedHoursArray;
            const divisorArray = totalMonthlyTrackedCyclesArray;
            jsonDataWithTotals = this.addSummaryMetricsTotalRow(detailColumnCount, jsonData, totalMetricArray, divisorArray, portfolio);
            break;
          }
          case 'Average Monthly Tracked Cycles': {
            const totalMetricArray = totalMonthlyTrackedCyclesArray;
            const divisorArray = trackedAircraftsArray;
            jsonDataWithTotals = this.addSummaryMetricsTotalRow(detailColumnCount, jsonData, totalMetricArray, divisorArray, portfolio);
            break;
          }
          case 'Average Monthly CO2 per Seat (kg)': {
            const totalMetricArray = totalCo2KgPerSeat;
            const divisorArray = trackedAircraftsArray;
            jsonDataWithTotals = this.addSummaryMetricsTotalRow(detailColumnCount, jsonData, totalMetricArray, divisorArray, portfolio);
            break;
          }
          case 'Average Monthly CO2 per ASK (g)': {
            const totalMetricArray = totalCo2GPerAsk;
            const divisorArray = trackedAircraftsArray;
            jsonDataWithTotals = this.addSummaryMetricsTotalRow(detailColumnCount, jsonData, totalMetricArray, divisorArray, portfolio);
            break;
          }
          case 'Average Monthly CO2 per ASM (g)': {
            const totalMetricArray = totalCo2GPerAsm;
            const divisorArray = trackedAircraftsArray;
            jsonDataWithTotals = this.addSummaryMetricsTotalRow(detailColumnCount, jsonData, totalMetricArray, divisorArray, portfolio);
            break;
          }
          default:
            jsonDataWithTotals = this.addSummaryMetricsTotalRow(detailColumnCount, jsonData);
            break;
        }

        if (!skipHeaderRow) {
          const metricRow = [{ A: metricName, B: null, C: null }];
          xlsx.utils.sheet_add_json(worksheet, metricRow, {
            origin: { r: currentRowIndex, c: 0 }, // Add at the current row index
            skipHeader: true // No headers for this custom row
          });
          currentRowIndex++;
          const mergeMetric = { s: { r: currentRowIndex - 1, c: 0 }, e: { r: currentRowIndex - 1, c: detailColumnCount - 1 } };
          worksheet['!merges'] = [...(worksheet['!merges'] || []), mergeMetric];
        }
        xlsx.utils.sheet_add_json(worksheet, jsonDataWithTotals, { origin: { r: currentRowIndex, c: 0 }, skipHeader: skipHeaderRow });
        currentRowIndex += jsonDataWithTotals.length + 1;
        skipHeaderRow = true;
      });
      currentRowIndex += 2;
      element.excelData = this.removeColumnsFromExcelData(element.excelData, unwantedKeys);
      this.setColumnWidths(element, worksheet);
    }
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    return workbook;
  };

  removeDuplicates<T>(array: T[]): T[] {
    const seen = new Set<string>(); // To store serialized versions of objects
    const uniqueObjects: T[] = [];
    for (const obj of array) {
      const serializedObj = JSON.stringify(obj);
      if (!seen.has(serializedObj)) {
        seen.add(serializedObj);
        uniqueObjects.push(obj);
      }
    }
    return uniqueObjects;
  }

  removeColumnsFromExcelData(excelData: ExcelData[], columnsToRemove: string[]): ExcelData[] {
    excelData = excelData.map((item: ExcelData) => {
      columnsToRemove.forEach((key) => delete item[key]);
      return item;
    });
    return excelData;
  }

  calculateSum(array: ExcelData[], key: string): number {
    return array.reduce((sum, item) => {
      const value = parseFloat(item[key] as string);
      return !isNaN(value) ? sum + value : sum;
    }, 0);
  }

  // Function to calculate average of two arrays based on a common key
  calculateAverage(array1: ExcelData[], array2: ExcelData[], key: string): number {
    const sum = this.calculateSum(array1, key);
    const divisor = this.calculateSum(array2, key);
    return divisor === 0 ? 0 : +(sum / divisor).toFixed(2);
  }

  // Function to create a total row
  createTotalRow(
    sheetData: ExcelData[],
    totalRowArray?: ExcelData[],
    divisorArray?: ExcelData[],
    detailColumnCount = 0,
    selectedPortfolio?: PortfolioDetailOptions
  ): ExcelData {
    const totalRow: ExcelData = {};
    const worksheet = sheetData[0];
    const headers = Object.keys(worksheet);

    // Initialize totalRow with empty strings for each header
    headers.forEach((header) => (totalRow[header] = ''));

    if (totalRowArray && divisorArray) {
      totalRow[headers[0]] = 'Average ';
      let totalElement: ExcelData[] = [];
      let divisorElement: ExcelData[] = [];
      if (selectedPortfolio?.groupByOptions?.filterIds?.length ?? 0 > 0) {
        totalElement = this.filterSheetDataForTotalRow(totalRowArray, sheetData, false);
        divisorElement = this.filterSheetDataForTotalRow(divisorArray, sheetData, false);
      } else {
        totalElement = this.filterSheetDataForTotalRow(totalRowArray, sheetData, true);
        divisorElement = this.filterSheetDataForTotalRow(divisorArray, sheetData, true);
      }
      // Calculate the average for each column starting from the 4th column
      for (let i = detailColumnCount; i < headers.length; i++) {
        totalRow[headers[i]] = this.calculateAverage(totalElement, divisorElement, headers[i]);
      }

      totalRow[headers[detailColumnCount - 1]] = this.calculateAverage(totalElement, divisorElement, headers[detailColumnCount - 1]);
    } else {
      // Calculate totals for each column starting from the 4th column
      totalRow[headers[0]] = 'Total';
      let totalSum = 0;
      for (let i = detailColumnCount; i < headers.length; i++) {
        totalRow[headers[i]] = this.calculateSum(sheetData, headers[i]);
        totalSum += totalRow[headers[i]] as number;
      }
      totalRow[headers[detailColumnCount - 1]] = parseFloat((totalSum / (headers.length - detailColumnCount)).toFixed(2));
    }

    return totalRow;
  }
  filterSheetDataForTotalRow(element: ExcelData[], sheetData: ExcelData[], allAircrafts: boolean): ExcelData[] {
    let totalElement: ExcelData[];
    if (allAircrafts) {
      totalElement = element.filter((data) => data['Portfolio'] === sheetData[0]['Portfolio'] && data['Grouping'] === 'All aircraft');
    } else {
      totalElement = element.filter((data) => data['Portfolio'] === sheetData[0]['Portfolio'] && data['Grouping'] !== 'All aircraft');
    }
    const groupByOptions = this.getDistinctPropertyValues(sheetData, 'Grouping');
    if (groupByOptions.length > 0) {
      totalElement = totalElement.filter((data) => groupByOptions.includes(data['Grouping']));
    }
    if (sheetData[0]['Operator']) {
      totalElement = totalElement.filter((data) => data['Operator'] === sheetData[0]['Operator']);
    }
    if (sheetData[0]['Operator']) {
      totalElement = totalElement.filter((data) => data['Operator'] === sheetData[0]['Operator']);
    }
    if (sheetData[0]['Lessor']) {
      totalElement = totalElement.filter((data) => data['Lessor'] === sheetData[0]['Lessor']);
    }
    return totalElement;
  }
  addSummaryMetricsTotalRow(
    detailColumnCount: number,
    sheetData: ExcelData[],
    totalRowArray?: ExcelData[],
    divisorArray?: ExcelData[],
    selectedPortfolio?: PortfolioDetailOptions
  ): ExcelData[] {
    const totalRow = this.createTotalRow(sheetData, totalRowArray, divisorArray, detailColumnCount, selectedPortfolio);
    sheetData.push(totalRow);
    return sheetData;
  }

  createFilterCriteriaWorksheet = (
    workbook: xlsx.WorkBook,
    sheetName: string,
    tableData: Map<string, ExcelSheetData[]>,
    showDecimal?: boolean
  ): xlsx.WorkBook => {
    const worksheet = xlsx.utils.json_to_sheet([], {
      dateNF: 'dd-mmm-yyyy;@',
      cellDates: true,
      header: undefined // Headers will be added later
    });
    // Retrieve the first ExcelSheetData array entry from tableData
    const firstDataEntry = tableData.values().next().value;
    if (firstDataEntry) {
      firstDataEntry.forEach((element: ExcelSheetData, index: number) => {
        if (!element || element.excelData.length === 0) {
          return;
        }
        const jsonData = element.excelData;
        const headers = element.headersInOrder?.length ? element.headersInOrder : [];
        // Set the headers if it's the first element
        if (index === 0) {
          xlsx.utils.sheet_add_json(worksheet, jsonData, {
            header: headers,
            skipHeader: false,
            origin: -1 // Append headers at the top of the sheet
          });
        }
        this.setColumnWidths(element, worksheet);
        this.addRangeToWorksheet(jsonData, worksheet, element.excelNumberFormat, showDecimal);
      });
    }
    // Append the newly created worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    return workbook;
  };

  createMSNWorksheet(
    workbook: xlsx.WorkBook,
    sheetName: string,
    tableData: Map<string, ExcelSheetData[]>,
    metricOptions: MetricOptions,
    isEmissions: boolean,
    showDecimal?: boolean,
    portfolioDetails?: PortfolioDetailOptions,
    comparisonPortfolioDetails?: PortfolioDetailOptions
  ): xlsx.WorkBook {
    let portfolioDetailsObject = portfolioDetails;
    tableData.forEach((excelSheetDataArray, key) => {
      if (key.includes('MSN - ')) {
        const headers = excelSheetDataArray[0].headersInOrder || [];
        let tempHeaders: string[] = [];
        let tempMergedCells: string[] = [];
        if (isEmissions) {
          tempHeaders = ['TotalCO2EmissionPerKg', 'AverageCo2KgPerSeat', 'AverageCo2GPerAsk', 'AverageCo2GPerAsm', 'TrackedAircraft'];
          tempMergedCells = [
            'Total Monthly CO2 Emission(kg)',
            'Average Monthly CO2 per Seat (kg)',
            'Average Monthly CO2 per ASK (g)',
            'Average Monthly CO2 per ASM (g)',
            'Monthly Tracked Aircraft'
          ];
        } else {
          tempHeaders = ['TotalHours', 'TotalCycles', 'TotalHours&Cycles', 'TrackedAircraft'];
          tempMergedCells = [
            'Total Monthly Tracked Hours',
            'Total Monthly Tracked Cycles',
            'Average Monthly H/C Ratio',
            'Monthly Tracked Aircraft'
          ];
        }
        const sectionSize = (headers.length - 3) / tempHeaders.length;
        const excelDataArray = excelSheetDataArray[0].excelData;
        let sheetData = this.convertMetricValuesToExcelObject(excelDataArray[0] as {}[], headers, tempHeaders, sectionSize);
        sheetData = this.addHeaderRow(sheetData, excelSheetDataArray);
        sheetData = this.addMSNSheetTotalRow(sheetData);
        let ws = xlsx.utils.json_to_sheet(sheetData);
        // Store the current data in a temporary array
        const tempData = xlsx.utils.sheet_to_json(ws, { header: 1, range: ws['!ref'] });
        // getting portfolio details related to the current sheet
        const portfolioDetailRows = this.addPortfolioDetails(metricOptions, sheetData[0], portfolioDetailsObject);
        // Add the sportfolioDetailRows to the worksheet at the 'A1' origin
        xlsx.utils.sheet_add_json(ws, portfolioDetailRows, { skipHeader: true, origin: 'A2' });
        // Append the stored data back into the worksheet after the portfolioDetailRows
        const nextAvailableRow = portfolioDetailRows.length; // Number of portfolioDetailRows added
        xlsx.utils.sheet_add_json(ws, tempData, { skipHeader: true, origin: `A${nextAvailableRow + 1}` });
        //Delete excess rows
        ws = this.deleteRowsContainingText(ws, tempHeaders[0]);
        // Adjust column widths and create merged cells if needed
        ws = this.createMergedCells(ws, 5, sectionSize, tempHeaders, tempMergedCells);
        this.adjustMSNSheetColumnWidths(ws);
        // Append the worksheet to the workbook
        xlsx.utils.book_append_sheet(workbook, ws, key);
        portfolioDetailsObject = comparisonPortfolioDetails;
      }
    });

    return workbook;
  }

  convertMetricValuesToExcelObject(metricValues: {}[], headers: string[], tempHeaders: string[], sectionSize: number): ExcelData[] {
    const dataObjects: ExcelData[] = [];
    for (let index = 0; index < metricValues.length; index++) {
      const value = metricValues[index];
      let rowObject: ExcelData = {};
      for (let i = 0; i < headers.length; i++) {
        rowObject = this.createMetricBasedDistinctKeys(headers, value, rowObject, i, tempHeaders, sectionSize);
        // Convert values to numbers if possible
        for (const key in rowObject) {
          if (!isNaN(Number(rowObject[key]))) {
            rowObject[key] = Number(rowObject[key]);
          }
        }
      }
      dataObjects.push(rowObject);
    }
    return dataObjects;
  }

  createMetricBasedDistinctKeys(
    headers: string[],
    value: ExcelData,
    rowObject: ExcelData,
    i: number,
    suffixes: string[],
    sectionSize: number
  ): ExcelData {
    if (i < 3) {
      rowObject[headers[i]] = value[i];
    } else {
      const suffixIndex = Math.floor((i - 3) / sectionSize);
      rowObject[headers[i] + suffixes[suffixIndex]] = value[i];
    }
    return rowObject;
  }

  adjustMSNSheetColumnWidths(ws: xlsx.WorkSheet): xlsx.WorkSheet {
    if (!ws['!ref']) {
      return ws;
    }
    const range = xlsx.utils.decode_range(ws['!ref']);
    for (let c = range.s.c; c <= range.e.c; c++) {
      let maxColWidth = 0;
      for (let r = range.s.r; r <= range.e.r; r++) {
        const cellRef = xlsx.utils.encode_cell({ r, c });
        const cell = ws[cellRef];
        if (cell && cell.v) {
          const contentLength = cell.v.toString().length * 1.2;
          if (c < 3 && contentLength > maxColWidth) {
            maxColWidth = contentLength;
          } else if (c >= 3) {
            maxColWidth = 10;
          }
        }
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][c] = { wch: maxColWidth };
    }
    return ws;
  }

  createMergedCells(ws: xlsx.WorkSheet, rowNumber: number, sectionSize: number, suffixes: string[], cellValues: string[]): xlsx.WorkSheet {
    const merges = [];
    const startColumn = 3;
    for (let i = 0; i < suffixes.length; i++) {
      const startCol = startColumn + i * sectionSize;
      const endCol = startCol + sectionSize - 1;
      merges.push({ s: { r: rowNumber, c: startCol }, e: { r: rowNumber, c: endCol } });
    }
    ws['!merges'] = merges;

    merges.forEach((merge, index) => {
      const topLeftCellRef = xlsx.utils.encode_cell(merge.s);
      if (!ws[topLeftCellRef] || typeof ws[topLeftCellRef] === 'string') {
        ws[topLeftCellRef] = { t: 's', v: '', w: '' };
      }
      const topLeftCellValue = cellValues[index];

      for (let r = merge.s.r; r <= merge.e.r; r++) {
        for (let c = merge.s.c; c <= merge.e.c; c++) {
          const cellRef = xlsx.utils.encode_cell({ r, c });
          if (!ws[cellRef] || typeof ws[cellRef] === 'string') {
            ws[cellRef] = { t: 's', v: '', w: '' };
          }
          ws[cellRef].v = topLeftCellValue;
          ws[cellRef].w = topLeftCellValue;
          const cellStyle = ws[cellRef].s || {};
          cellStyle.font = { bold: true };
          cellStyle.alignment = { horizontal: 'center', vertical: 'middle' }; // Center align text
          ws[cellRef].s = cellStyle;
        }
      }
    });

    return ws;
  }

  deleteRowsContainingText(ws: xlsx.WorkSheet, text: string): xlsx.WorkSheet {
    if (ws['!ref']) {
      const range = xlsx.utils.decode_range(ws['!ref']);
      const rowsToDelete = [];
      // Find rows that contain the text in column D
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellRef = xlsx.utils.encode_cell({ r: R, c: 3 }); // Column D has index 3
        if (ws[cellRef] && String(ws[cellRef].v).includes(text)) {
          rowsToDelete.push(R);
        }
      }
      // Sort rows to delete in descending order
      rowsToDelete.sort((a, b) => b - a);
      // Delete rows starting from the bottom to avoid messing up the indices
      rowsToDelete.forEach((rowToDelete) => {
        this.deleteRow(ws, rowToDelete);
      });
    }
    return ws;
  }

  deleteRow(ws: xlsx.WorkSheet, row_index: number): xlsx.WorkSheet {
    if (!ws['!ref']) {
      return ws;
    }
    const range = xlsx.utils.decode_range(ws['!ref']);
    for (let R = row_index; R < range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const currentCell = xlsx.utils.encode_cell({ r: R, c: C });
        const nextCell = xlsx.utils.encode_cell({ r: R + 1, c: C });
        if (ws[nextCell]) {
          ws[currentCell] = ws[nextCell];
        } else {
          delete ws[currentCell];
        }
      }
    }
    range.e.r--;
    ws['!ref'] = xlsx.utils.encode_range(range);
    return ws;
  }

  addPortfolioDetails(
    metricOptions: MetricOptions,
    rowObject: {
      [key: string]: string | number;
    },
    portfolioDetailOptions?: PortfolioDetailOptions
  ): {}[] {
    // Create special rows with the required information
    const portfolioRow = [
      { Label: 'Portfolio', Value: portfolioDetailOptions?.portfolioName ? portfolioDetailOptions.portfolioName : '-' }
    ];
    const operatorRow = [{ Label: 'Operator', Value: portfolioDetailOptions?.operatorName ? portfolioDetailOptions.operatorName : '-' }];
    const lessorRow = [{ Label: 'Lessor', Value: portfolioDetailOptions?.lessorName ? portfolioDetailOptions.lessorName : '-' }];
    const startMonthRow = [
      { Label: 'Start Month', Value: this.buildMonthYearKey(metricOptions.startYear, metricOptions.startMonthIndex + 1) }
    ];
    const endMonthRow = [{ Label: 'End Month', Value: this.buildMonthYearKey(metricOptions.endYear, metricOptions.endMonthIndex + 1) }];
    const blankRow = [{}];

    // Create an array to hold the portfolio detail rows
    const portfolioDetailRows: ExcelData[] = [...portfolioRow, ...operatorRow, ...lessorRow, ...startMonthRow, ...endMonthRow, ...blankRow];
    portfolioDetailRows.forEach((row) => {
      Object.keys(rowObject).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(row, key)) {
          row[key] = ''; // Set to empty string or another placeholder value
        }
      });
    });

    return portfolioDetailRows;
  }

  addMSNSheetTotalRow(sheetData: Record<string, string | number>[]): Record<string, string | number>[] {
    const worksheet = sheetData[0];
    const headers = Object.keys(worksheet);
    const totalRow: ExcelData = {};
    // Initialize totalRow with empty strings for each header
    headers.forEach((header) => {
      totalRow[header] = '';
    });
    // Set the 'Total' label in the first cell
    totalRow[headers[0]] = 'Total';
    // Calculate totals for each column starting from the 4th column
    for (let i = 3; i < headers.length; i++) {
      let sum = 0;
      sheetData.forEach((row) => {
        const value = parseFloat(row[headers[i]] as string);
        if (!isNaN(value)) {
          sum += value;
        }
      });
      totalRow[headers[i]] = sum;
    }
    sheetData.push(totalRow);
    return sheetData;
  }

  addHeaderRow(sheetData: Record<string, string | number>[], excelSheetDataArray: {}[]): Record<string, string | number>[] {
    const newHeaderRow = (excelSheetDataArray[0] as { headersInOrder?: string[] }).headersInOrder || [];
    let rowObject: ExcelData = {};
    let index = 0;
    for (const [key] of Object.entries(sheetData[0])) {
      rowObject[key] = newHeaderRow[index];
      index++;
    }
    sheetData.unshift(rowObject);
    rowObject = {};
    index = 0;
    for (const [key] of Object.entries(sheetData[0])) {
      rowObject[key] = '';
      index++;
    }
    sheetData.unshift(rowObject);
    return sheetData;
  }

  exportExcelSheetDataForMetricsPage(
    tableData: Map<string, ExcelSheetData[]>,
    fileName: string,
    metricOptions: MetricOptions,
    isEmissions: boolean,
    showDecimal?: boolean,
    portfolioDetails?: PortfolioDetailOptions,
    comparisonPortfolioDetails?: PortfolioDetailOptions
  ): void {
    if (Array.from(tableData)[0][1].length < 1) {
      return;
    }
    let summaryComparisonDetailColumnCount = 3;
    if (portfolioDetails?.operatorId || comparisonPortfolioDetails?.operatorId) {
      summaryComparisonDetailColumnCount++;
    }
    if (portfolioDetails?.lessorId || comparisonPortfolioDetails?.lessorId) {
      summaryComparisonDetailColumnCount++;
    }
    import('xlsx').then((xlsx) => {
      let workbook = xlsx.utils.book_new();
      workbook = this.createFilterCriteriaWorksheet(workbook, 'Filter Criteria', tableData, showDecimal);
      workbook = this.createSummaryComparisonWorksheet(
        summaryComparisonDetailColumnCount,
        workbook,
        'Summary Comparison - Metrics',
        tableData,
        portfolioDetails,
        comparisonPortfolioDetails
      );
      workbook = this.createMSNWorksheet(
        workbook,
        'MSN Sheet',
        tableData,
        metricOptions,
        isEmissions,
        showDecimal,
        portfolioDetails,
        comparisonPortfolioDetails
      );
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(this.buildFileName(fileName), excelBuffer);
    });
  }

  styleMergedCells(ws: xlsx.WorkSheet): xlsx.WorkSheet {
    const merges = ws['!merges'] || [];
    merges.forEach((merge: xlsx.Range) => {
      const cellStyle = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
      for (let r = merge.s.r; r <= merge.e.r; r++) {
        for (let c = merge.s.c; c <= merge.e.c; c++) {
          const cellRef = xlsx.utils.encode_cell({ r, c });
          if (!ws[cellRef] || typeof ws[cellRef] === 'string') {
            ws[cellRef] = { t: 's', v: '', w: '' };
          }
          const currentCellStyle = ws[cellRef].s || {};
          ws[cellRef].s = { ...currentCellStyle, ...cellStyle };
        }
      }
    });
    return ws;
  }

  buildFileName(prefix: string): string {
    return `${prefix}_${dayjs().format(DateConstants.DDMMYYYY)}.xlsx`;
  }

  private saveAsExcelFile(fileName: string, buffer: any): void {
    const excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], {
      type: excelType
    });
    FileSaver.saveAs(data, fileName);
  }

  private setColumnWidths(data: ExcelSheetData, worksheet: any): void {
    const columnMaxWidths: number[] = this.autoSetColumnWidth(data);
    const margin = 5;
    const minWidth = 7;
    const worksheetCols = columnMaxWidths.map((columnMaxWidth: number) => ({
      width: columnMaxWidth <= minWidth ? columnMaxWidth + margin : columnMaxWidth
    }));
    worksheet['!cols'] = worksheetCols;
  }

  private toTitleCase(worksheetName: string): string {
    const originalNameIdx = worksheetName.indexOf('-') + 1;
    return worksheetName
      .slice(originalNameIdx)
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private autoSetColumnWidth(data: ExcelSheetData): number[] {
    const columnMaxWidths: number[] = [];
    const jsonData = data.excelData;
    this.setHeadersWidth(jsonData, columnMaxWidths);
    this.setColumnsWidth(jsonData, columnMaxWidths);
    return columnMaxWidths;
  }

  private setHeadersWidth(jsonData: any, columnMaxWidths: number[]): void {
    jsonData.forEach((data: any) => {
      const row = data;
      this.computeColumnWidth(Object.keys(row), columnMaxWidths);
    });
  }

  private setColumnsWidth(jsonData: any, columnMaxWidths: number[]): void {
    jsonData.forEach((data: any) => {
      const row = data;
      this.computeColumnWidth(Object.values(row), columnMaxWidths);
    });
  }

  private computeColumnWidth(objProps: any, columnMaxWidths: number[]): void {
    for (let j = 0; j < objProps.length; j++) {
      const value = objProps[j];
      if (value != null) {
        if (!(value instanceof Date)) {
          columnMaxWidths[j] = columnMaxWidths[j] >= String(value).length ? columnMaxWidths[j] : String(value).length + 1;
        }
      }
    }
  }

  private addRangeToWorksheet(jsonData: {}[], worksheet: xlsx.WorkSheet, excelNumberFormat: string, showDecimal?: boolean): void {
    if (showDecimal === undefined) {
      showDecimal = false;
    }
    const range = { start: { row: 1, col: 0 }, end: { row: jsonData.length, col: Object.keys(jsonData[0]).length } };
    for (let row = range.start.row; row <= range.end.row; ++row) {
      for (let column = range.start.col; column <= range.end.col; ++column) {
        const cell = worksheet[xlsx.utils.encode_cell({ r: row, c: column })];
        if (cell && cell.t === 'n' && !showDecimal) {
          cell.z = excelNumberFormat;
        }
      }
    }
  }

  private buildMonthYearKey(year: number, month: number): string {
    return dayjs(`${year}-${month}-01`).format(DateConstants.MMMYYYY);
  }

  private isEmptySheet(excelSheetData: Map<string, ExcelSheetData>): boolean {
    if (!excelSheetData || excelSheetData.size === 0) {
      return true;
    }
    for (const data of excelSheetData.values()) {
      if (data.excelData.length != 0) {
        return false;
      }
    }
    return true;
  }
}
