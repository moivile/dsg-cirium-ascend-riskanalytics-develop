using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;

namespace RiskAnalytics.Api.Repository.Mappers;

public class PortfoliosMapper : IPortfoliosMapper
{
    public Portfolio Map(Dictionary<int, Portfolio> existingPortfolios, Portfolio portfolio, PortfolioAircraft? aircraft)
    {
        if (existingPortfolios.TryGetValue(portfolio.Id, out var existingPortfolio))
        {
            MapPortfolioAsset(existingPortfolio);
            return existingPortfolio;
        }

        MapPortfolioAsset(portfolio);
        existingPortfolios.Add(portfolio.Id, portfolio);
        return portfolio;

        void MapPortfolioAsset(Portfolio targetPortfolio)
        {
            if (aircraft != null)
            {
                targetPortfolio.Aircraft.Add(aircraft);
            }
        }
    }
}