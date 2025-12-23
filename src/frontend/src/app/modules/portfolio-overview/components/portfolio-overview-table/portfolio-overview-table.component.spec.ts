import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrimeNGTableService } from '../../../shared/services/primeng-table-service';
import { PortfolioOverviewTableComponent } from './portfolio-overview-table.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';
import { SortBy } from '../../models/sortBy';
import { BaseChartDirective } from 'ng2-charts';
import { TableModule } from 'primeng/table';
import { IsLastColumnPipe } from './table-is-last-column.pipe';
import { of } from 'rxjs';
import { PortfolioOverviewFilterExcelService } from '../portfolio-overview-filter/portfolio-overview-filter-excel-service';
import { ExportExcelService } from '../../../shared/services/export-excel-service';


describe('PortfolioOverviewTableComponent', () => {
  let component: PortfolioOverviewTableComponent;
  let fixture: ComponentFixture<PortfolioOverviewTableComponent>;
  let portfolioOverviewStoreSpy: PortfolioOverviewStore;

  beforeEach(async () => {
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);
    portfolioOverviewStoreSpy = jasmine.createSpyObj<PortfolioOverviewStore>('PortfolioOverviewStore', ['setSortBy', 'getSortOptionByKey']);
    (portfolioOverviewStoreSpy.getSortOptionByKey as jasmine.Spy).and.returnValue(of({
      key: 'status',
      name: 'Total',
      sortDescending: false,
    }));

    await TestBed.configureTestingModule({
      declarations: [
        PortfolioOverviewTableComponent,
        IsLastColumnPipe
      ],
      imports: [BaseChartDirective,
        TableModule],
      providers: [
        { provide: PortfolioOverviewStore, useValue: portfolioOverviewStoreSpy },
        PrimeNGTableService,
        { provide: PortfolioAircraftService, useValue: portfoliosServiceSpy },
        PortfolioOverviewFilterExcelService,
        ExportExcelService,
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
      .compileComponents();
    fixture = TestBed.createComponent(PortfolioOverviewTableComponent);
    component = fixture.componentInstance;
    component.tableData = {
      frozenColumns: ['Aircraft Family'],
      scrollableColumns: ['In Service', 'LOI to Option', 'Storage', 'On Option', 'On Order', 'Total'],
      tableRows:
        [
          { 'Aircraft Family': 'DC-4 Family', 'In Service': 0, 'LOI to Option': 0, Storage: 1, 'On Option': 0, 'On Order': 0, Total: 1 },
          { 'Aircraft Family': '787 Family', 'In Service': 1, 'LOI to Option': 2, Storage: 0, 'On Option': 1, 'On Order': 0, Total: 4 },
          { 'Aircraft Family': '737 Family', 'In Service': 0, 'LOI to Option': 0, Storage: 0, 'On Option': 0, 'On Order': 1, Total: 1 },
          { 'Aircraft Family': 'A320 Family', 'In Service': 1, 'LOI to Option': 0, Storage: 0, 'On Option': 0, 'On Order': 0, Total: 1 }
        ],
      totals: [{ 'Aircraft Family': 'Total', 'In Service': 2, 'LOI to Option': 2, Storage: 1, 'On Option': 1, 'On Order': 1, Total: 7 }],
      headersInOrder: ['Aircraft Family', 'In Service', 'LOI to Option', 'Storage', 'On Option', 'On Order', 'Total']
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('customSort', () => {
    it('should sort values in column by total if given field value is identical', () => {

      // arrange
      const event = {
        data: [
          { aircraftmasterseries: 'Il-76 MD', 'In Service': 15, Storage: 2, Total: 16 },
          { aircraftmasterseries: 'An-124 100', 'In Service': 7, Storage: 2, Total: 8 }
        ],
        field: 'Storage',
        order: 1
      };

      const sortColumn = 'Total';

      // act
      component.customSort(event, sortColumn);

      // assert
      const expectedEvent = {
        data: [
          { aircraftmasterseries: 'An-124 100', 'In Service': 7, Storage: 2, Total: 8 },
          { aircraftmasterseries: 'Il-76 MD', 'In Service': 15, Storage: 2, Total: 16 },
        ],
        field: 'Storage',
        order: 1
      };

      expect(event).toEqual(expectedEvent);

    });

    it('should sort values descending for given field', () => {

      // arrange
      const event = {
        data: [
          { aircraftmasterseries: 'Il-76 MD', 'In Service': 15, Storage: 2, Total: 16 },
          { aircraftmasterseries: 'An-124 100', 'In Service': 7, Storage: 2, Total: 8 },
          { aircraftmasterseries: 'Kon-124 170', 'In Service': 14, Storage: 3, Total: 17 }
        ],
        field: 'In Service',
        order: -1
      };

      const sortColumn = 'Total';

      // act
      component.customSort(event, sortColumn);

      // assert
      const expectedEvent = {
        data: [
          { aircraftmasterseries: 'Il-76 MD', 'In Service': 15, Storage: 2, Total: 16 },
          { aircraftmasterseries: 'Kon-124 170', 'In Service': 14, Storage: 3, Total: 17 },
          { aircraftmasterseries: 'An-124 100', 'In Service': 7, Storage: 2, Total: 8 }
        ],
        field: 'In Service',
        order: -1
      };

      expect(event).toEqual(expectedEvent);

    });
  });

  describe('hoverSortIcon', () => {
    it('should update the sort order in the store if it is different from the current sort order', () => {
      const newSortBy: SortBy = { key: 'status', name: 'Total', sortDescending: true };
      component.countBy = 'status';
      component.sortBy = { key: 'status', name: 'Total', sortDescending: false };
      component.onSort('Total', true);

      expect(portfolioOverviewStoreSpy.setSortBy).toHaveBeenCalledWith(newSortBy);
      expect(component.sortBy).toEqual(newSortBy);
    });

    it('should not update the sort order in the store if it is the same as the current sort order in a modal', () => {
      const newSortBy: SortBy = { key: 'status', name: 'Total', sortDescending: true };
      component.countBy = 'status';
      component.sortBy = { key: 'status', name: 'Total', sortDescending: true };
      component.isModal = true;
      component.onSort('Total', true);

      expect(portfolioOverviewStoreSpy.setSortBy).not.toHaveBeenCalled();
      expect(component.sortBy).toEqual(newSortBy);
    });
  });
});
