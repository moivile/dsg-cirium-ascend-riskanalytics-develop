import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { PrimeNGTableService } from '../../../shared/services/primeng-table-service';
import { Dialog } from 'primeng/dialog';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { DetailsTableHeader } from '../../../shared/models/details-table-header';

export interface SortBy {
  key: string;
  name: string;
  sortDescending: boolean;
}

@Component({
  selector: 'ra-compare-portfolio-table',
  templateUrl: './compare-portfolio-table.component.html',
  styleUrls: ['./compare-portfolio-table.component.scss'],
  providers: [PrimeNGTableService]
})
export class ComparePortfolioTableComponent implements OnInit, OnChanges {
  @Input() isModal = false;
  @Input() metricDetailsTable!: { [key: string]: string | number }[];
  @Input() tableHeaders!: string[];
  tableData!: {}[];
  sortBy!: SortBy;
  tableWidth: string | undefined;
  tableHeight!: string;
  modalTitle!: string;
  tableHeaderArray!: DetailsTableHeader[];
  displayModal = false;
  displayTable = false;

  @ViewChild('comparePortfoliosDetailsTableContainer')
  comparePortfoliosDetailsTableContainer!: ElementRef;
  private selectedSortIconIndex!: number;

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

  constructor(private readonly primeNGTableService: PrimeNGTableService) {}

  ngOnInit(): void {
    this.tableHeaderArray = this.setupTableHeaders();
    if (this.tableHeaderArray.length > 0) {
      this.displayTable = true;
    }
    this.onResize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metricDetailsTable']) {
      this.metricDetailsTable = changes['metricDetailsTable'].currentValue;
      this.tableHeaderArray = this.setupTableHeaders();
      this.displayTable = true;
      this.onResize();
    }
  }

  showSortIcon(sortColumn: string, indexNum: number): void {
    if (!this.comparePortfoliosDetailsTableContainer?.nativeElement) {
      return;
    }
    const sortIcons = this.comparePortfoliosDetailsTableContainer.nativeElement.querySelectorAll('.sort-icon');
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
    if (!this.comparePortfoliosDetailsTableContainer) {
      return;
    }
    if (indexNum === this.selectedSortIconIndex) {
      return;
    }
    const sortIcons = this.comparePortfoliosDetailsTableContainer.nativeElement.querySelectorAll('.sort-icon');
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

  setupTableHeaders(): DetailsTableHeader[] {
    const additionalHeaders = this.tableHeaders.slice(5).map((element) => ({
      field: element,
      header: element,
      width: '100',
      type: 'number'
    }));

    const tableArray = [
      {
        field: 'Portfolio',
        header: 'Portfolio',
        width: '100',
        type: 'string'
      },
      {
        field: 'Grouping',
        header: 'Grouping',
        width: '100',
        type: 'string'
      },
      {
        field: 'Operator',
        header: 'Operator',
        width: '100',
        type: 'string'
      },
      {
        field: 'Lessor',
        header: 'Lessor',
        width: '100',
        type: 'string'
      },
      {
        field: 'Avg. of Selected Period',
        header: 'Avg. of Selected Period',
        width: '135',
        type: 'number'
      }
    ];

    return [...tableArray, ...additionalHeaders];
  }
}
