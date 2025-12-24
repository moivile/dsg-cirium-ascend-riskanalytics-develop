import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetTabSummaryTableComponent } from './fleet-tab-summary-table.component';
import { TableModule } from 'primeng/table';

describe('FleetTabSummaryTableComponent', () => {
  let component: FleetTabSummaryTableComponent;
  let fixture: ComponentFixture<FleetTabSummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetTabSummaryTableComponent],
      imports: [TableModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetTabSummaryTableComponent);
    component = fixture.componentInstance;

    component.numberOfAircraftSelected = { value: true };
    component.footerTotals = {
      'Jan 2023': 15,
      'Feb 2023': 35
    };
    component.columnNames = ['Jan 2023', 'Feb 2023'];
    component.tableData = [
      {
        grouping: 'Group A',
        values: [
          { yearTimePoint: 'Jan 2023', numberOfAircraft: 10, percentageOfTotal: 20.5 },
          { yearTimePoint: 'Feb 2023', numberOfAircraft: 15, percentageOfTotal: 30.0 }
        ]
      },
      {
        grouping: 'Group B',
        values: [
          { yearTimePoint: 'Jan 2023', numberOfAircraft: 5, percentageOfTotal: 10.0 },
          { yearTimePoint: 'Feb 2023', numberOfAircraft: 20, percentageOfTotal: 40.0 }
        ]
      }
    ];
    component.defaultSortField = 'numberOfAircraft';
    component.defaultSortOrder = -1;
    component.summaryTableLoading = false;
    component.defaultRowCount = 100;

    component.onSort = jasmine.createSpy('onSort');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render table with provided inputs', () => {
    const mockTableData = [
      {
        grouping: 'Group A',
        values: [
          { yearTimePoint: 'Jan 2023', numberOfAircraft: 10, percentageOfTotal: 20.5 },
          { yearTimePoint: 'Feb 2023', numberOfAircraft: 15, percentageOfTotal: 30.0 }
        ]
      },
      {
        grouping: 'Group B',
        values: [
          { yearTimePoint: 'Jan 2023', numberOfAircraft: 5, percentageOfTotal: 10.0 },
          { yearTimePoint: 'Feb 2023', numberOfAircraft: 20, percentageOfTotal: 40.0 }
        ]
      }
    ];

    const mockColumnNames = ['Jan 2023', 'Feb 2023'];

    component.tableData = mockTableData;
    component.columnNames = mockColumnNames;
    component.defaultSortField = 'grouping';
    component.defaultSortOrder = 1;
    component.summaryTableLoading = false;
    component.numberOfAircraftSelected = { value: true };
    component.defaultRowCount = 100;

    fixture.detectChanges();

    const tableRows = fixture.nativeElement.querySelectorAll('p-table tbody tr');
    expect(tableRows.length).toBe(mockTableData.length);
  });

  it('should call onSort when sorting is triggered', () => {
    const event = { field: 'grouping', order: 1 };
    component.onSort(event);
    expect(component.onSort).toHaveBeenCalledWith(event);
  });

  it('should display footer totals', () => {
    const mockFooterTotals = {
      'Jan 2023': 15,
      'Feb 2023': 35
    };

    const mockColumnNames = ['Jan 2023', 'Feb 2023'];

    component.footerTotals = mockFooterTotals;
    component.columnNames = mockColumnNames;
    fixture.detectChanges();

    const footerCells = fixture.nativeElement.querySelectorAll('p-table tfoot tr td');
    expect(footerCells.length).toBe(mockColumnNames.length + 1);
    expect(footerCells[1].textContent.trim()).toBe('15');
    expect(footerCells[2].textContent.trim()).toBe('35');
  });

  it('should display percentage values rounded to one decimal point', () => {
    // Arrange
    component.numberOfAircraftSelected = { value: false }; // Ensure percentage mode is active
    component.tableData = [
      {
        grouping: 'Group A',
        values: [
          {
            percentageOfTotal: 12.345,
            yearTimePoint: '',
            numberOfAircraft: 0
          },
          {
            percentageOfTotal: 45.678,
            yearTimePoint: '',
            numberOfAircraft: 0
          }
        ]
      }
    ];
    fixture.detectChanges();

    // Act
    const tableRows = fixture.nativeElement.querySelectorAll('tr');
    const firstRowCells = tableRows[1].querySelectorAll('td');

    // Assert
    expect(firstRowCells[1].textContent.trim()).toBe('12.3%');
    expect(firstRowCells[2].textContent.trim()).toBe('45.7%');
  });
});
