using RiskAnalytics.Api.Business.Mappers;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Tests.Mappers;
using Xunit;

namespace RiskAnalytics.Business.Tests.Mappers;

public class SavedSearchModelToSavedSearchEntityMapperTests
{
    [Fact]
    public void Map_WhenCalled_ShouldMapSavedSearchModelToSavedSearchEntity()
    {
        // Arrange
        var source = new SavedSearchModel
        {
            Id = 1,
            PortfolioId = 1,
            Name = "Test",
            Description = "Test",
            IsActive = true,
            UserId = "Test",
            Period = AssetWatchSearchPeriod.Last7Days,
            DateFrom = DateTime.Now,
            DateTo = DateTime.Now,
            RegionCodes = new List<string> { "5" },
            DateCreated = DateTime.Now,
            DateModified = DateTime.Now
        };

        var expected = new SavedSearch
        {
            Id = 1,
            PortfolioId = 1,
            Name = "Test",
            Description = "Test",
            Period = AssetWatchSearchPeriod.Last7Days,
            DateFrom = source.DateFrom,
            DateTo = source.DateTo,
            IsActive = true,
            UserId = "Test",
            RegionCodes = new[] { "5" },
            DateCreated = source.DateCreated,
            DateModified = source.DateModified
        };

        var mapper = MapsterForUnitTests.GetMapper<SavedSearchModelToSavedSearchEntityMapper>();

        // Act
        var result = mapper.Map<SavedSearch>(source);

        // Assert
        Assert.Equal(expected.Id, result.Id);
        Assert.Equal(expected.Name, result.Name);
        Assert.Equal(expected.Description, result.Description);
        Assert.Equal(expected.Period, result.Period);
        Assert.Equal(expected.DateFrom, result.DateFrom);
        Assert.Equal(expected.DateTo, result.DateTo);
        Assert.Equal(expected.UserId, result.UserId);
        Assert.Equal(expected.PortfolioId, result.PortfolioId);
        Assert.Equal(expected.IsActive, result.IsActive);
        Assert.Equal(expected.DateCreated, result.DateCreated);
        Assert.Equal(expected.DateModified, result.DateModified);
        Assert.NotNull(result.RegionCodes);
        Assert.Equal(expected.RegionCodes.First(), result.RegionCodes.First());
    }
}
