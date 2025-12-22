import { Aircraft } from '../../../shared/models/aircraft';
import { SummaryMetric } from './summaryMetrics';
import { PortfolioOverviewSummaryMetricsAgeService } from './portfolio-overview-summary-metrics-age.service';


describe('PortfolioOverviewSummaryMetricsAgeService', () => {
  describe('buildAgeSummaryMetrics', () => {
    it('should build summary metrics for age', () => {
      // arrange
      const filteredPortfolioAircraft = [
        { aircraftAgeYears: 5 },
        { aircraftAgeYears: 6 },
        { aircraftAgeYears: 10 },
        { aircraftAgeYears: 15 },
        { aircraftAgeYears: 17 },
        { aircraftAgeYears: 20 },
        { aircraftAgeYears: 25 },
        { aircraftAgeYears: 35 },
        { aircraftAgeYears: 38 }
      ] as Aircraft[];

      const service = new PortfolioOverviewSummaryMetricsAgeService();

      // act
      const summaryMetrics: SummaryMetric[] = service.buildAgeSummaryMetrics(filteredPortfolioAircraft);

      // assert
      const expectedSummaryMetrics = [
        { label: '0-6', total: 1, percentage: 11, grouped: false },
        { label: '6-12', total: 2, percentage: 22, grouped: false },
        { label: '12-18', total: 2, percentage: 22, grouped: false },
        { label: '18-24', total: 1, percentage: 11, grouped: false },
        { label: '24-30', total: 1, percentage: 11, grouped: false },
        { label: '30+', total: 2, percentage: 22, grouped: true }
      ];

      expect(summaryMetrics).toEqual(expectedSummaryMetrics);
    });

    it('should not add aircraft without an age to summary metrics', () => {
      // arrange
      const filteredPortfolioAircraft = [
        { aircraftAgeYears: undefined },
        { aircraftAgeYears: null },
        { aircraftAgeYears: 15 },
        { aircraftAgeYears: 20 },
        { aircraftAgeYears: 25 },
        { aircraftAgeYears: 35 }
      ] as Aircraft[];

      const service = new PortfolioOverviewSummaryMetricsAgeService();

      // act
      const summaryMetrics: SummaryMetric[] = service.buildAgeSummaryMetrics(filteredPortfolioAircraft);

      // assert
      const expectedSummaryMetrics = [
        { label: '0-6', total: 0, percentage: 0, grouped: false },
        { label: '6-12', total: 0, percentage: 0, grouped: false },
        { label: '12-18', total: 1, percentage: 20, grouped: false },
        { label: '18-24', total: 1, percentage: 20, grouped: false },
        { label: '24-30', total: 1, percentage: 20, grouped: false },
        { label: '30+', total: 1, percentage: 20, grouped: true }
      ];

      expect(summaryMetrics).toEqual(expectedSummaryMetrics);
    });
  });
});
