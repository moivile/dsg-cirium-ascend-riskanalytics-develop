using RiskAnalytics.Api.Repository.Entities.Portfolios;

namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface IPortfolioAuthorizationService
{
    Task ValidateAccessToPortfolioOrThrow(int portfolioId, string userId);
    void ValidateAccessToPortfolioOrThrow(Portfolio? portfolio, string userId);
}
