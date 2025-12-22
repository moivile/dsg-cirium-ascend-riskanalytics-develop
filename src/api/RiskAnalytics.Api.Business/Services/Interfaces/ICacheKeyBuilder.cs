namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface ICacheKeyBuilder
{
    string BuildPortfolioCacheKey(int portfolioId);
}
