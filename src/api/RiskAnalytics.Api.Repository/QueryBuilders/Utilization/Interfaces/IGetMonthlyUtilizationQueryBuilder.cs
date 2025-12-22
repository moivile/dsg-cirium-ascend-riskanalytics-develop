using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

public interface IGetMonthlyUtilizationQueryBuilder
{
    string BuildQuery(MonthlyUtilizationGroup? groupBy, bool includeBaseline, bool includeEmissions, bool isEmissions, bool isHoursAndCycle, bool isGlobalFleet = false);
}
