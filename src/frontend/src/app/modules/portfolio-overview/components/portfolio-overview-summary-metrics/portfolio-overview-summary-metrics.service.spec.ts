import { Aircraft } from '../../../shared/models/aircraft';
import { PortfolioOverviewSummaryMetricsService } from './portfolio-overview-summary-metrics.service';
import { SummaryMetric } from './summaryMetrics';


describe('PortfolioOverviewSummaryMetricsService', () => {
    describe('buildSummaryMetrics', () => {
        it('should build grouped summary metrics when more than 6 segments', () => {
            // arrange
            const filteredFleet = [
                {
                    aircraftType: 'IL-76'
                },
                {
                    aircraftType: 'IL-76'
                },
                {
                    aircraftType: 'TU-134'
                },
                {
                    aircraftType: 'IL-18',
                },
                {
                    aircraftType: 'IL-18',
                },
                {
                    aircraftType: 'IL-18',
                },
                {
                    aircraftType: 'IL-78',
                },
                {
                    aircraftType: 'UJ-98',
                },
                {
                    aircraftType: 'YU-76',
                },
                {
                    aircraftType: 'KI-786',
                },
                {
                    aircraftType: 'JI-739',
                }
            ] as Aircraft[];
            const countBy = 'aircraftType';

            const service = new PortfolioOverviewSummaryMetricsService();

            // act
            const summaryMetrics = service.buildSummaryMetrics(filteredFleet, countBy);

            // assert
            const expectedSummaryMetrics = [
                { label: 'IL-18', total: 3, percentage: 27, grouped: false },
                { label: 'IL-76', total: 2, percentage: 18, grouped: false },
                { label: 'TU-134', total: 1, percentage: 9, grouped: false },
                { label: 'IL-78', total: 1, percentage: 9, grouped: false },
                { label: 'UJ-98', total: 1, percentage: 9, grouped: false },
                { label: '3 Others', total: 3, percentage: 27, grouped: true }
            ];

            expect(summaryMetrics).toEqual(expectedSummaryMetrics);
        });
        it('should build all summary metrics when less than or equal to 6 segments', () => {
            // arrange
            const filteredFleet = [
                {
                    aircraftType: 'IL-76'
                },
                {
                    aircraftType: 'IL-76'
                },
                {
                    aircraftType: 'IL-76'
                },
                {
                    aircraftType: 'TU-134'
                },
                {
                    aircraftType: 'IL-18',
                },
                {
                    aircraftType: 'IL-18',
                },
                {
                    aircraftType: 'IL-78',
                }
            ] as Aircraft[];
            const countBy = 'aircraftType';

            const service = new PortfolioOverviewSummaryMetricsService();

            // act
            const summaryMetrics: SummaryMetric[] = service.buildSummaryMetrics(filteredFleet, countBy);

            // assert
            const expectedSummaryMetrics = [
                { label: 'IL-76', total: 3, percentage: 43, grouped: false },
                { label: 'IL-18', total: 2, percentage: 29, grouped: false },
                { label: 'TU-134', total: 1, percentage: 14, grouped: false },
                { label: 'IL-78', total: 1, percentage: 14, grouped: false }
            ];

            expect(summaryMetrics).toEqual(expectedSummaryMetrics);
        });
    });
});
