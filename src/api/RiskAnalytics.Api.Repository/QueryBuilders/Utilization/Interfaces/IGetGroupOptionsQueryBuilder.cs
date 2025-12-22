namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

public interface IGetGroupOptionsQueryBuilder
{
    string BuildQuery(int? portfolioId);
}
