import { Aircraft } from '../../../shared/models/aircraft';
import { PortfolioOverviewAgeTableService } from './portfolio-overview-age-table.service';


describe('PortfolioOverviewAgeTableService', () => {
  describe('buildTableData', () => {
    it('should return aircraftAgeYears tableData for valid aircraftAgeYears only', () => {

      // arrange
      const testFleet = [
        {
          aircraftFamily: '787 Family',
          aircraftAgeYears: 6
        },
        {
          aircraftFamily: '787 Family',
          aircraftAgeYears: 22
        },
        {
          aircraftFamily: '787 Family',
          aircraftAgeYears: 18
        },
        {
          aircraftFamily: '787 Family',
          aircraftAgeYears: 13
        },
        {
          aircraftFamily: '737 Family',
          aircraftAgeYears: 31
        },
        {
          aircraftFamily: 'A320 Family',
          aircraftAgeYears: 9
        }
      ] as Aircraft[];

      const groupBy = { displayName: 'Aircraft Family', groupName: 'aircraftFamily' };

      const service = new PortfolioOverviewAgeTableService();

      // act
      const aircraftAgeYearsTableData = service.buildTableData(testFleet, groupBy);

      // assert
      const expectedAgeTableData = {
        frozenColumns: ['Aircraft Family'],
        scrollableColumns: ['Youngest', 'Mean', 'Median', 'Oldest'],
        tableRows:
          [
            { 'Aircraft Family': '787 Family', Youngest: 6, Median: 15.5, Mean: 14.8, Oldest: 22 },
            { 'Aircraft Family': '737 Family', Youngest: 31, Median: 31, Mean: 31, Oldest: 31 },
            { 'Aircraft Family': 'A320 Family', Youngest: 9, Median: 9, Mean: 9, Oldest: 9 }
          ],
          totals: [],
          headersInOrder: ['Aircraft Family', 'Youngest','Mean','Median', 'Oldest']
      };
      expect(aircraftAgeYearsTableData).toEqual(expectedAgeTableData);
    });
  });
});
