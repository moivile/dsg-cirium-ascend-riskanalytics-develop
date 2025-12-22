import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SortBy } from '../../models/sortBy';
import { PortfolioOverviewDetailsTableService } from './portfolio-overview-details-table.service';
import { Aircraft } from '../../../shared/models/aircraft';
import { Subscription, tap } from 'rxjs';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { PrimeNGTableService } from '../../../shared/services/primeng-table-service';
import { Dialog } from 'primeng/dialog';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';
import { DetailsTableHeader } from '../../../shared/models/details-table-header';

@Component({
  selector: 'ra-portfolio-overview-details-table',
  templateUrl: './portfolio-overview-details-table.component.html',
  styleUrls: ['./portfolio-overview-details-table.component.scss'],
  providers: [PortfolioOverviewDetailsTableService, PrimeNGTableService, ExportExcelService]
})
export class PortfolioOverviewDetailsTableComponent implements OnInit, OnDestroy {
  @Input() isModal = false;

  sortBy!: SortBy;
  tableHeaders!: DetailsTableHeader[];
  tableData!: {}[];
  excelData!: {}[];
  tableWidth: string | undefined;
  tableHeight!: string;
  displayModal = false;
  modalTitle!: string;

  filteredPortfolioAircraft!: Aircraft[];

  private portfolioAircraftSubscription!: Subscription;
  private sortBySubscription!: Subscription;
  private selectedSortIconIndex = 0;

  @ViewChild('portfolioOverviewDetailsTableContainer')
  portfolioOverviewDetailsTableContainer!: ElementRef;

  @HostListener('window:resize')
  onResize(): void {
    setTimeout(() => {
      if (this.isModal) {
        this.tableWidth = 'auto';
        this.tableHeight = `${window.innerHeight - 200}px`;
      } else {
        this.tableWidth = document.getElementById('detailsRow')?.offsetWidth.toString();
      }
    }, 0);
  }

  constructor(
    private readonly portfolioOverviewStore: PortfolioOverviewStore,
    private readonly primeNGTableService: PrimeNGTableService,
    private readonly portfolioOverviewDetailsTableService: PortfolioOverviewDetailsTableService,
    private readonly exportExcelService: ExportExcelService
  ) {}

  ngOnInit(): void {
    new (window as any).ResizeObserver(() => window.dispatchEvent(new Event('resize'))).observe(document.getElementById('detailsRow'));

    this.portfolioAircraftSubscription = this.portfolioOverviewStore.filteredPortfolioAircraft$
      .pipe(
        tap((portfolioAircraft) => {
          if (portfolioAircraft.length) {
            this.buildDetailsTable(portfolioAircraft);
          }
        })
      )
      .subscribe();

    this.sortBySubscription = this.portfolioOverviewStore.getSortOptionByKey('details').subscribe((sortBy) => {
      if (sortBy !== undefined) {
        this.sortBy = {} as SortBy;
        this.sortBy = sortBy;
      }
    });
  }

  ngOnDestroy(): void {
    this.portfolioAircraftSubscription?.unsubscribe();
    this.sortBySubscription?.unsubscribe();
  }

  showSortIcon(sortColumn: string, indexNum: number): void {
    if (!this.portfolioOverviewDetailsTableContainer) {
      return;
    }
    const sortIcons = this.portfolioOverviewDetailsTableContainer.nativeElement.querySelectorAll('.sort-icon');
    for (let index = 0; index < sortIcons.length; index++) {
      if (index !== indexNum) {
        sortIcons[index].style.display = 'none';
      }
    }
    this.selectedSortIconIndex = indexNum;
    const selectedSortIcon = sortIcons[this.selectedSortIconIndex];

    this.primeNGTableService.showSortIcon(selectedSortIcon);
  }

  hoverSortIcon(sortColumn: string, indexNum: number, mouseenter: boolean): void {
    if (!this.portfolioOverviewDetailsTableContainer) {
      return;
    }
    if (indexNum === this.selectedSortIconIndex) {
      return;
    }
    const sortIcons = this.portfolioOverviewDetailsTableContainer.nativeElement.querySelectorAll('.sort-icon');
    const sortIcon = sortIcons[indexNum];
    const selectedSortIcon = sortIcons[this.selectedSortIconIndex];

    this.primeNGTableService.showHideHoverSortIcon(sortIcon, selectedSortIcon, mouseenter);
  }

  showModal(): void {
    this.displayModal = true;
  }
  closeModal(): void {
    this.displayModal = false;
  }

  maximizeModal(modal: Dialog): void {
    modal.maximize();
    new (window as any).ResizeObserver(() => window.dispatchEvent(new Event('resize'))).observe(document.getElementById('detailsRow'));
  }

  exportExcel(): void {
    this.buildExportData();
    const fileName = this.exportExcelService.buildFileName('details');
    this.exportExcelService.exportExcel(this.excelData, fileName, '0.0');
  }

  onSort(name: string, sortDescending: boolean): void {
    if (this.isModal && (name !== this.sortBy.name || sortDescending !== this.sortBy.sortDescending)) {
      this.portfolioOverviewStore.setSortBy({ key: 'details', name, sortDescending });
    }

    this.sortBy.sortDescending = sortDescending;
  }

  private buildDetailsTable(filteredPortfolioAircraft: any): void {
    this.filteredPortfolioAircraft = filteredPortfolioAircraft;
    this.tableHeaders = this.portfolioOverviewDetailsTableService.setupTableHeaders();
    const portfolioTableData = this.portfolioOverviewDetailsTableService.buildTableData(filteredPortfolioAircraft);
    this.tableData = portfolioTableData[0];
    this.excelData = portfolioTableData[1];
    this.setTableHeight();
    setTimeout(() => {
      this.showSortIcon(this.sortBy.name,this.selectedSortIconIndex);
    }, 5);
  }

  private setTableHeight(): void {
    setTimeout(() => {
      const rowHeight = 28;
      const hoverOverflowHeight = 100;
      const maxTableHeight = 600;
      const fullTableHeight = rowHeight * this.tableData.length + hoverOverflowHeight;
      this.tableHeight = fullTableHeight < maxTableHeight ? `${fullTableHeight}px` : `${maxTableHeight}px`;
    }, 0);
  }

  private buildExportData(): void {
    const excelData = {} as ExcelSheetData;
    excelData.excelData = this.excelData;
    excelData.excelNumberFormat = '0.0';
    excelData.isPivot = false;
    this.portfolioOverviewStore.setExcelSheetData({ sheetName: '6-Individual Aircraft Details', excelData });
  }
}
