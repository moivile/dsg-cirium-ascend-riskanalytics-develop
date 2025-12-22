import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssetWatchExportExcelService } from './asset-watch-export-excel.service';
import { ExportExcelService } from '../../shared/services/export-excel-service';
import { AssetWatchStore } from './asset-watch-store';
import { AssetWatchGridRequest } from '../models/asset-watch-grid-request';
import { ChartInputData } from '../models/chart-input-data';
import { AssetWatchSummaryRequest } from '../models/asset-watch-summary-request';
import { AppStore } from 'src/app/app-store';
import { PortfoliosService } from '../../shared/services/portfolios.service';
import { MessageService } from 'primeng/api';
import { AppUserService } from '../../../app-user.service';

describe('AssetWatchExportExcelService', () => {
  let service: AssetWatchExportExcelService;
  let exportExcelService: jasmine.SpyObj<ExportExcelService>;

  beforeEach(() => {
    const exportExcelServiceSpy = jasmine.createSpyObj('ExportExcelService', ['buildFileName', 'exportExcelSheetData']);
    const assetWatchStoreSpy = jasmine.createSpyObj('AssetWatchStore', [], {
      filterOptions$: of({}),
      portfolios$: of([]),
      maintenanceActivities$: of([])
    });
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolios']);

    TestBed.configureTestingModule({
      providers: [
        AssetWatchExportExcelService,
        { provide: ExportExcelService, useValue: exportExcelServiceSpy },
        { provide: AssetWatchStore, useValue: assetWatchStoreSpy },
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        AppStore,
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } }
      ]
    });

    service = TestBed.inject(AssetWatchExportExcelService);
    exportExcelService = TestBed.inject(ExportExcelService) as jasmine.SpyObj<ExportExcelService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should export details table excel', (done) => {
    exportExcelService.buildFileName.and.returnValue('filename');
    exportExcelService.exportExcelSheetData.and.returnValue(undefined);

    service.exportDetailsTableExcel([], {} as AssetWatchGridRequest).subscribe(() => {
      expect(exportExcelService.buildFileName).toHaveBeenCalled();
      expect(exportExcelService.exportExcelSheetData).toHaveBeenCalled();
      done();
    });
  });

  it('should export flight details table excel', (done) => {
    exportExcelService.buildFileName.and.returnValue('filename');
    exportExcelService.exportExcelSheetData.and.returnValue(undefined);

    service.exportFlightDetailsTableExcel([], '123', {} as AssetWatchGridRequest).subscribe(() => {
      expect(exportExcelService.buildFileName).toHaveBeenCalled();
      expect(exportExcelService.exportExcelSheetData).toHaveBeenCalled();
      done();
    });
  });

  it('should export summary excel', (done) => {
    exportExcelService.buildFileName.and.returnValue('filename');
    exportExcelService.exportExcelSheetData.and.returnValue(undefined);

    service
      .exportSummaryExcel(
        { labels: [] } as unknown as ChartInputData,
        { labels: [] } as unknown as ChartInputData,
        {} as AssetWatchSummaryRequest
      )
      .subscribe(() => {
        expect(exportExcelService.buildFileName).toHaveBeenCalled();
        expect(exportExcelService.exportExcelSheetData).toHaveBeenCalled();
        done();
      });
  });
});
