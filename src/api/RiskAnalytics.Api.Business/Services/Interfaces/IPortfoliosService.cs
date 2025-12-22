using RiskAnalytics.Api.Repository.Entities.Portfolios;

namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface IPortfoliosService
{
    Task<IEnumerable<Portfolio>> GetAll(string userId);

    Task<Portfolio> Get(int portfolioId, string userId);
    Task<int> Create(Portfolio portfolio);
    Task Update(Portfolio portfolio, string userId);

    Task Delete(int portfolioId, string userId);
}
