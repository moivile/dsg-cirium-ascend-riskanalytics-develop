import { Aircraft } from '../../../shared/models/aircraft';
import { SummaryMetric } from './summaryMetrics';
import { functionalHelpers } from '../../helpers/functional-helpers';

export class PortfolioOverviewSummaryMetricsAgeService {

  buildAgeSummaryMetrics(filteredFleetWithNulls: Aircraft[]): any {

    const summaryMetrics: SummaryMetric[] = [
      { label: '0-6', total: 0, percentage: 0, grouped: false },
      { label: '6-12', total: 0, percentage: 0, grouped: false },
      { label: '12-18', total: 0, percentage: 0, grouped: false },
      { label: '18-24', total: 0, percentage: 0, grouped: false },
      { label: '24-30', total: 0, percentage: 0, grouped: false },
      { label: '30+', total: 0, percentage: 0, grouped: true }
    ];
    const filteredFleet = filteredFleetWithNulls.filter(aircraft => aircraft.aircraftAgeYears !== null);

    Object.entries(filteredFleet).forEach(([, aircraft]) => {

      if (!aircraft.aircraftAgeYears || aircraft.aircraftAgeYears < 0) {
        return;
      }
      else if (aircraft.aircraftAgeYears < 6) {
        summaryMetrics[0].total++;
      }
      else if (aircraft.aircraftAgeYears < 12) {
        summaryMetrics[1].total++;
      }
      else if (aircraft.aircraftAgeYears < 18) {
        summaryMetrics[2].total++;
      }
      else if (aircraft.aircraftAgeYears < 24) {
        summaryMetrics[3].total++;
      }
      else if (aircraft.aircraftAgeYears < 30) {
        summaryMetrics[4].total++;
      }
      else {
        summaryMetrics[5].total++;
      }
    });

    summaryMetrics.forEach(summaryMetric => {
      summaryMetric.percentage = functionalHelpers.calculatePercentage(summaryMetric.total, filteredFleet.length, 0);
    });
    return summaryMetrics;
  }
}
