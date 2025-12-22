using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

public interface IGetLessorsQueryBuilder
{
    string BuildQuery(MonthlyUtilizationGroup? groupBy);
}
