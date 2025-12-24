import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FleetInsightsTrendsService } from './fleet-insights-trends-service';
import { FleetInsightsTrendsSummaryRequest } from '../models/fleet-insights-trends-summary-request';
import { SummaryResponseModel } from '../models/summary-response-model';
import { GroupAllDataByOptions } from '../models/group-all-data-by';
import { IntervalType } from '../models/interval-type.enum';

describe('FleetInsightsTrendsService', () => {
  let service: FleetInsightsTrendsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FleetInsightsTrendsService],
    });
    service = TestBed.inject(FleetInsightsTrendsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTrendsSummaryData', () => {
    it('should fetch trends summary data successfully', () => {
      const mockRequest: FleetInsightsTrendsSummaryRequest = {
        grouping: 2,
        interval: 1,
        startMonthDate: '2025-01-01',
        endMonthDate: '2025-12-31',
      };

      const mockResponse: SummaryResponseModel = {
        summaryList: [
          {
            grouping: '2',
            values: [
              {
                year: 2025,
                timePoint: '2025-01-01',
                numberOfAircraft: 10,
                percentageOfTotal: 50,
              },
            ],
          },
        ],
      };

      service.getTrendsSummaryData(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        '/api/trends/summary?grouping=2&interval=1&startMonthDate=2025-01-01&endMonthDate=2025-12-31'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle invalid request parameters', () => {
      const mockRequest: FleetInsightsTrendsSummaryRequest = {
        grouping: GroupAllDataByOptions.AircraftType,
        interval: IntervalType.Monthly,
        startMonthDate: '',
        endMonthDate: '',
      };

      service.getTrendsSummaryData(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(
        '/api/trends/summary?grouping=10&interval=1&startMonthDate=&endMonthDate='
      );
      expect(req.request.method).toBe('GET');
      req.flush('', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle multiple grouping values in request', () => {
      const mockRequest: FleetInsightsTrendsSummaryRequest = {
        grouping: 2,
        interval: 1,
        startMonthDate: '2025-01-01',
        endMonthDate: '2025-12-31',
      };

      service.getTrendsSummaryData(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        '/api/trends/summary?grouping=2&interval=1&startMonthDate=2025-01-01&endMonthDate=2025-12-31'
      );
      expect(req.request.method).toBe('GET');
      req.flush('', { status: 404, statusText: 'Not Found' });
    });
  });
});
