using RiskAnalytics.Api.Repository.Entities.Portfolios;

namespace RiskAnalytics.Api.Repository.Mappers.Interfaces;

public interface IPortfoliosMapper
{
    Portfolio Map(
        Dictionary<int, Portfolio> existingPortfolios,
        Portfolio portfolio,
        PortfolioAircraft? aircraft
    );
}
