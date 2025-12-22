import { Injectable } from '@angular/core';
import { DetailsTableHeader } from '../../../shared/models/details-table-header';
import { AssetWatchGridRequest } from '../../models/asset-watch-grid-request';

@Injectable()
export class AssetWatchDetailsTableService {
  tableHeaders!: DetailsTableHeader[];

  setupTableHeaders(request?: AssetWatchGridRequest): DetailsTableHeader[] {
    this.tableHeaders = [
      {
        field: 'aircraftSerialNumber',
        header: 'Serial',
        width: '90',
        type: 'string'
      },
      {
        field: 'aircraftRegistrationNumber',
        header: 'Registration',
        width: '150',
        type: 'string'
      },
      {
        field: 'aircraftSeries',
        header: 'Aircraft Series',
        width: '100',
        type: 'string'
      },
      {
        field: 'aircraftStatus',
        header: 'Status',
        width: '90',
        type: 'string'
      },
      {
        field: 'operatorName',
        header: 'Operator',
        width: '90',
        type: 'string'
      },
      {
        field: 'managerName',
        header: 'Manager',
        width: '90',
        type: 'string'
      },

      {
        field: 'numberOfFlights',
        header: 'Total Flights',
        width: '90',
        type: 'number',
        hidden: !!request?.showAircraftOnGround
      },

      {
        field: 'totalFlightHours',
        header: 'Total Flight Time (Hours)',
        width: '90',
        type: 'number',
        hidden: !!request?.showAircraftOnGround
      },

      {
        field: 'totalGroundStayHours',
        header: 'Total Ground Stay (Hours)',
        width: '90',
        type: 'number',
        hidden: !!request?.showAircraftOnGround
      },

      {
        field: 'timesBetweenMinMaxIndGroundStay',
        header: 'Times Between Min/Max Ind. Ground Stay',
        width: '90',
        type: 'number',
        hidden: !!request?.showAircraftOnGround
      },
      {
        field: 'lastFlightDate',
        header: 'Last Flight Date',
        width: '90',
        type: 'date'
      },
      {
        field: 'currentGroundEventDurationHours',
        header: 'Current Ground Stay Duration (Hours)',
        width: '90',
        type: 'number',
        hidden: !request?.showAircraftOnGround
      },
      {
        field: 'currentGroundEventAirportName',
        header: 'Current Ground Stay Location',
        width: '90',
        type: 'string',
        hidden: !request?.showAircraftOnGround
      },
      {
        field: 'maintenanceActivity',
        header: 'Maintenance Activity',
        width: '80',
        type: 'string',
        hidden: !request?.displayMaintenanceActivity
      }
    ];

    return this.tableHeaders;
  }
}
