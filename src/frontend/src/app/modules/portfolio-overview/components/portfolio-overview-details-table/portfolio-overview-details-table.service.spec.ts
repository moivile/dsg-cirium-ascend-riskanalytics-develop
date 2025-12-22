
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PortfolioOverviewDetailsTableService } from './portfolio-overview-details-table.service';
import { Aircraft } from '../../../shared/models/aircraft';

describe('PortfolioOverviewDetailsTableService', () => {

  let service: PortfolioOverviewDetailsTableService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('mockRouter', ['url']);

    TestBed.configureTestingModule({
      providers: [
        PortfolioOverviewDetailsTableService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(PortfolioOverviewDetailsTableService);
  });

  const filteredPortfolioAircraft: Aircraft[] = [
    {
      aircraftFamily: 'A320 Family',
      status: 'In Service',
      aircraftType: '737 Max',
      aircraftSeries: '737 Max',
      aircraftManufacturer: 'Boeing',
      aircraftMarketClass: 'Narrowbody Jets',
      aircraftRegistrationNumber: 'LN765',
      engineSeries: 'LEAP 1B',
      aircraftAgeYears: 25.6,
      operator: 'American Airlines',
      lessorOrganization: 'GECAS',
      aircraftSerialNumber: '4321',
      aircraftUsage: 'Passenger',
      owner: 'American Airlines',
      hours: 12764,
      cycles: 7432,
      statusStartDate: new Date('2021-07-20T08:35:20'),
    },
    {
      aircraftFamily: 'A320 Family',
      status: 'In Service',
      aircraftType: '737 Max',
      aircraftSeries: '737 Max',
      aircraftManufacturer: 'Boeing',
      aircraftMarketClass: 'Narrowbody Jets',
      aircraftRegistrationNumber: 'LN787',
      engineSeries: 'LEAP 1B',
      aircraftAgeYears: 22.5,
      operator: 'American Airlines',
      lessorOrganization: 'GECAS',
      aircraftSerialNumber: '8753',
      aircraftUsage: 'Passenger',
      owner: 'American Airlines',
      hours: 17434,
      cycles: 2568,
      statusStartDate: new Date('2021-07-20T08:35:20')
    }
  ] as Aircraft[];

  describe('buildTableData', () => {
    it('returns the details table data', () => {
      // arrange
      mockRouter.url = `airlines/-353/fleet`;

      // act
      service.setupTableHeaders();
      const tableData = service.buildTableData(filteredPortfolioAircraft)[0];

      // assert
      const expectedTableData: Aircraft[] = [
        {
          status: 'In Service',
          aircraftSeries: '737 Max',
          aircraftManufacturer: 'Boeing',
          aircraftRegistrationNumber: 'LN765',
          engineSeries: 'LEAP 1B',
          aircraftAgeYears: 25.6,
          operator: 'American Airlines',
          lessorOrganization: 'GECAS',
          aircraftSerialNumber: '4321',
          aircraftUsage: 'Passenger',
          owner: 'American Airlines',
          hours: 12764,
          cycles: 7432,
          statusStartDate: new Date('2021-07-20T08:35:20')
        },
        {
          status: 'In Service',
          aircraftSeries: '737 Max',
          aircraftManufacturer: 'Boeing',
          aircraftRegistrationNumber: 'LN787',
          engineSeries: 'LEAP 1B',
          aircraftAgeYears: 22.5,
          operator: 'American Airlines',
          lessorOrganization: 'GECAS',
          aircraftSerialNumber: '8753',
          aircraftUsage: 'Passenger',
          owner: 'American Airlines',
          hours: 17434,
          cycles: 2568,
          statusStartDate: new Date('2021-07-20T08:35:20'),
        }
      ] as Aircraft[];

      expect(tableData).toEqual(expectedTableData);
    });
  });

  describe('buildExcelSheetData', () => {
    it('returns the details excel table data ', () => {
      // act
      service.setupTableHeaders();
      const tableData = service.buildTableData(filteredPortfolioAircraft)[1];

      // assert
      const expectedTableData: {}[] = [
        {
          'Status': 'In Service',
          'Series': '737 Max',
          'Manufacturer': 'Boeing',
          'Registration': 'LN765',
          'Engine Series': 'LEAP 1B',
          'Age': 25.6,
          'Operator': 'American Airlines',
          'Lessor': 'GECAS',
          'Serial': '4321',
          'Usage': 'Passenger',
          'Owner': 'American Airlines',
          'Reported Hours': 12764,
          'Reported Cycles': 7432,
          'In Service Date': new Date('2021-07-20T08:35:20')
        },
        {
          'Status': 'In Service',
          'Series': '737 Max',
          'Manufacturer': 'Boeing',
          'Registration': 'LN787',
          'Engine Series': 'LEAP 1B',
          'Age': 22.5,
          'Operator': 'American Airlines',
          'Lessor': 'GECAS',
          'Serial': '8753',
          'Usage': 'Passenger',
          'Owner': 'American Airlines',
          'Reported Hours': 17434,
          'Reported Cycles': 2568,
          'In Service Date': new Date('2021-07-20T08:35:20'),
        }
      ];

      expect(tableData).toEqual(expectedTableData);
    });
  });
});
