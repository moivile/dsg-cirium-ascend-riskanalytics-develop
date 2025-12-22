using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common;

namespace RiskAnalytics.Api.Business.Services;
public class CacheKeyBuilder : ICacheKeyBuilder
{
    public string BuildPortfolioCacheKey(int portfolioId)
    {
        return $"{CacheSettings.CacheUnitPrefixForPortfolioResult}{portfolioId}";
    }

}
