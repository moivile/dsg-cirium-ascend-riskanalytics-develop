using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Business.Services;

public class PortfoliosService : IPortfoliosService
{
    private readonly IPortfoliosRepository portfoliosRepository;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationService;
    private readonly IMemoryCache memoryCache;
    private readonly ICacheKeyBuilder cacheKeyBuilder;

    public PortfoliosService(
        IPortfoliosRepository portfoliosRepository,
        IPortfolioAuthorizationService portfolioAuthorizationService,
        IMemoryCache memoryCache,
        ICacheKeyBuilder cacheKeyBuilder)
    {
        this.portfoliosRepository = portfoliosRepository;
        this.portfolioAuthorizationService = portfolioAuthorizationService;
        this.memoryCache = memoryCache;
        this.cacheKeyBuilder = cacheKeyBuilder;
    }

    public async Task<IEnumerable<Portfolio>> GetAll(string userId)
    {
        return await portfoliosRepository.GetAll(userId);
    }

    public async Task<Portfolio> Get(int id, string userId)
    {
        var portfolio = await portfoliosRepository.Get(id);

        portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolio, userId);

        return portfolio!;
    }

    public async Task<int> Create(Portfolio portfolio)
    {
        var portfolioId = await portfoliosRepository.Create(portfolio);
        return portfolioId;
    }

    public async Task Update(Portfolio portfolio, string userId)
    {
        await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolio.Id, userId);
        await portfoliosRepository.Update(portfolio);
        memoryCache.Remove(cacheKeyBuilder.BuildPortfolioCacheKey(portfolio.Id));
    }

    public async Task Delete(int portfolioId, string userId)
    {
        await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolioId, userId);

        await portfoliosRepository.Delete(portfolioId, userId);
    }
}
