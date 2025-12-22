using RiskAnalytics.Api.Business.Mappers;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Tests.Mappers;
using Xunit;

namespace RiskAnalytics.Business.Tests.Mappers;

public class SavedSearchEntityToSavedSearchModelMapperTests
{
    [Fact]
    public void Map_WhenCalled_ShouldMapSavedSearchEntityToSavedSearchModel()
    {
        // Arrange
        var source = new SavedSearch
        {
            Id = 1,
            PortfolioId = 1,
            Name = "Test",
            Description = "Test",
            Period = AssetWatchSearchPeriod.Last7Days,
            DateFrom = DateTime.Now,
            DateTo = DateTime.Now,
            IsActive = true,
            UserId = "Test",
            DateCreated = DateTime.Now,
            DateModified = DateTime.Now
        };

        var expected = new SavedSearchModel
        {
            Id = 1,
            PortfolioId = 1,
            Name = "Test",
            Description = "Test",
            IsActive = true,
            UserId = "Test",
            Period = AssetWatchSearchPeriod.Last7Days,
            DateFrom = source.DateFrom,
            DateTo = source.DateTo,
            RegionCodes = new List<string> { "5" },
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
        Assert.Equal(expected.UserId, result.UserId);
        Assert.Equal(expected.PortfolioId, result.PortfolioId);
        Assert.Equal(expected.IsActive, result.IsActive);
        Assert.Equal(expected.DateCreated, result.DateCreated);
        Assert.Equal(expected.DateModified, result.DateModified);
    }

    [Fact]
    public void Map_WhenCalled_ShouldMapCollectionOfSavedSearchEntityToSavedSearchModel()
    {
        // Arrange
        var source = new List<SavedSearch>
        {
            new()
            {
                Id = 1,
                Name = "Test",
                Description = "Test",
                RegionCodes = new[] { "5" }
            }
        };

        var expected = new SavedSearchModel
        {
            Id = 1,
            Name = "Test",
            Period = AssetWatchSearchPeriod.Last7Days,
            RegionCodes = new List<string> { "5" }
        };

        var mapper = MapsterForUnitTests.GetMapper<SavedSearchModelToSavedSearchEntityMapper>();

        // Act
        var result = mapper.Map<IEnumerable<SavedSearch>>(source);
        // Assert
        Assert.Equal(expected.Id, result.First().Id);
        Assert.Equal(expected.Name, result.First().Name);
        Assert.Equal(expected.RegionCodes.First(), result.First()?.RegionCodes.First());

    }
}
