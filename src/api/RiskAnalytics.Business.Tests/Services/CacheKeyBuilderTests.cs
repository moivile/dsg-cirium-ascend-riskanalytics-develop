using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Common;
using Xunit;

namespace RiskAnalytics.Business.Tests.Services;

public class CacheKeyBuilderTests
{
    [Fact]
    public void BuildPortfolioCacheKey_ReturnsCacheKeyUsedForPortfolioDetails()
    {
        // Arrange
        var cacheKeyBuilder = new CacheKeyBuilder();
        var portfolioId = 1;
        var expected = $"{CacheSettings.CacheUnitPrefixForPortfolioResult}{portfolioId}";

        // Act
        var actual = cacheKeyBuilder.BuildPortfolioCacheKey(portfolioId);

        // Assert
        Assert.Equal(expected, actual);
    }
}
