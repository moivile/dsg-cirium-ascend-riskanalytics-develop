using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

public interface IGetGroupCountQueryBuilder
{
    string BuildQuery(MonthlyUtilizationGroup? groupBy, bool includeBaseline);
}
