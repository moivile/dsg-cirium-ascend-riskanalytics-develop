import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as xlsx from 'xlsx';
import { ExcelSheetData } from '../models/excel-sheet-data';
import dayjs from 'dayjs';
import { DateConstants } from '../models/date-constants';

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
