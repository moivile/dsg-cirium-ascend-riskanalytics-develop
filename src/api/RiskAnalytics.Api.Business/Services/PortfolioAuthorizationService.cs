using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Repository.Entities.Portfolios;

namespace RiskAnalytics.Api.Business.Services;

public class PortfolioAuthorizationService : IPortfolioAuthorizationService
{
    private readonly IPortfoliosRepository portfoliosRepository;

    public PortfolioAuthorizationService(IPortfoliosRepository portfoliosRepository)
    {
        this.portfoliosRepository = portfoliosRepository;
    }

    public async Task ValidateAccessToPortfolioOrThrow(int portfolioId, string userId)
    {
        var portfolio = await portfoliosRepository.Get(portfolioId);
        ValidateAccessToPortfolioOrThrow(portfolio, userId);
    }

    public void ValidateAccessToPortfolioOrThrow(Portfolio? portfolio, string userId)
    {
        if (portfolio == null)
        {
            throw new NotFoundException();
        }

        if (portfolio.UserId != userId)
        {
            throw new ForbiddenException();
        }
    }
}
