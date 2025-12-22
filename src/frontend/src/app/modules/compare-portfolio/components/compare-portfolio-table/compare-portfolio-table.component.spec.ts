import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableModule } from 'primeng/table';
import { ComparePortfolioTableComponent } from './compare-portfolio-table.component';
import { PrimeNGTableService } from '../../../shared/services/primeng-table-service';
import { ElementRef } from '@angular/core';

describe('ComparePortfolioTableComponent', () => {
  let component: ComparePortfolioTableComponent;
  let fixture: ComponentFixture<ComparePortfolioTableComponent>;
  let primeNGTableService: PrimeNGTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TableModule],
      declarations: [ComparePortfolioTableComponent],
      providers: [PrimeNGTableService],
    });
    fixture = TestBed.createComponent(ComparePortfolioTableComponent);
    component = fixture.componentInstance;
    primeNGTableService = TestBed.inject(PrimeNGTableService);

    const tableFixedHeader = [
      {
        field: 'Portfolio',
        header: 'Portfolio',
        width: '100',
        type: 'string',
      },
      {
        field: 'Grouping',
        header: 'Grouping',
        width: '100',
        type: 'string',
      },
      {
        field: 'Operator',
        header: 'Operator',
        width: '100',
        type: 'string',
      },
      {
        field: 'Lessor',
        header: 'Lessor',
        width: '100',
        type: 'string',
      },
    ];
    const twoMonthsDataHeaders = [
      {
        field: 'Jan 2024',
        header: 'Jan 2024',
        width: '100',
        type: 'number',
      },
      {
        field: 'Feb 2024',
        header: 'Feb 2024',
        width: '100',
        type: 'number',
      },
    ];
    component.tableHeaderArray = [...tableFixedHeader, ...twoMonthsDataHeaders];
    component.tableHeaders = [
      'Portfolio',
      'Grouping',
      'Operator',
      'Lessor',
      'Avg. of Selected Period',
      'Jan 2024',
      'Feb 2024',
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showSortIcon', () => {
    beforeEach(() => {
      component.comparePortfoliosDetailsTableContainer = new ElementRef({
        querySelectorAll: () => [
          { style: { display: 'block' } },
          { style: { display: 'block' } },
          { style: { display: 'block' } },
        ],
      });
    });

    it('should hide all sort icons except the selected one', () => {
      const mockSortIcons = [
        { style: { display: 'block' }, classList: { contains: () => true } },
        { style: { display: 'block' }, classList: { contains: () => true } },
        { style: { display: 'block' }, classList: { contains: () => true } },
      ];
      component.comparePortfoliosDetailsTableContainer = new ElementRef({
        querySelectorAll: () => mockSortIcons,
      });

      component.showSortIcon('Portfolio', 1);

      expect(mockSortIcons[0].style.display).toBe('none');
      expect(mockSortIcons[1].style.display).toBe('block');
      expect(mockSortIcons[2].style.display).toBe('none');
    });

    it('should not proceed if comparePortfoliosDetailsTableContainer is null', () => {
      component.comparePortfoliosDetailsTableContainer = new ElementRef(null); // Explicitly set to null
      const mockSortIcons = [
        { style: { display: 'block' }, classList: { contains: () => true } },
        { style: { display: 'block' }, classList: { contains: () => true } },
        { style: { display: 'block' }, classList: { contains: () => true } },
      ];
      component.showSortIcon('Portfolio', 1);

      expect(mockSortIcons[0].style.display).toBe('block');
      expect(mockSortIcons[1].style.display).toBe('block');
      expect(mockSortIcons[2].style.display).toBe('block');
    });
  });
});
