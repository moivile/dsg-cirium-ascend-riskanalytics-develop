import { Aircraft } from '../../../shared/models/aircraft';
import { SummaryMetric } from './summaryMetrics';
import { functionalHelpers } from '../../helpers/functional-helpers';


export class PortfolioOverviewSummaryMetricsService {
    private readonly groupAfterXSummaryMetrics = 5;

    buildSummaryMetrics(portfolioAircraft: Aircraft[], countBy: string): any {
        const summaryMetrics: SummaryMetric[] = [];

        const filteredFleetCounts = functionalHelpers.countBy(portfolioAircraft, countBy);

        const fleetLength = portfolioAircraft.length - (filteredFleetCounts.null || 0);
        delete filteredFleetCounts.null;

        for (const countKey in filteredFleetCounts) {
            if (Object.prototype.hasOwnProperty.call(filteredFleetCounts, countKey)) {
                summaryMetrics.push({
                    label: countKey,
                    total: filteredFleetCounts[countKey],
                    percentage: functionalHelpers.calculatePercentage(filteredFleetCounts[countKey], fleetLength, 0),
                    grouped: false
                });
            }
        }
        functionalHelpers.sortByPropertyDescending(summaryMetrics, 'total');

        if (summaryMetrics.length > this.groupAfterXSummaryMetrics + 1) {
            return this.createGroupSummaryMetric(summaryMetrics, fleetLength);
        }

        return summaryMetrics;
    }

    private createGroupSummaryMetric(summaryMetrics: SummaryMetric[], fleetLength: number): any {
        const groupSummaryMetrics = summaryMetrics.slice(this.groupAfterXSummaryMetrics, summaryMetrics.length);
        summaryMetrics = summaryMetrics.slice(0, this.groupAfterXSummaryMetrics);

        const total = groupSummaryMetrics.reduce((runningTotal, summaryMetric) => runningTotal + (summaryMetric.total), 0);

        summaryMetrics.push({
            label: `${groupSummaryMetrics.length} Others`,
            total,
            percentage: functionalHelpers.calculatePercentage(total, fleetLength, 0),
            grouped: true
        });
        return summaryMetrics;
    }
}
