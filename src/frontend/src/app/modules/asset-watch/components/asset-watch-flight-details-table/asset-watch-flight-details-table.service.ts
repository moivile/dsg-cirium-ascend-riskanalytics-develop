import { Injectable } from '@angular/core';
import { DetailsTableHeader } from '../../../../modules/shared/models/details-table-header';

@Injectable()
export class AssetWatchFlightDetailsTableService {
  tableHeaders!: DetailsTableHeader[];

  setupTableHeaders(): DetailsTableHeader[] {
    this.tableHeaders = [

      {
        field: 'departureDate',
        header: 'Departure Date',
        width: '80',
        type: 'date'
      },
      {
        field: 'lastOriginAirport',
        header: 'Last Origin Airport',
        width: '150',
        type: 'string'
      },
      {
        field: 'arrivalDate',
        header: 'Date of Arrival',
        width: '90',
        type: 'date'
      },
      {
        field: 'selectedAirport',
        header: 'Selected Airport',
        width: '100',
        type: 'string'
      },
      {
        field: 'selectedCountry',
        header: 'Selected Country/Subregion',
        width: '90',
        type: 'string'
      },
      {
        field: 'routeCategory',
        header: 'Route Category',
        width: '90',
        type: 'string'
      },

      {
        field: 'operationType',
        header: 'Operation Type',
        width: '90',
        type: 'string'
      },

      {
        field: 'flightHours',
        header: 'Flight Time (Hours)',
        width: '90',
        type: 'number'
      },

      {
        field: 'groundEventTime',
        header: 'Time on Ground (Hours)',
        width: '90',
        type: 'number'
      },

      {
        field: 'maintenanceActivity',
        header: 'Maintenance Activity',
        width: '90',
        type: 'string'
      },

      {
        field: 'nextDestinationAirport',
        header: 'Next Destination Airport',
        width: '80',
        type: 'string'
      }
    ];

    return this.tableHeaders;
  }
}
