import { functionalHelpers } from './functional-helpers';

describe('functionalHelpers', () => {
  describe('groupBy', () => {
    it('should return grouped data for specified property', () => {

      // arrange
      const filteredPortfolioAircraft = [
        {
          aircraftid: 4087,
          aircraftfamily: 'A320 Family',
          status: 'In Service'
        },
        {
          aircraftid: 4085,
          aircraftfamily: 'A320 Family',
          status: 'In Service'
        },
        {
          aircraftid: 147470,
          aircraftfamily: '737 Family',
          status: 'In Service',
        },
        {
          aircraftid: 60782,
          aircraftfamily: 'CRJ Family',
          status: 'Storage',
        },
        {
          aircraftid: 152854,
          aircraftfamily: 'A320 Family',
          status: 'Storage',
        },
        {
          aircraftid: 149248,
          aircraftfamily: '737 Family',
          status: 'LOI to Option',
        }
      ];
      const groupBy = 'aircraftfamily';

      // act
      const groupedFleet = functionalHelpers.groupBy(filteredPortfolioAircraft, groupBy);

      // assert
      const expectedGroupedFleet = {
        'A320 Family': [
          {
            aircraftid: 4087,
            aircraftfamily: 'A320 Family',
            status: 'In Service'
          },
          {
            aircraftid: 4085,
            aircraftfamily: 'A320 Family',
            status: 'In Service'
          },
          {
            aircraftid: 152854,
            aircraftfamily: 'A320 Family',
            status: 'Storage'
          }
        ],
        '737 Family': [
          {
            aircraftid: 147470,
            aircraftfamily: '737 Family',
            status: 'In Service'
          },
          {
            aircraftid: 149248,
            aircraftfamily: '737 Family',
            status: 'LOI to Option'
          }
        ],
        'CRJ Family': [
          {
            aircraftid: 60782,
            aircraftfamily: 'CRJ Family',
            status: 'Storage'
          }
        ]
      };
      expect(groupedFleet).toEqual(expectedGroupedFleet);
    });
  });

  describe('groupByExcludingNulls', () => {
    it('should return grouped data for specified property excluding nulls', () => {

      // arrange
      const filteredPortfolioAircraft = [
        {
          aircraftid: 4087,
          aircraftfamily: 'A320 Family',
          status: 'In Service'
        },
        {
          aircraftid: 4085,
          aircraftfamily: 'A320 Family',
          status: 'In Service'
        },
        {
          aircraftid: 147470,
          aircraftfamily: null,
          status: 'In Service',
        },
        {
          aircraftid: 60782,
          aircraftfamily: 'CRJ Family',
          status: 'Storage',
        },
        {
          aircraftid: 152854,
          aircraftfamily: 'A320 Family',
          status: 'Storage',
        },
        {
          aircraftid: 149248,
          aircraftfamily: null,
          status: 'LOI to Option',
        }
      ];
      const groupBy = 'aircraftfamily';

      // act
      const groupedFleet = functionalHelpers.groupByExcludingNulls(filteredPortfolioAircraft, groupBy);

      // assert
      const expectedGroupedFleet = {
        'A320 Family': [
          {
            aircraftid: 4087,
            aircraftfamily: 'A320 Family',
            status: 'In Service'
          },
          {
            aircraftid: 4085,
            aircraftfamily: 'A320 Family',
            status: 'In Service'
          },
          {
            aircraftid: 152854,
            aircraftfamily: 'A320 Family',
            status: 'Storage'
          }
        ],
        'CRJ Family': [
          {
            aircraftid: 60782,
            aircraftfamily: 'CRJ Family',
            status: 'Storage'
          }
        ]
      };
      expect(groupedFleet).toEqual(expectedGroupedFleet);
    });
  });

  describe('distinct', () => {
    it('should return distinct data for specified property', () => {

      // arrange
      const filteredPortfolioAircraft = [
        {
          aircraftid: 4087,
          aircraftfamily: 'A320 Family',
          status: 'In Service'
        },
        {
          aircraftid: 4085,
          aircraftfamily: 'A320 Family',
          status: 'In Service'
        },
        {
          aircraftid: 147470,
          aircraftfamily: '737 Family',
          status: 'In Service',
        },
        {
          aircraftid: 60782,
          aircraftfamily: 'CRJ Family',
          status: 'Storage',
        },
        {
          aircraftid: 152854,
          aircraftfamily: 'A320 Family',
          status: 'Storage',
        },
        {
          aircraftid: 149248,
          aircraftfamily: '737 Family',
          status: 'LOI to Option',
        }
      ];
      const countBy = 'status';

      // act
      const distinctCountByValues = functionalHelpers.distinct(filteredPortfolioAircraft, countBy);

      // assert
      const expectedDistinctCountByValues = ['In Service', 'Storage', 'LOI to Option'];
      expect(distinctCountByValues).toEqual(expectedDistinctCountByValues);
    });
  });

  describe('countBy', () => {
    it('should return counts for specified property', () => {

      // arrange
      const groupedFleet = [
        {
          aircraftid: 4087,
          aircraftfamily: 'A320 Family',
          status: 'Storage'
        },
        {
          aircraftid: 4085,
          aircraftfamily: 'A320 Family',
          status: 'Storage'
        },
        {
          aircraftid: 147470,
          aircraftfamily: 'A320 Family',
          status: 'Storage',
        },
        {
          aircraftid: 60782,
          aircraftfamily: 'A320 Family',
          status: 'Storage',
        },
        {
          aircraftid: 152854,
          aircraftfamily: 'A320 Family',
          status: 'Storage',
        },
        {
          aircraftid: 149248,
          aircraftfamily: 'A320 Family',
          status: 'Storage',
        }
      ];
      const countBy = 'status';

      // act
      const groupCounts = functionalHelpers.countBy(groupedFleet, countBy);

      // assert
      const expectedDistinctCountByValues = { Storage: 6 };
      expect(groupCounts).toEqual(expectedDistinctCountByValues);
    });
  });

  describe('countByExcludingNulls', () => {
    it('should return counts for specified property excluding nulls', () => {

      // arrange
      const filteredPortfolioAircraft = [
        {
          aircraftid: 4087,
          aircraftfamily: 'A320 Family',
          status: null
        },
        {
          aircraftid: 4085,
          aircraftfamily: null,
          status: 'Storage'
        },
        {
          aircraftid: 147470,
          aircraftfamily: 'A320 Family',
          status: null,
        },
        {
          aircraftid: 60782,
          aircraftfamily: 'A320 Family',
          status: 'Storage',
        },
        {
          aircraftid: 152854,
          aircraftfamily: 'A320 Family',
          status: null,
        },
        {
          aircraftid: 149248,
          aircraftfamily: 'A320 Family',
          status: null,
        }
      ];
      const countBy = 'status';

      // act
      const groupCounts = functionalHelpers.countByExcludingNulls(filteredPortfolioAircraft, countBy);

      // assert
      const expectedDistinctCountByValues = { Storage: 2 };
      expect(groupCounts).toEqual(expectedDistinctCountByValues);
    });
  });

  describe('sortByPropertyDescending', () => {
    it('should return sorted (descending) array by specified property', () => {

      // arrange
      const statusOptions = [
        { name: 'In Service', count: 59 },
        { name: 'Storage', count: 291 },
        { name: 'On Order', count: 219 },
        { name: 'LOI to Option', count: 118 },
        { name: 'On Option', count: 1113 }
      ];

      // act
      const sortedStatusOptions = functionalHelpers.sortByPropertyDescending(statusOptions, 'count');

      // assert
      const expectedSortedStatusOptions = [
        { name: 'On Option', count: 1113 },
        { name: 'Storage', count: 291 },
        { name: 'On Order', count: 219 },
        { name: 'LOI to Option', count: 118 },
        { name: 'In Service', count: 59 }
      ];
      expect(sortedStatusOptions).toEqual(expectedSortedStatusOptions);
    });
  });


  describe('sortByPropertyAscending', () => {
    it('should return sorted (ascending) array by specified property', () => {

      // arrange
      const statusOptions = [
        { name: 'In Service', count: 59 },
        { name: 'Storage', count: 291 },
        { name: 'On Order', count: 219 },
        { name: 'LOI to Option', count: 118 },
        { name: 'On Option', count: 1113 }
      ];

      // act
      const sortedStatusOptions = functionalHelpers.sortByPropertyAscending(statusOptions, 'count');

      // assert
      const expectedSortedStatusOptions = [
        { name: 'In Service', count: 59 },
        { name: 'LOI to Option', count: 118 },
        { name: 'On Order', count: 219 },
        { name: 'Storage', count: 291 },
        { name: 'On Option', count: 1113 }
      ];
      expect(sortedStatusOptions).toEqual(expectedSortedStatusOptions);
    });
  });

  describe('computeMean', () => {
    it('should return mean number of array to 2 dp', () => {

      // arrange
      const unsortedArray = [20.5, 17.4, 13, 6.9, 23.4, 3, 1, 56.5];

      // act
      const mean = functionalHelpers.computeMean(unsortedArray, 2);

      // assert
      const expectedMean = 17.71;
      expect(mean).toEqual(expectedMean);
    });
  });

  describe('computeMedian', () => {
    it('should return median number of array to 1 dp when even number of elements in array', () => {

      // arrange
      const unsortedArray = [20.5, 17.4, 13, 6.9, 23.4, 3, 1, 56.5];

      // act
      const median = functionalHelpers.computeMedian(unsortedArray, 1);

      // assert
      const expectedMedian = 15.2;
      expect(median).toEqual(expectedMedian);
    });

    it('should return median number of array when odd number of elements in array', () => {

      // arrange
      const unsortedArray = [20.5, 17.4, 13];

      // act
      const median = functionalHelpers.computeMedian(unsortedArray, 1);

      // assert
      const expectedMedian = 17.4;
      expect(median).toEqual(expectedMedian);
    });
  });

  describe('round', () => {
    it('should return value to 1 decimal place', () => {

      // arrange
      const value = 55.67;
      const precision = 1;

      // act
      const roundedNumber = functionalHelpers.round(value, precision);

      // assert
      const expectedRoundedNumber = 55.7;
      expect(roundedNumber).toEqual(expectedRoundedNumber);
    });

    it('should return value to 2 decimal places', () => {

      // arrange
      const value = 55.671;
      const precision = 2;

      // act
      const roundedNumber = functionalHelpers.round(value, precision);

      // assert
      const expectedRoundedNumber = 55.67;
      expect(roundedNumber).toEqual(expectedRoundedNumber);
    });
  });

  describe('calculatePercentage', () => {
    it('should return value as a whole number', () => {

      // arrange
      const numerator = 5;
      const denominator = 22;
      const decimalPlaces = 0;

      // act
      const percentage = functionalHelpers.calculatePercentage(numerator, denominator, decimalPlaces);

      // assert
      const expectedPercentage = 23;
      expect(percentage).toEqual(expectedPercentage);
    });

    it('should return value to 1 decimal place', () => {

      // arrange
      const numerator = 5;
      const denominator = 22;
      const decimalPlaces = 1;

      // act
      const percentage = functionalHelpers.calculatePercentage(numerator, denominator, decimalPlaces);

      // assert
      const expectedPercentage = 22.7;
      expect(percentage).toEqual(expectedPercentage);
    });
  });

});
