import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SortEvent } from 'primeng/api';
import { combineLatest, Subscription, tap } from 'rxjs';
import { Aircraft } from '../../../shared/models/aircraft';
import { SortBy } from '../../models/sortBy';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { PrimeNGTableService } from '../../../shared/services/primeng-table-service';
import { Group } from '../portfolio-overview-grouping/group';
import { PortfolioOverviewTableService } from './portfolio-overview-table.service';
import { TableData } from './table-data';
import { PortfolioOverviewAgeTableService } from './portfolio-overview-age-table.service';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';
import { TableService } from './table-service';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { OperatorToggleValue } from '../../models/operator-toggle-value';

@Component({
    selector: 'ra-portfolio-overview-table[countBy]',
    templateUrl: './portfolio-overview-table.component.html',
    styleUrls: ['./portfolio-overview-table.component.scss'],
    providers: [PortfolioOverviewTableService, PrimeNGTableService, PortfolioOverviewAgeTableService, ExportExcelService],
    standalone: false
})
export class PortfolioOverviewTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() countBy!: string;
  @Input() pivot = false;
  @Input() pivotColumnHeader!: string;
  @Input() isModal = false;
  @Input() reorderedScrollableColumns!: string[];

  private sharedDataServiceSubscription!: Subscription;
  private sortBySubscription!: Subscription;
  private readonly columnWidths = 100; // set to same as column width in scss
  private readonly columnHeights = 28; // set to same as td height in scss
  private groupByName!: string;
  private selectedSortIcon!: any;
  private countByTableService!: TableService;

  sortBy!: SortBy;
  tableData!: TableData;
  groupColumnHeader!: string;
  scrollable!: boolean;
  scrollHeight!: string;
  frozenColumnWidth!: string;
  displayModal = false;
  modalTitle!: string;
  lessorTableId!: string;
  selectedColumnIndex!:number;

  @ViewChild('fleetTableContainer')
  fleetTableContainer!: ElementRef;

  @HostListener('window:resize')
  onResize(): void {
    if (this.fleetTableContainer) {
      const fleetTableContainerWidth = this.fleetTableContainer.nativeElement.offsetWidth;
      const tableWidth = this.tableData?.scrollableColumns.length * this.columnWidths + 120;
      this.scrollable = fleetTableContainerWidth <= tableWidth;
      if (this.isModal) {
        const tableContainerHeight = window.innerHeight - 200;
        this.scrollHeight = `${tableContainerHeight}px`;
        const tableHeight = this.tableData?.tableRows.length * this.columnHeights;
        this.scrollable = this.scrollable || tableHeight > tableContainerHeight;
      }
      setTimeout(() => {
        this.showSortIcon(this.sortBy.name);
      }, 0);
      if (this.reorderedScrollableColumns) {
        this.tableData.scrollableColumns = this.reorderedScrollableColumns;
      }
      this.frozenColumnWidth = this.isModal ? '10%' : '20%';
    }
  }

  constructor(
    private readonly portfolioOverviewStore: PortfolioOverviewStore,
    private readonly tableService: PortfolioOverviewTableService,
    private readonly primeNGTableService: PrimeNGTableService,
    private readonly ageTableService: PortfolioOverviewAgeTableService,
    private readonly exportExcelService: ExportExcelService
  ) {}

  ngOnInit(): void {
    this.sharedDataServiceSubscription = combineLatest([
      this.portfolioOverviewStore.filteredPortfolioAircraft$,
      this.portfolioOverviewStore.groupBy$,
      this.portfolioOverviewStore.operatorToggleValue$
    ])
      .pipe(
        tap(([portfolioAircraft, groupBy, selectedValue]) => {
          this.updateTableData(portfolioAircraft, groupBy, selectedValue);
          this.groupByName = groupBy?.groupName;
        })
      )
      .subscribe();

    this.sortBySubscription = this.portfolioOverviewStore.getSortOptionByKey(this.countBy).subscribe((sortBy) => {
      if (sortBy !== undefined) {
        this.sortBy = sortBy;
        this.showSortIcon(sortBy.name);
      }
    });
  }

  ngAfterViewInit(): void {
    this.showSortIcon(this.sortBy.name);
    if (this.isModal) {
      this.onResize();
    }
  }

  ngOnDestroy(): void {
    this.sharedDataServiceSubscription?.unsubscribe();
    this.sortBySubscription?.unsubscribe();
  }

  exportExcel(): void {
    let fileName;

    switch (this.countBy) {
      case 'status':
        fileName = this.exportExcelService.buildFileName('status');
        break;
      case 'aircraftAgeYears':
        fileName = this.exportExcelService.buildFileName('age');
        break;
      case 'operator':
        fileName = this.exportExcelService.buildFileName('operator');
        break;
      case 'lessorOrganization':
        fileName = this.exportExcelService.buildFileName('lessor');
        break;
      default:
        fileName = '';
        break;
    }

    const headersInOrder: any =
      this.countBy == 'lessorOrganization' || this.countBy == 'operator' ? this.tableData.frozenColumns : undefined;

    this.exportExcelService.exportExcel(this.tableData?.tableRows, fileName, this.countByTableService.excelNumberFormat, headersInOrder);
  }

  showModal(): void {
    if (this.countBy === 'aircraftAgeYears') {
      this.modalTitle = `Age Table`;
    } else if (this.countBy === 'lessorOrganization') {
      this.modalTitle = `Lessor Table`;
    } else {
      this.modalTitle = `${this.countBy[0].toUpperCase()}${this.countBy.slice(1)} Table`;
    }
    this.reorderedScrollableColumns = this.tableData?.scrollableColumns;
    this.displayModal = true;
  }

  onSort(name: string, sortDescending: boolean): void {
    const newSortBy: SortBy = {
      key: this.countBy,
      name,
      sortDescending
    };
    if (name !== this.sortBy.name || sortDescending !== this.sortBy.sortDescending) {
      this.portfolioOverviewStore.setSortBy(newSortBy);

      if (this.isModal && (name !== this.sortBy.name || sortDescending !== this.sortBy.sortDescending)) {
        this.portfolioOverviewStore.setSortBy(newSortBy);
      }

      this.sortBy.sortDescending = sortDescending;
    }
  }

  customSort(event: SortEvent, sortColumn: string): any {
    if (event.data) {
      event.data.sort((data1: any, data2: any) => {
        let value1;
        let value2;
        if (event.field) {
          value1 = data1[event.field];
          value2 = data2[event.field];
        }

        if (value1 === value2) {
          if (event.order === -1) {
            return data2[sortColumn] - data1[sortColumn];
          }

          return data1[sortColumn] - data2[sortColumn];
        }

        const result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

        return event.order ? event.order * result : 0;
      });
    }
  }

  showSortIcon(sortColumn: string): void {
    if (!this.fleetTableContainer) {
      return;
    }
    const columnIndex = this.tableData?.scrollableColumns.indexOf(sortColumn);
    const sortIcons = this.fleetTableContainer.nativeElement.querySelectorAll('.sort-icon');
    for (let index = 0; index < sortIcons.length; index++) {
      if (index !== columnIndex+1) {
        sortIcons[index].style.display = 'none';
      }
    }
    this.selectedSortIcon = sortIcons[columnIndex+1];
    this.selectedColumnIndex = columnIndex;

    this.primeNGTableService.showSortIcon(this.selectedSortIcon);
  }

  hoverSortIcon(sortColumn: string, mouseenter: boolean): void {
    if (!this.fleetTableContainer) {
      return;
    }
    if (this.tableData?.scrollableColumns.indexOf(sortColumn) === this.selectedColumnIndex) {
      return;
    }
    const sortIcons = this.fleetTableContainer.nativeElement.querySelectorAll('.sort-icon');
    const sortIcon = sortIcons[this.tableData?.scrollableColumns.indexOf(sortColumn) + 1];

    this.primeNGTableService.showHideHoverSortIcon(sortIcon, this.selectedSortIcon, mouseenter);
  }

  hoverEffectOnScrollableRow(rowName: string): void {
    const sortBy = this.pivot ? this.countBy : this.groupByName;
    const index = this.tableData?.tableRows.map((rowData: any) => rowData[sortBy]).indexOf(rowName);
    const frozenCell = this.fleetTableContainer.nativeElement.querySelectorAll('.column-overflow')[index];
    const row = this.fleetTableContainer.nativeElement.querySelectorAll('.group-row')[index];
    row.style.height = `${frozenCell.offsetHeight}px`;
  }

  removeHoverEffectOnScrollableRow(rowName: string): void {
    const sortBy = this.pivot ? this.countBy : this.groupByName;
    const index = this.tableData?.tableRows.map((rowData: any) => rowData[sortBy]).indexOf(rowName);
    const row = this.fleetTableContainer.nativeElement.querySelectorAll('.group-row')[index];
    row.style.height = '28px';
  }

  private updateTableData(filteredPortfolioAircraft: Aircraft[], groupBy: Group, selectedValue: OperatorToggleValue): void {
    if (this.countBy === 'aircraftAgeYears') {
      this.countByTableService = this.ageTableService;
      this.tableData = this.ageTableService.buildTableData(filteredPortfolioAircraft, groupBy);
      this.groupColumnHeader = groupBy?.displayName;
    } else {
      this.countByTableService = this.tableService;
      this.tableData = this.tableService.buildTableData(
        filteredPortfolioAircraft,
        groupBy,
        this.countBy,
        this.pivot,
        this.pivotColumnHeader,
        selectedValue
      );
      if (this.pivot) {
        this.groupColumnHeader = this.pivotColumnHeader;
      } else {
        this.groupColumnHeader = groupBy?.displayName;
      }
    }

    this.buildExportData();
    this.onResize();
  }

  private buildExportData(): void {
    const sheetNameByOrders = this.getSheetNameOrder(this.countBy);
    const excelData = {} as ExcelSheetData;
    excelData.excelData = this.tableData.tableRows;
    excelData.excelNumberFormat = this.countByTableService.excelNumberFormat;
    excelData.headersInOrder =
      this.countBy == 'lessorOrganization' || this.countBy == 'operator' ? this.tableData.frozenColumns : this.tableData.headersInOrder;
    excelData.isPivot = this.pivot;
    this.portfolioOverviewStore.setExcelSheetData({
      sheetName: sheetNameByOrders,
      excelData
    });
  }

  private getSheetNameOrder(sheetName: string): string {
    switch (sheetName) {
      case 'status':
        return '2-' + sheetName;
      case 'aircraftAgeYears':
        return '3-' + 'age';
      case 'lessorOrganization':
        return '6-' + 'lessor';
      case 'operator':
        return '5-' + sheetName;
      default:
        return '';
    }
  }
}
