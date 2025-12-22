import { Aircraft } from '../../../shared/models/aircraft';
import { SortBy } from '../../models/sortBy';
import { PortfolioOverviewBarChartService } from './portfolio-overview-stacked-bar-chart.service';
import { OperatorToggleValue } from '../../models/operator-toggle-value';


describe('StackedBarChartService', () => {
  const selectedValue = OperatorToggleValue.Name;

    describe('buildChartData', () => {

        it('when multiple countBy values datasets should be sorted by a given field', () => {
            // arrange

            const countBy = 'status';

            const filteredPortfolioAircraft = [
                {
                    aircraftFamily: 'A320 Family',
                    status: 'In Service'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'On Order'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'On Order'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'On Order'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                }
            ] as Aircraft[];

            const groupBy = 'aircraftFamily';
            const sortBy: SortBy = { key: 'status', name: 'Total', sortDescending: false };

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [1],
                    label: 'In Service',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderWidth: 1,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438',
                    hoverBorderWidth: 2
                },
                {
                    data: [3],
                    label: 'On Order',
                    backgroundColor: '#82BFB3',
                    hoverBackgroundColor: '#82BFB3',
                    borderWidth: 1,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438',
                    hoverBorderWidth: 2
                },
                {
                    data: [2],
                    label: 'Storage',
                    backgroundColor: '#004438',
                    hoverBackgroundColor: '#004438',
                    borderWidth: 1,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438',
                    hoverBorderWidth: 2
                }
            ];
            const expectedLabels = ['A320 Family'];

            expect(chartData.dataSets).toEqual(expectedDataSets);
            expect(chartData.labels).toEqual(expectedLabels);
        });

        it('when multiple groups dataset should be sorted by groupBy counts descending', () => {
            // arrange
            const groupBy = 'aircraftFamily';

            const sortBy: SortBy = { key: 'status', name: 'Total', sortDescending: true };

            const filteredPortfolioAircraft = [
                {
                    aircraftFamily: '777 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: '777 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A380 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                }
            ] as Aircraft[];

            const countBy = 'status';

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [3, 2, 1],
                    label: 'Storage',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderWidth: 1,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438',
                    hoverBorderWidth: 2
                }
            ];
            const expectedLabels = ['A320 Family', '777 Family', 'A380 Family'];

            expect(chartData.dataSets).toEqual(expectedDataSets);
            expect(chartData.labels).toEqual(expectedLabels);
        });

        it('when multiple groups and counts chartData should be sorted by groups and counts', () => {
            // arrange
            const filteredPortfolioAircraft = [
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'In Service'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'In Service'
                },
                {
                    aircraftFamily: '737 Family',
                    status: 'In Service'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: '737 Family',
                    status: 'LOI to Option'
                }
            ] as Aircraft[];
            const groupBy = 'aircraftFamily';
            const countBy = 'status';
            const sortBy: SortBy = { key: 'status', name: 'Total', sortDescending: false };

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [1, 0, 1],
                    label: 'Storage',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderWidth: 1,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438',
                    hoverBorderWidth: 2
                },
                {
                    data: [0, 1, 2],
                    label: 'In Service',
                    backgroundColor: '#82BFB3',
                    hoverBackgroundColor: '#82BFB3',
                    borderWidth: 1,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438',
                    hoverBorderWidth: 2
                },

                {
                    data: [0, 1, 0],
                    label: 'LOI to Option',
                    backgroundColor: '#004438',
                    hoverBackgroundColor: '#004438',
                    borderWidth: 1,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438',
                    hoverBorderWidth: 2
                }
            ];
            const expectedLabels = ['CRJ Family', '737 Family', 'A320 Family'];

            expect(chartData.dataSets).toEqual(expectedDataSets);
            expect(chartData.labels).toEqual(expectedLabels);
        });

        it('when less than 6 datasets and sortBy is a count, count bar colour should be #004438', () => {
            // arrange

            const countBy = 'status';

            const filteredPortfolioAircraft = [
                {
                    status: 'In Service',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'On Order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'On Order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'On Order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Storage',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Storage',
                    aircraftFamily: '777 Family',
                }
            ] as Aircraft[];

            const groupBy = 'aircraftFamily';
            const sortBy: SortBy = { key: 'status', name: 'On Order', sortDescending: false };

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [3],
                    label: 'On Order',
                    backgroundColor: '#004438',
                    hoverBackgroundColor: '#004438',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [1],
                    label: 'In Service',
                    backgroundColor: 'rgba(130, 191, 179, 0.5)',
                    hoverBackgroundColor: 'rgba(130, 191, 179, 0.5)',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [2],
                    label: 'Storage',
                    backgroundColor: 'rgba(0, 68, 56, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 68, 56, 0.5)',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                }

            ];

            expect(chartData.dataSets).toEqual(expectedDataSets);
        });

        it('when less than 6 datasets and sortBy is "Total", bar colours should be primary chart colours', () => {
            // arrange

            const countBy = 'status';

            const filteredPortfolioAircraft = [
                {
                    status: 'In Service',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'On Order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'On Order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'On Order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Storage',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Storage',
                    aircraftFamily: '777 Family',
                }
            ] as Aircraft[];

            const groupBy = 'aircraftFamily';
            const sortBy: SortBy = { key: 'status', name: 'Total', sortDescending: false };

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [1],
                    label: 'In Service',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [3],
                    label: 'On Order',
                    backgroundColor: '#82BFB3',
                    hoverBackgroundColor: '#82BFB3',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [2],
                    label: 'Storage',
                    backgroundColor: '#004438',
                    hoverBackgroundColor: '#004438',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                }

            ];

            expect(chartData.dataSets).toEqual(expectedDataSets);
        });

        it('when more than 6 datasets and sortBy "Total", bar colour should be #00856C', () => {
            // arrange

            const countBy = 'status';

            const filteredPortfolioAircraft = [
                {
                    status: 'In Service',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'On Order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Storage',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Letter of Intent',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'LOI to Option',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'LOI to order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Letter of Intent to Option',
                    aircraftFamily: '777 Family'
                }
            ] as Aircraft[];

            const groupBy = 'aircraftFamily';
            const sortBy: SortBy = { key: 'status', name: 'Total', sortDescending: false };

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [1],
                    label: 'In Service',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'On Order',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'Storage',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'Letter of Intent',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'LOI to Option',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'LOI to order',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'Letter of Intent to Option',
                    backgroundColor: '#00856C',
                    hoverBackgroundColor: '#00856C',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                }
            ];

            expect(chartData.dataSets).toEqual(expectedDataSets);
        });

        it('when more than 6 datasets and sortBy a count, bar colour should be rgba(0, 68, 56, 0.5)', () => {
            // arrange

            const countBy = 'status';

            const filteredPortfolioAircraft = [
                {
                    status: 'In Service',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'On Order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Storage',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Letter of Intent',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'LOI to Option',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'LOI to order',
                    aircraftFamily: '777 Family',
                },
                {
                    status: 'Letter of Intent to Option',
                    aircraftFamily: '777 Family'
                }
            ] as Aircraft[];

            const groupBy = 'aircraftFamily';
            const sortBy: SortBy = { key: 'status', name: 'Storage', sortDescending: false };

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [1],
                    label: 'Storage',
                    backgroundColor: '#004438',
                    hoverBackgroundColor: '#004438',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'In Service',
                    backgroundColor: 'rgba(0, 133, 108, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 133, 108, 0.5)',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'On Order',
                    backgroundColor: 'rgba(0, 133, 108, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 133, 108, 0.5)',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'Letter of Intent',
                    backgroundColor: 'rgba(0, 133, 108, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 133, 108, 0.5)',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'LOI to Option',
                    backgroundColor: 'rgba(0, 133, 108, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 133, 108, 0.5)',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'LOI to order',
                    backgroundColor: 'rgba(0, 133, 108, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 133, 108, 0.5)',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                },
                {
                    data: [1],
                    label: 'Letter of Intent to Option',
                    backgroundColor: 'rgba(0, 133, 108, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 133, 108, 0.5)',
                    borderColor: '#004438',
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#004438',
                    borderWidth: 1.5
                }
            ];

            expect(chartData.dataSets).toEqual(expectedDataSets);
        });

        it('should return datasets sorted by Total descending when sortBy values are identical', () => {
            // arrange

            const countBy = 'status';

            const filteredPortfolioAircraft = [
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'In Service'
                },
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'LOI to order'
                },
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'Letter of Intent to Option'
                }
            ] as Aircraft[];

            const groupBy = 'aircraftFamily';
            const sortBy: SortBy = { key: 'status', name: 'Storage', sortDescending: true };

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [2, 2],
                    label: 'Storage',
                    backgroundColor: '#004438',
                    hoverBackgroundColor: '#004438',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [1, 0],
                    label: 'In Service',
                    backgroundColor: 'rgba(130, 191, 179, 0.5)',
                    hoverBackgroundColor: 'rgba(130, 191, 179, 0.5)',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [1, 0],
                    label: 'LOI to order',
                    backgroundColor: 'rgba(0, 68, 56, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 68, 56, 0.5)',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [1, 0],
                    label: 'Letter of Intent to Option',
                    backgroundColor: 'rgba(141, 190, 126, 0.5)',
                    hoverBackgroundColor: 'rgba(141, 190, 126, 0.5)',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                }
            ];
            const expectedLabels = ['CRJ Family', 'A320 Family'];

            expect(chartData.labels).toEqual(expectedLabels);
            expect(chartData.dataSets).toEqual(expectedDataSets);
        });

        it('should return datasets sorted by Total ascending when sortBy values are identical', () => {
            // arrange

            const countBy = 'status';

            const filteredPortfolioAircraft = [
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'In Service'
                },
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'A320 Family',
                    status: 'Storage'
                },
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'LOI to order'
                },
                {
                    aircraftFamily: 'CRJ Family',
                    status: 'Letter of Intent to Option'
                }
            ] as Aircraft[];

            const groupBy = 'aircraftFamily';
            const sortBy: SortBy = { key: 'status', name: 'Storage', sortDescending: false };

            const service = new PortfolioOverviewBarChartService();

            // act
            const chartData = service.buildChartData(filteredPortfolioAircraft, groupBy, countBy, sortBy, selectedValue);

            // assert
            const expectedDataSets = [
                {
                    data: [2, 2],
                    label: 'Storage',
                    backgroundColor: '#004438',
                    hoverBackgroundColor: '#004438',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [0, 1],
                    label: 'In Service',
                    backgroundColor: 'rgba(130, 191, 179, 0.5)',
                    hoverBackgroundColor: 'rgba(130, 191, 179, 0.5)',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [0, 1],
                    label: 'LOI to order',
                    backgroundColor: 'rgba(0, 68, 56, 0.5)',
                    hoverBackgroundColor: 'rgba(0, 68, 56, 0.5)',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                },
                {
                    data: [0, 1],
                    label: 'Letter of Intent to Option',
                    backgroundColor: 'rgba(141, 190, 126, 0.5)',
                    hoverBackgroundColor: 'rgba(141, 190, 126, 0.5)',
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    borderColor: '#004438',
                    hoverBorderColor: '#004438'
                }
            ];
            const expectedLabels = ['A320 Family', 'CRJ Family'];

            expect(chartData.labels).toEqual(expectedLabels);
            expect(chartData.dataSets).toEqual(expectedDataSets);
        });
    });
});
