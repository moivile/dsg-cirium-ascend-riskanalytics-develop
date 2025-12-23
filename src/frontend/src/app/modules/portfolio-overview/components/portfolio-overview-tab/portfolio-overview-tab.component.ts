import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject, filter, map, skip, take, takeUntil, tap } from 'rxjs';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { OperatorToggleValue } from '../../models/operator-toggle-value';
import { AppStore } from 'src/app/app-store';

@Component({
    selector: 'ra-portfolio-overview-tab',
    templateUrl: './portfolio-overview-tab.component.html',
    styleUrls: ['./portfolio-overview-tab.component.scss'],
    providers: [PortfolioOverviewStore, ExportExcelService],
    standalone: false
})
export class PortfolioOverviewTabComponent implements OnInit, OnDestroy {
  filterExpanded = true;
  filterExpandedCollapsedClass!: string;
  filterPanelExpandedCollapsedClass!: string;
  expandCollapseButtonHoverText = 'Collapse';
  isTabletScreenSize!: boolean;
  isOneColumnLayout!: boolean;
  comparePageLink!: string;
  assetWatchPageLink!: string;
  selectedValue = OperatorToggleValue.Name;
  private destroy$ = new Subject<void>();

  @HostListener('window:resize')
  onResize(): void {
    this.isOneColumnLayout = window.innerWidth < 1280;
    this.isTabletScreenSize = window.innerWidth >= 640 && window.innerWidth < 1024;
  }
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    public portfolioOverviewStore: PortfolioOverviewStore,
    private readonly exportExcelService: ExportExcelService,
    private readonly router: Router,
    private readonly appStore: AppStore
  ) {}

  ngOnInit(): void {
    this.appStore.selectedPortfolioId$
      .pipe(
        takeUntil(this.destroy$),
        skip(1),
        filter((id) => !!id),
        tap((id) => {
          this.router.navigate(['/portfolios', id]);
        })
      )
      .subscribe();

    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroy$),
        map((params: Params): number => {
          return params['id'];
        }),
        tap((portfolioId) => {
          this.portfolioOverviewStore.loadPortfolio(portfolioId);
          this.portfolioOverviewStore.loadPortfolioAircraft(portfolioId);
        })
      )
      .subscribe();
  }

  expandCollapseFilterPanel(): void {
    this.filterExpanded = !this.filterExpanded;

    if (this.filterExpanded) {
      this.expandCollapseButtonHoverText = 'Collapse';
      this.filterPanelExpandedCollapsedClass = 'overview-filter-panel__expanded';
      this.filterExpandedCollapsedClass = 'overview-filter__expanded';
    } else {
      this.expandCollapseButtonHoverText = 'Expand';
      this.filterExpandedCollapsedClass = 'overview-filter__collapsed';
      this.filterPanelExpandedCollapsedClass = 'overview-filter-panel__collapsed';
    }
  }

  exportExcel(): void {
    const fileName = this.exportExcelService.buildFileName('portfolio-overview');
    this.portfolioOverviewStore.excelSheetData$
      .pipe(
        take(1),
        tap((tableData) => {
          if (tableData) {
            this.exportExcelService.exportExcelSheetData(tableData, fileName);
          }
        })
      )
      .subscribe();
  }

  toggleSelectedOperatorValue(selectedValue: OperatorToggleValue): void {
    this.portfolioOverviewStore.setOperatorToggleValue(selectedValue);
  }

  get OperatorToggleValue(): typeof OperatorToggleValue {
    return OperatorToggleValue;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
