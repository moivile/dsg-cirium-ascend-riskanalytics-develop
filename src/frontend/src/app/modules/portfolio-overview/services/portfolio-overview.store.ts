
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { Portfolio } from '../../shared/models/portfolio';
import { PortfoliosService } from '../../shared/services/portfolios.service';
import { filter, map, Observable, switchMap } from 'rxjs';
import { Group } from '../components/portfolio-overview-grouping/group';
import { SortBy } from '../models/sortBy';
import { Aircraft } from '../../shared/models/aircraft';
import { PortfolioAircraftService } from '../../shared/services/portfolio-aircraft.service';
import { ExcelSheetData } from '../../shared/models/excel-sheet-data';
import { OperatorToggleValue } from '../models/operator-toggle-value';
export interface PortfolioOverviewState {
  portfolio: Portfolio;
  groupBy: Group
  sortBys: SortBy[]
  portfolioAircraft: Aircraft[]
  filteredPortfolioAircraft: Aircraft[]
  excelSheetData: Map<string, ExcelSheetData>
  operatorToggleValue: OperatorToggleValue
}
export const initialState: PortfolioOverviewState = {
  portfolio: {
    id: 0,
    name: '',
    dateModified: '',
    dateCreated: '',
    numberOfAircraft: 0
  },
  groupBy: {
    displayName: '',
    groupName: ''
  },
  sortBys: [
    {
      key: 'status',
      name: 'Total',
      sortDescending: true
    },
    {
      key: 'aircraftAgeYears',
      name: 'Mean',
      sortDescending: false
    },
    {
      key: 'operator',
      name: 'Total',
      sortDescending: true
    },
    {
      key: 'lessorOrganization',
      name: 'Total',
      sortDescending: true
    },
    {
      key: 'details',
      name: 'aircraftSeries',
      sortDescending: false
    }
  ],
  portfolioAircraft: [],
  filteredPortfolioAircraft: [],
  excelSheetData: new Map(),
  operatorToggleValue: OperatorToggleValue.Name
};
@Injectable()
export class PortfolioOverviewStore extends ComponentStore<PortfolioOverviewState> {

  constructor(private readonly portfoliosService: PortfoliosService,
    private readonly portfolioAircraftService: PortfolioAircraftService) {
    super(initialState);
  }

  readonly portfolio$ = this.select((state) => state.portfolio);
  readonly setPortfolio = this.updater((state, portfolio: Portfolio) => ({
    ...state,
    portfolio,
  }));

  readonly groupBy$ = this.select((state) => state.groupBy);
  readonly setGroupBy = this.updater((state, groupBy: Group) => ({
    ...state,
    groupBy,
  }));

  readonly portfolioAircraft$ = this.select((state) => state.portfolioAircraft);
  readonly setPortfolioAircraft = this.updater((state, portfolioAircraft: Aircraft[]) => ({
    ...state,
    portfolioAircraft,
  }));

  readonly filteredPortfolioAircraft$ = this.select((state) => state.filteredPortfolioAircraft);
  readonly setFilteredPortfolioAircraft = this.updater((state, filteredPortfolioAircraft: Aircraft[]) => ({
    ...state,
    filteredPortfolioAircraft,
  }));

  readonly operatorToggleValue$ = this.select((state) => state.operatorToggleValue);
  readonly setOperatorToggleValue = this.updater((state, operatorToggleValue: OperatorToggleValue) => ({
    ...state,
    operatorToggleValue,
  }));

  readonly excelSheetData$: Observable<Map<string, ExcelSheetData>> = this.select((state) => state.excelSheetData);

  readonly setExcelSheetData = this.updater((state, payload: { sheetName: string, excelData: ExcelSheetData }) => {
    const { sheetName, excelData } = payload;
    const newExcelSheetData = new Map(state.excelSheetData);
    newExcelSheetData.set(sheetName, excelData);
    return { ...state, excelSheetData: newExcelSheetData };
  });

  readonly loadPortfolio = this.effect<number>((portfolioId$: Observable<number>) => {
    return portfolioId$.pipe(
      switchMap((portfolioId) =>
        this.portfoliosService.getPortfolio(portfolioId).pipe(
          tapResponse(
            (portfolio) => this.setPortfolio(portfolio),
            () => console.log('error loading portfolio')
          )
        )
      )
    );
  });

  readonly loadPortfolioAircraft = this.effect<number>((portfolioId$: Observable<number>) => {
    return portfolioId$.pipe(
      switchMap((portfolioId) =>
        this.portfolioAircraftService.getPortfolioAircraft(portfolioId).pipe(
          tapResponse(
            (portfolio) => this.setPortfolioAircraft(portfolio),
            () => console.log('error loading portfolio aircraft list')
          )
        )
      )
    );
  });

  readonly setSortBy = this.updater((state, newSortBy: SortBy) => {
    const index = state.sortBys.findIndex(sortBy => sortBy.key === newSortBy.key);

    if (index === -1) {
      state.sortBys.push(newSortBy);
    } else {
      state.sortBys[index] = newSortBy;
    }

    return state;
  });

  readonly getSortOptionByKey = (key: string): Observable<SortBy | undefined> => {
    return this.select((state) => state.sortBys.find((option) => option.key === key)).pipe(
      filter((option) => option !== undefined),
      map((option) => option as SortBy)
    );
  };

}
