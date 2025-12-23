import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { Aircraft } from '../../../shared/models/aircraft';
import { DetailsTableHeader } from '../../../shared/models/details-table-header';


@Injectable()
export class PortfolioOverviewDetailsTableService {

  tableHeaders!: DetailsTableHeader[];

  buildTableData(filteredPortfolioAircraft: Aircraft[]): [{}[],{}[]] {

    const tableData: {}[] = [];
    const excelData: {}[] = [];

    filteredPortfolioAircraft.forEach((aircraft: any) => {
      const tableRow: any = {};
      const excelRow: any = {};

      this.tableHeaders.forEach((tableHeader: any) => {
        if (tableHeader.type === 'date' && aircraft[tableHeader.field] !== null) {
          tableRow[tableHeader.field] = dayjs(aircraft[tableHeader.field]).toDate();
          excelRow[tableHeader.header] = dayjs(aircraft[tableHeader.field]).toDate();
        } else {
          tableRow[tableHeader.field] = aircraft[tableHeader.field];
          excelRow[tableHeader.header] = aircraft[tableHeader.field];
        }
      });

      tableData.push(tableRow);
      excelData.push(excelRow);
    });

    return [tableData,excelData];
  }

  setupTableHeaders(): DetailsTableHeader[] {
    this.tableHeaders = [
      {
        field: 'aircraftSeries',
        header: 'Series',
        width: '100',
        type: 'string'
      },
      {
        field: 'aircraftRegistrationNumber',
        header: 'Registration',
        width: '150',
        type: 'string'
      },
      {
        field: 'aircraftSerialNumber',
        header: 'Serial',
        width: '90',
        type: 'string'
      },
      {
        field: 'status',
        header: 'Status',
        width: '110',
        type: 'string'
      },
      {
        field: 'aircraftManufacturer',
        header: 'Manufacturer',
        width: '150',
        type: 'string'
      },
      {
        field: 'engineSeries',
        header: 'Engine Series',
        width: '100',
        type: 'string'
      },
      {
        field: 'aircraftUsage',
        header: 'Usage',
        width: '80',
        type: 'string'
      },
      {
        field: 'aircraftAgeYears',
        header: 'Age',
        width: '90',
        type: 'number',
        pipeFormat: '1.1'
      },
      {
        field: 'statusStartDate',
        header: 'In Service Date',
        width: '130',
        type: 'date',
      },
      {
        field: 'operator',
        header: 'Operator',
        width: '90',
        type: 'string'
      },
      {
        field: 'lessorOrganization',
        header: 'Lessor',
        width: '80',
        type: 'string'
      },
      {
        field: 'owner',
        header: 'Owner',
        width: '80',
        type: 'string'
      },
      {
        field: 'hours',
        header: 'Reported Hours',
        width: '140',
        type: 'number'
      },
      {
        field: 'cycles',
        header: 'Reported Cycles',
        width: '140',
        type: 'number'
      }
    ];

    return this.tableHeaders;
  }

}
