import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FleetInsightsService } from './fleet-insights-service';
import { FleetInsightsAircraftFilterResponseModel } from '../models/fleet-insights-aircraft-filter-response.model';
import { FleetInsightsAircraftSummaryRequest } from '../models/fleet-insights-aircraft-summary-request';

describe('FleetInsightsService', () => {
  let service: FleetInsightsService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/fleet-insights';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FleetInsightsService]
    });

    service = TestBed.inject(FleetInsightsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAircraftFilterData', () => {
    it('should fetch aircraft filter data', () => {
      const mockRequest = {
        statusIds: [1, 2],
        primaryUsageIds: [100],
        marketClassIds: [200, 201]
      };
      const mockResponse: FleetInsightsAircraftFilterResponseModel = {
        statuses: [
          { id: 1, name: 'In Service' },
          { id: 2, name: 'Storage' }
        ],
        primaryUsages: [{ id: 100, name: 'Passenger' }],
        marketClasses: [
          { id: 200, name: 'Narrowbody' },
          { id: 201, name: 'Widebody' }
        ]
      };

      service.getAircraftFilterData(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.statuses?.length).toBe(2);
        expect(response.marketClasses?.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/filters?statusIds=1&statusIds=2&primaryUsageIds=100&marketClassIds=200&marketClassIds=201');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching aircraft filter data fails', () => {
      const mockRequest = {
        statusIds: [1, 2],
        primaryUsageIds: [100],
        marketClassIds: [200, 201]
      };

      service.getAircraftFilterData(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/filters?statusIds=1&statusIds=2&primaryUsageIds=100&marketClassIds=200&marketClassIds=201');
      expect(req.request.method).toBe('GET');
      req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getAircraftSummaryData', () => {
    it('should fetch aircraft summary data with correct format', () => {
      const mockRequest: FleetInsightsAircraftSummaryRequest = {
        grouping: 2,
        sortBy: 1,
        sortDirectionAscending: false,
        startAge: 0,
        endAge: 0,
        includeYoungLifeAircraft: false,
        includeMidLifeAircraft: false,
        includeLateLifeAircraft: false
      };

      const mockResponse = {
        aircraftSummaryList: [
          {
            grouping: 'Narrowbody Jets',
            numberOfAircraft: 33452,
            percentageOfTotal: 57
          },
          {
            grouping: 'Widebody Jets',
            numberOfAircraft: 9501,
            percentageOfTotal: 16.2
          },
          {
            grouping: 'Regional Jets',
            numberOfAircraft: 8674,
            percentageOfTotal: 14.8
          },
          {
            grouping: 'Regional Turboprops',
            numberOfAircraft: 7096,
            percentageOfTotal: 12.1
          }
        ],
        skip: 0,
        take: 100,
        totalCount: 4
      };

      service.getAircraftSummaryData(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.aircraftSummaryList?.length).toBe(4);
        expect(response.aircraftSummaryList?.[0].grouping).toBe('Narrowbody Jets');
        expect(response.aircraftSummaryList?.[0].numberOfAircraft).toBe(33452);
        expect(response.aircraftSummaryList?.[0].percentageOfTotal).toBe(57);
      });

      const req = httpMock.expectOne(
        '/api/distribution/summary?grouping=2&sortBy=1&sortDirectionAscending=false&startAge=0&endAge=0&includeYoungLifeAircraft=false&includeMidLifeAircraft=false&includeLateLifeAircraft=false'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching aircraft summary data fails', () => {
      const mockRequest: FleetInsightsAircraftSummaryRequest = {
        grouping: 2,
        sortBy: 1,
        sortDirectionAscending: false,
        startAge: 0,
        endAge: 0,
        includeYoungLifeAircraft: false,
        includeMidLifeAircraft: false,
        includeLateLifeAircraft: false
      };

      service.getAircraftSummaryData(mockRequest).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(
        '/api/distribution/summary?grouping=2&sortBy=1&sortDirectionAscending=false&startAge=0&endAge=0&includeYoungLifeAircraft=false&includeMidLifeAircraft=false&includeLateLifeAircraft=false'
      );
      expect(req.request.method).toBe('GET');
      req.flush('', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('toHttpParams', () => {
    it('should convert object to HttpParams', () => {
      const mockRequest = {
        param1: 'value1',
        arrayParam: ['item1', 'item2'],
        nullParam: null
      };

      const params = service['toHttpParams'](mockRequest);
      expect(params.get('param1')).toBe('value1');
      expect(params.getAll('arrayParam')).toEqual(['item1', 'item2']);
      expect(params.has('nullParam')).toBeFalse();
    });
  });
});
