using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

public interface IGetOperatorsQueryBuilder
{
    string BuildQuery(MonthlyUtilizationGroup? groupBy);
}
