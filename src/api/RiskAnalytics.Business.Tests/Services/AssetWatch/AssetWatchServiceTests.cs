
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Common;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.AssetWatch;


namespace RiskAnalytics.Business.Tests.Services.AssetWatch;

public class AssetWatchFiltersServiceTests
{
    private readonly IAssetWatchFlightDetailsRepository assetWatchRepositoryMock;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationServiceMock;
    private readonly IPortfoliosRepository portfoliosRepositoryMock;
    private readonly IMemoryCache memoryCacheMock;
    private readonly IAssetWatchFiltersRepository assetWatchFiltersRepositoryMock;
    private readonly ICacheKeyBuilder cacheKeyBuilderMock;

    private readonly AssetWatchFiltersService assetWatchService;

    public AssetWatchFiltersServiceTests()
    {
        assetWatchRepositoryMock = Substitute.For<IAssetWatchFlightDetailsRepository>();
        portfoliosRepositoryMock = Substitute.For<IPortfoliosRepository>();
        portfolioAuthorizationServiceMock = Substitute.For<IPortfolioAuthorizationService>();
        memoryCacheMock = Substitute.For<IMemoryCache>();
        assetWatchFiltersRepositoryMock = Substitute.For<IAssetWatchFiltersRepository>();
        cacheKeyBuilderMock = Substitute.For<ICacheKeyBuilder>();

        assetWatchService = new AssetWatchFiltersService(
            assetWatchRepositoryMock,
            memoryCacheMock,
            portfolioAuthorizationServiceMock,
            portfoliosRepositoryMock,
            assetWatchFiltersRepositoryMock,
            cacheKeyBuilderMock
            );
    }

    [Fact]
    public async Task GetFiltersData_PortfolioDoesNotExist_ThrowNotFound()
    {
        // arrange
        portfolioAuthorizationServiceMock
            .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
        .Do(x => { throw new NotFoundException(); });

        // act & assert
        await Assert.ThrowsAsync<NotFoundException>(async () => await assetWatchService.GetFilters(1, "bob"));
    }

    [Fact]
    public async Task GetFiltersData_UserDoesNotOwnPortfolio_ThrowForbidden()
    {
        // arrange
        portfolioAuthorizationServiceMock
            .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

        // act & assert
        await Assert.ThrowsAsync<ForbiddenException>(async () => await assetWatchService.GetFilters(1, "bob"));
    }

    [Fact]
    public async Task GetFiltersData_PortfolioExistsAndOwnedByUserReturnFromRepository_ReturnFiltersData()
    {
        // arrange
        assetWatchFiltersRepositoryMock.GetAssetWatchFilterOperators(Arg.Any<int>()).Returns(new List<IdNamePairModel> { new IdNamePairModel(1, "a") });
        assetWatchFiltersRepositoryMock.GetAssetWatchFilterEngineSeries(Arg.Any<int>()).Returns(new List<IdNamePairModel> { new IdNamePairModel(5, "x") });
        assetWatchFiltersRepositoryMock.GetAssetWatchFilterAircraftSeries(Arg.Any<int>()).Returns(new List<IdNamePairModel> { new IdNamePairModel(2, "c") });
        assetWatchFiltersRepositoryMock.GetAssetWatchFilterAircraftSerialNumbers(Arg.Any<int>()).Returns(new List<IdNamePairModel> { new IdNamePairModel(2, "c") });
        assetWatchFiltersRepositoryMock.GetAssetWatchFilterLessors(Arg.Any<int>()).Returns(new List<IdNamePairModel> { new IdNamePairModel(3, "e") });
        assetWatchFiltersRepositoryMock.GetCountriesAndRegions().Returns(new List<CountriesRegionsModel> { new CountriesRegionsModel("6", "cou", "7") });

        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        // act
        var stats = await assetWatchService.GetFilters(1, "bob");

        // assert
        Assert.NotNull(stats);
        Assert.Equal(1, stats.Operators.First().Id);
        Assert.Equal(5, stats.EngineSeries.First().Id);
        Assert.Equal(2, stats.AircraftSeries.First().Id);
        Assert.Equal(2, stats.AircraftSerialNumbers.First().Id);
        Assert.Equal(3, stats.Lessors.First().Id);
        Assert.Equal("6", stats.Countries.First().Id);
    }

    [Fact]
    public async Task GetFiltersData_PortfolioExistsAndOwnedByUserReturnFromCache_ReturnFiltersData()
    {
        // arrange
        var cacheKey = "RiskAnalytics_Portfolio_Aircraft_Results_1";
        cacheKeyBuilderMock.BuildPortfolioCacheKey(Arg.Is<int>(1)).Returns(cacheKey);

        var anyListArg = Arg.Any<AssetWatchFilterResponseModel>();
        var filterCriteria = new AssetWatchTableSearchParameters();

        var cachedResult = new AssetWatchFilterResponseModel
        {
            Countries = new List<CountriesRegionsModel> { new CountriesRegionsModel("6", "UK", "7")}
        };
        memoryCacheMock.TryGetValue(cacheKey, out anyListArg)
            .Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        // act
        var result = await assetWatchService.GetFilters(1, "bob");

        // assert
        Assert.NotNull(result);
        Assert.Equal("6", result.Countries.First().Id);
        Assert.Equal("UK", result.Countries.First().Name);
        Assert.Equal("7", result.Countries.First().RegionCode);

        await assetWatchFiltersRepositoryMock.DidNotReceive().GetCountriesAndRegions();

    }

    [Fact]
    public async Task GetFiltersData_PortfolioExistsAndOwnedByUserReturnFromCache_CallBuildPortfolioCacheKey()
    {
        // arrange
        var cacheKey = "RiskAnalytics_Portfolio_Aircraft_Results_1";
        var portfolioId = 1;
        cacheKeyBuilderMock.BuildPortfolioCacheKey(Arg.Any<int>()).Returns(cacheKey);

        var anyListArg = Arg.Any<AssetWatchFilterResponseModel>();
        var filterCriteria = new AssetWatchTableSearchParameters();

        var cachedResult = new AssetWatchFilterResponseModel
        {
            Countries = new List<CountriesRegionsModel> { new CountriesRegionsModel("6", "UK", "7")}
        };
        memoryCacheMock.TryGetValue(cacheKey, out anyListArg)
            .Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        // act
        var result = await assetWatchService.GetFilters(portfolioId, "bob");

        // assert
        cacheKeyBuilderMock.Received().BuildPortfolioCacheKey(portfolioId).Equals(cacheKey);

    }

    [Fact]
    public async Task GetAssetWatchFilterCities_PortfolioExistsAndOwnedByUserReturnFromCache_ReturnFiltersData()
    {
        // arrange
        var countryIds = new List<string> { "1" };
        var anyListArg = Arg.Any<IdNamePairModel>();

        var cachedResult = new List<StringIdNamePairModel> { new StringIdNamePairModel("6", "UK") };

        memoryCacheMock.TryGetValue(CacheSettings.CacheUnitPrefixForAssetWatchFiltersCitiesResult + "ct" + "1", out anyListArg)
            .Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        // act
        var result = await assetWatchService.GetAssetWatchFilterCities(countryIds);

        // assert
        Assert.NotNull(result);
        Assert.Equal("6", result.First().Id);

        await assetWatchFiltersRepositoryMock.DidNotReceive().GetAssetWatchFilterCities(countryIds);
    }

    [Fact]
    public async Task GetAssetWatchFilterAirports_ReturnFromCache_ReturnFiltersData()
    {
        // arrange
        var countryIds = new List<string> { "1" };
        var anyListArg = Arg.Any<StringIdNamePairModel>();

        var cachedResult = new List<StringIdNamePairModel> { new StringIdNamePairModel("6", "UK") };

        memoryCacheMock.TryGetValue(CacheSettings.CacheUnitPrefixForAssetWatchFiltersAirportsResult + "ap" + "1", out anyListArg)
            .Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        // act
        var result = await assetWatchService.GetAssetWatchFilterAirports(countryIds);

        // assert
        Assert.NotNull(result);
        Assert.Equal("6", result.First().Id);

        await assetWatchFiltersRepositoryMock.DidNotReceive().GetAssetWatchFilterAirports(countryIds);
    }
}
