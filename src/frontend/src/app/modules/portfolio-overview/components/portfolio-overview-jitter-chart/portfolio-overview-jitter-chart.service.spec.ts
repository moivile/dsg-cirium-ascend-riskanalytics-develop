import { Aircraft } from '../../../shared/models/aircraft';
import { Average, PortfolioOverviewJitterChartService } from './portfolio-overview-jitter-chart.service';
import { SortBy } from '../../models/sortBy';

describe('buildChartData', () => {
    it('should return mean dataset and labels  sorted by "Mean" descending', () => {
        // arrange
        const filteredPortfolioAircraft = [
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 1
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 2
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 3
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 4
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 10
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 1
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 2
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 4
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 5
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 6
            }
        ] as Aircraft[];
        const groupBy = { displayName: 'PortfolioAircraft Family', groupName: 'aircraftFamily' };
        const selectedAverage = Average.Mean;
        const jitterBy = 'aircraftAgeYears';
        const sortBy: SortBy = { key: 'aircraftAgeYears', name: 'Mean', sortDescending: false };

        const service = new PortfolioOverviewJitterChartService();

        // act
        const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, selectedAverage, jitterBy, sortBy);

        // assert
        const expectedAverageDataSets = [
            {
                x: 4, y: 1, key: 'A320 Family'
            },
            {
                x: 3.6, y: 2, key: '737 Family'
            }
        ];
        const expectedLabels = ['A320 Family', '737 Family'];

        expect(chartData.averageDataSets).toEqual(expectedAverageDataSets);
        expect(chartData.labels).toEqual(expectedLabels);
    });

    it('should return mean dataset and labels for valid ages only', () => {
        // arrange
        const filteredPortfolioAircraft = [
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 1
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 2
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 4
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 5
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 6
            },
            {
                aircraftFamily: '786 Family',
                aircraftAgeYears: 4
            },
            {
                aircraftFamily: '786 Family',
                aircraftAgeYears: 5
            },
            {
                aircraftFamily: '786 Family',
                aircraftAgeYears: 6
            }
        ] as Aircraft[];
        const groupBy = { displayName: 'PortfolioAircraft Family', groupName: 'aircraftFamily' };
        const selectedAverage = Average.Mean;
        const jitterBy = 'aircraftAgeYears';
        const sortBy: SortBy = { key: 'aircraftAgeYears', name: 'Mean', sortDescending: false };

        const service = new PortfolioOverviewJitterChartService();

        // act
        const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, selectedAverage, jitterBy, sortBy);

        // assert
        const expectedAverageDataSets = [
            {
                x: 5, y: 1, key: '786 Family'
            },
            {
                x: 3.6, y: 2, key: '737 Family'
            }
        ];
        const expectedLabels = ['786 Family', '737 Family'];

        expect(chartData.averageDataSets).toEqual(expectedAverageDataSets);
        expect(chartData.labels).toEqual(expectedLabels);
    });

    it('should return median dataset and labels sorted by "Median" descending', () => {
        // arrange
        const filteredPortfolioAircraft = [
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 1
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 2
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 3
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 4
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 10
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 1
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 2
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 4
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 5
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 6
            }
        ] as Aircraft[];
        const groupBy = { displayName: 'PortfolioAircraft Family', groupName: 'aircraftFamily' };
        const selectedAverage = Average.Median;
        const jitterBy = 'aircraftAgeYears';
        const sortBy: SortBy = { key: 'aircraftAgeYears', name: 'Median', sortDescending: false };

        const service = new PortfolioOverviewJitterChartService();

        // act
        const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, selectedAverage, jitterBy, sortBy);

        // assert
        const expectedAverageDataSets = [
            {
                x: 4, y: 1, key: '737 Family'
            },
            {
                x: 3, y: 2, key: 'A320 Family'
            },
        ];
        const expectedLabels = ['737 Family', 'A320 Family'];

        expect(chartData.averageDataSets).toEqual(expectedAverageDataSets);
        expect(chartData.labels).toEqual(expectedLabels);
    });

    it('should return aircraft data for jitter chart', () => {
        // arrange
        const filteredPortfolioAircraft = [
            {
                status: 'In Service',
                aircraftRegistrationNumber: 'LN765',
                aircraftSeries: '1234',
                aircraftAgeYears: 25.6
            },
            {
                status: 'In Service',
                aircraftRegistrationNumber: 'LN787',
                aircraftSeries: '6543',
                aircraftAgeYears: 22.5
            }
        ] as Aircraft[];
        const groupBy = { displayName: 'PortfolioAircraft Family', groupName: 'aircraftFamily' };
        const jitterBy = 'aircraftAgeYears';
        const selectedAverage = Average.Median;
        const sortBy: SortBy = { key: 'aircraftAgeYears', name: 'Mean', sortDescending: false };

        const service = new PortfolioOverviewJitterChartService();

        // act
        const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, selectedAverage, jitterBy, sortBy);
        const aircraft = chartData.jitterDataSets.map((a:any) => a.aircraft);

        // assert
        const expectedPortfolioAircraft = [
            {
                status: 'In Service',
                aircraftRegistrationNumber: 'LN765',
                aircraftSeries: '1234',
                aircraftAgeYears: 25.6
            },
            {
                status: 'In Service',
                aircraftRegistrationNumber: 'LN787',
                aircraftSeries: '6543',
                aircraftAgeYears: 22.5
            }
        ] as Aircraft[];

        expect(aircraft).toEqual(expectedPortfolioAircraft);
    });

    it('should return dataset sorted by "oldest" ascending', () => {
        // arrange
        const filteredPortfolioAircraft = [
            {
                aircraftFamily: 'A321 Family',
                aircraftAgeYears: 1
            },
            {
                aircraftFamily: 'A321 Family',
                aircraftAgeYears: 2
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 3
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 4
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 10
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 24
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 21
            },
            {
                aircraftFamily: '756 Family',
                aircraftAgeYears: 14
            },
            {
                aircraftFamily: '756 Family',
                aircraftAgeYears: 15
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 26
            }
        ] as Aircraft[];
        const groupBy = { displayName: 'PortfolioAircraft Family', groupName: 'aircraftFamily' };
        const selectedAverage = Average.Mean;
        const jitterBy = 'aircraftAgeYears';
        const sortBy: SortBy = { key: 'aircraftAgeYears', name: 'Oldest', sortDescending: true };

        const service = new PortfolioOverviewJitterChartService();

        // act
        const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, selectedAverage, jitterBy, sortBy);

        // assert
        const expectedAverageDataSets = [
            {
                x: 1.5,
                key: 'A321 Family',
                y: 1
            },
            {
                x: 5.7,
                key: 'A320 Family',
                y: 2
            },
            {
                x: 14.5,
                key: '756 Family',
                y: 3
            },
            {
                x: 23.7,
                key: '737 Family',
                y: 4
            }
        ];
        const expectedLabels = ['A321 Family', 'A320 Family', '756 Family', '737 Family'];

        expect(chartData.averageDataSets).toEqual(expectedAverageDataSets);
        expect(chartData.labels).toEqual(expectedLabels);
    });

    it('should return dataset sorted by "youngest" descending', () => {
        // arrange
        const filteredPortfolioAircraft = [
            {
                aircraftFamily: 'A321 Family',
                aircraftAgeYears: 1
            },
            {
                aircraftFamily: 'A321 Family',
                aircraftAgeYears: 2
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 3
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 4
            },
            {
                aircraftFamily: 'A320 Family',
                aircraftAgeYears: 10
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 24
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 21
            },
            {
                aircraftFamily: '756 Family',
                aircraftAgeYears: 14
            },
            {
                aircraftFamily: '756 Family',
                aircraftAgeYears: 15
            },
            {
                aircraftFamily: '737 Family',
                aircraftAgeYears: 26
            }
        ] as Aircraft[];
        const groupBy = { displayName: 'PortfolioAircraft Family', groupName: 'aircraftFamily' };
        const selectedAverage = Average.Mean;
        const jitterBy = 'aircraftAgeYears';
        const sortBy: SortBy = { key: 'aircraftAgeYears', name: 'Oldest', sortDescending: false };

        const service = new PortfolioOverviewJitterChartService();

        // act
        const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, selectedAverage, jitterBy, sortBy);

        // assert
        const expectedAverageDataSets = [
            {
                x: 23.7,
                key: '737 Family',
                y: 1
            },
            {
                x: 14.5,
                key: '756 Family',
                y: 2
            },
            {
                x: 5.7,
                key: 'A320 Family',
                y: 3
            },
            {
                x: 1.5,
                key: 'A321 Family',
                y: 4
            }
        ];
        const expectedLabels = ['737 Family', '756 Family', 'A320 Family', 'A321 Family'];

        expect(chartData.averageDataSets).toEqual(expectedAverageDataSets);
        expect(chartData.labels).toEqual(expectedLabels);
    });

});
