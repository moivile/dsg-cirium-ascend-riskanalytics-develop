import { OperatorToggleValue } from '../../models/operator-toggle-value';
import { PortfolioOverviewTableService } from './portfolio-overview-table.service';
import { Aircraft } from '../../../shared/models/aircraft';

describe('PortfolioOverviewTableService', () => {
  const selectedValue = OperatorToggleValue.Name;
  describe('buildTableData', () => {
    it('should return expected tableData when pivot is false', () => {

      // arrange
      const testPortfolioAircraft = [
        {
          aircraftFamily: 'DC-4 Family',
          status: 'Storage',
        },
        {
          aircraftFamily: '787 Family',
          status: 'On Option',
        },
        {
          aircraftFamily: '787 Family',
          status: 'In Service',
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option',
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option',
        },
        {
          aircraftFamily: '737 Family',
          status: 'On Order',
        },
        {
          aircraftFamily: 'A320 Family',
          status: 'In Service',
        }
      ] as Aircraft[];

      const groupBy = { displayName: 'Aircraft Family', groupName: 'aircraftFamily' };
      const countBy = 'status';
      const pivot = false;
      const pivotColumnHeader = 'Lessors';

      const service = new PortfolioOverviewTableService();

      // act
      const tableData = service.buildTableData(testPortfolioAircraft, groupBy, countBy, pivot, pivotColumnHeader, selectedValue);

      // assert
      const expectedTableData = {
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
        headersInOrder: []
      };
      expect(tableData).toEqual(expectedTableData);
    });

    it('should return expected tableData when pivot is true', () => {

      // arrange
      const testPortfolioAircraft = [
        {
          aircraftFamily: 'DC-4 Family',
          status: 'Storage',
        },
        {
          aircraftFamily: '787 Family',
          status: 'On Option',
        },
        {
          aircraftFamily: '787 Family',
          status: 'In Service',
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option',
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option',
        },
        {
          aircraftFamily: '737 Family',
          status: 'On Order',
        },
        {
          aircraftFamily: 'A320 Family',
          status: 'In Service',
        },
      ] as Aircraft[];

      const groupBy = { displayName: 'Aircraft Family', groupName: 'aircraftFamily' };
      const countBy = 'status';
      const pivot = true;
      const pivotColumnHeader = 'Lessors';

      const service = new PortfolioOverviewTableService();

      // act
      const tableData = service.buildTableData(testPortfolioAircraft, groupBy, countBy, pivot, pivotColumnHeader, selectedValue);

      // assert
      const expectedTableData = {
        frozenColumns: ['Lessors'],
        scrollableColumns: ['787 Family', 'DC-4 Family', '737 Family', 'A320 Family', 'Total'],
        tableRows:
          [
            { Lessors: 'Storage', 'DC-4 Family': 1, '787 Family': 0, '737 Family': 0, 'A320 Family': 0, Total: 1 },
            { Lessors: 'On Option', 'DC-4 Family': 0, '787 Family': 1, '737 Family': 0, 'A320 Family': 0, Total: 1 },
            { Lessors: 'In Service', 'DC-4 Family': 0, '787 Family': 1, '737 Family': 0, 'A320 Family': 1, Total: 2 },
            { Lessors: 'LOI to Option', 'DC-4 Family': 0, '787 Family': 2, '737 Family': 0, 'A320 Family': 0, Total: 2 },
            { Lessors: 'On Order', 'DC-4 Family': 0, '787 Family': 0, '737 Family': 1, 'A320 Family': 0, Total: 1 }
          ],
        totals: [{ 'Aircraft Family': 'Total', 'DC-4 Family': 1, '787 Family': 4, '737 Family': 1, 'A320 Family': 1, Total: 7 }],
        headersInOrder: []
      };
      expect(tableData).toEqual(expectedTableData);
    });
  });
});
