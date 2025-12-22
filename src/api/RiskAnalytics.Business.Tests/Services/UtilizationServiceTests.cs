using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;

using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Api.Business.Mappers.Interfaces;
using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;
using RiskAnalytics.Api.Repository.Models;
using NSubstitute;
using RiskAnalytics.Api.Repository;

namespace RiskAnalytics.Business.Tests.Services;
public class UtilizationServiceTests
{
    private readonly IUtilizationRepository utilizationRepositoryMock;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationServiceMock;
    private readonly IMemoryCache memoryCacheMock;
    private readonly IMonthlyUtilizationMapper monthlyUtilizationMapperMock;

    private readonly IUtilizationService utilizationService;
    private readonly IGroupCountQueryRepository groupCountQueryRepositoryMock;

    public UtilizationServiceTests()
    {
        utilizationRepositoryMock = Substitute.For<IUtilizationRepository>();
        portfolioAuthorizationServiceMock = Substitute.For<IPortfolioAuthorizationService>();
        memoryCacheMock = Substitute.For<IMemoryCache>();
        monthlyUtilizationMapperMock = Substitute.For<IMonthlyUtilizationMapper>();
        groupCountQueryRepositoryMock = Substitute.For<IGroupCountQueryRepository>();

        utilizationService = new UtilizationService(
            portfolioAuthorizationServiceMock,
            utilizationRepositoryMock,
            groupCountQueryRepositoryMock,
            memoryCacheMock,
            monthlyUtilizationMapperMock);
    }

    [Theory]
    [InlineData(PortfoliosClaim.EmissionsAddOn, false, true, false, true)]
    [InlineData(PortfoliosClaim.EmissionsAddOn, true, true, true, true)]
    [InlineData(PortfoliosClaim.EmissionsAddOn, false, true, false, false)]
    [InlineData(PortfoliosClaim.EmissionsAddOn, true, true, false, false)]
    [InlineData(PortfoliosClaim.EmissionsAddOn, false, true, true, false)]
    [InlineData(PortfoliosClaim.EmissionsAddOn, true, true, false, true)]
    [InlineData(PortfoliosClaim.EmissionsAddOn, false, true, true, true)]
    [InlineData(PortfoliosClaim.EmissionsAddOn, true, true, true, false)]
    public async Task GetMonthlyUtilization_EmissionsClaim_ValidatesAccessToPortfolio_And_ReturnsResult(
        string portfoliosClaim,
        bool includeBaseLine,
        bool expectToIncludeEmissions,
        bool isEmissions,
        bool isHoursAndCycles
    )
    {
        // arrange
        const int portfolioId = 1;
        const string userId = "blah";
        const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
        var groupByFilterIds = new[] { 0 };
        const int operatorId = 1;
        const int lessorId = 1;

        var mapResponse = new List<IEnumerable<MonthlyUtilization>>()
        {
            new List<MonthlyUtilization>()
        };

        monthlyUtilizationMapperMock.Map(
            Arg.Any<IList<IEnumerable<MonthlyUtilization>>>()
        ).Returns(mapResponse);

        var claimsIdentity = new ClaimsIdentity(new Claim[]
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(PortfoliosClaim.ClaimType, portfoliosClaim)
        });

        // act
        var monthlyUtilization = (await utilizationService.GetMonthlyUtilization(
            portfolioId,
            new ClaimsPrincipal(claimsIdentity),
            groupBy,
            groupByFilterIds,
            operatorId,
            lessorId,
            includeBaseLine, isEmissions, isHoursAndCycles)).ToList();

        // assert
        await portfolioAuthorizationServiceMock.Received().ValidateAccessToPortfolioOrThrow(portfolioId, userId);

        await utilizationRepositoryMock.Received().GetMonthlyUtilization(
            portfolioId,
            groupBy,
            groupByFilterIds,
            operatorId,
            lessorId,
            expectToIncludeEmissions,
            includeBaseLine, isEmissions, isHoursAndCycles);

        Assert.Single(monthlyUtilization);
        Assert.Equal(mapResponse, monthlyUtilization);
    }

    [Theory]
    [InlineData(PortfoliosClaim.Standard, false, false, false, false)]
    [InlineData(PortfoliosClaim.Standard, true, false, false, false)]
    [InlineData(PortfoliosClaim.Standard, false, false, true, false)]
    [InlineData(PortfoliosClaim.Standard, true, false, false, true)]
    [InlineData(PortfoliosClaim.Standard, false, false, true, true)]
    [InlineData(PortfoliosClaim.Standard, true, false, true, false)]
    [InlineData(PortfoliosClaim.Standard, false, false, false, true)]
    public async Task GetMonthlyUtilization_StandardClaim_ValidatesAccessToPortfolio_And_ReturnsResult(
        string portfoliosClaim,
        bool includeBaseLine,
        bool expectToIncludeEmissions,
        bool isEmissions,
        bool isHoursAndCycles
    )
    {
        // arrange
        const int portfolioId = 1;
        const string userId = "blah";
        const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
        var groupByFilterIds = new[] { 0 };
        const int operatorId = 1;
        const int lessorId = 1;

        var mapResponse = new List<IEnumerable<MonthlyUtilization>>()
        {
            new List<MonthlyUtilization>()
        };

        monthlyUtilizationMapperMock.Map(
            Arg.Any<IList<IEnumerable<MonthlyUtilization>>>()
        ).Returns(mapResponse);

        var claimsIdentity = new ClaimsIdentity(new Claim[]
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(PortfoliosClaim.ClaimType, portfoliosClaim)
        });

        // act
        var monthlyUtilization = (await utilizationService.GetMonthlyUtilization(
            portfolioId,
            new ClaimsPrincipal(claimsIdentity),
            groupBy,
            groupByFilterIds,
            operatorId,
            lessorId,
            includeBaseLine, isEmissions, isHoursAndCycles)).ToList();

        // assert
        await portfolioAuthorizationServiceMock.Received().ValidateAccessToPortfolioOrThrow(portfolioId, userId);

        await utilizationRepositoryMock.Received().GetMonthlyUtilization(
            portfolioId,
            groupBy,
            groupByFilterIds,
            operatorId,
            lessorId,
            expectToIncludeEmissions,
            includeBaseLine, isEmissions, isHoursAndCycles);

        Assert.Single(monthlyUtilization);
        Assert.Equal(mapResponse, monthlyUtilization);
    }

    [Theory(Skip = "nsubstitude setup issues")]
    [InlineData(null, null, null, true)]
    [InlineData(null, MonthlyUtilizationGroup.MarketClass, null, true)]
    [InlineData(null, MonthlyUtilizationGroup.AircraftFamily, null, false)]
    [InlineData(null, MonthlyUtilizationGroup.AircraftType, null, false)]
    [InlineData(null, MonthlyUtilizationGroup.AircraftSeries, null, false)]
    [InlineData(null, MonthlyUtilizationGroup.AircraftSerialNumber, null, false)]
    [InlineData(1, null, null, false)]
    [InlineData(null, null, 1, false)]
    public async Task GetMonthlyUtilization_UsesCacheForLargeResultsOnly(
        int? portfolioId,
        MonthlyUtilizationGroup? groupBy,
        int? operatorId,
        bool expectToUseCache)
    {
        // arrange
        var repositoryResult = new List<IEnumerable<MonthlyUtilization>>()
        {
            new List<MonthlyUtilization>()
        };

        utilizationRepositoryMock.GetMonthlyUtilization(
            portfolioId,
            groupBy,
            Arg.Any<IReadOnlyCollection<int>>(),
            operatorId,
            1,
            Arg.Any<bool>(),
            Arg.Any<bool>(), true, true).Returns(repositoryResult);

        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        var cachedResult = new object();

        // act
        await utilizationService.GetMonthlyUtilization(
            portfolioId,
            new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, "userId") })),
            groupBy,
            Arg.Any<IReadOnlyCollection<int>>(),
            operatorId,
            1,
            false, true, true);

        // assert
        memoryCacheMock.Received(expectToUseCache ? 1 : 0).TryGetValue(Arg.Any<string>(), out cachedResult);
        memoryCacheMock.Received(expectToUseCache ? 1 : 0).CreateEntry(Arg.Any<string>());
    }

    [Fact(Skip = "nsubstitude setup issues")]
    public async Task GetMonthlyUtilization_ResultIsCached_ReturnFromCache()
    {
        // arrange
        var cachedResult = new List<List<MonthlyUtilization>>();
        var anyResultArg = Arg.Any<List<List<MonthlyUtilization>>>();
        var cacheKey = "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Results_IncludeBaseline=False_MarketClassIds=All_IncludeEmissions=False";

        memoryCacheMock.TryGetValue(cacheKey, out anyResultArg).Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        // act
        await utilizationService.GetMonthlyUtilization(
            null,
            new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, "userId") })),
            MonthlyUtilizationGroup.MarketClass,
            Arg.Any<IReadOnlyCollection<int>>(),
            null,
            null,
            false, true, true);

        // assert
        memoryCacheMock.Received().TryGetValue(cacheKey, out anyResultArg);
        memoryCacheMock.DidNotReceive().CreateEntry(Arg.Any<string>());
    }

    [Fact(Skip = "nsubstitude setup issues")]
    public async Task GetMonthlyUtilization_ResultsIsNotCached_GetMonthlyUtilizationsAndTotalGroupCountsAndMap()
    {
        // arrange
        int? portfolioId = null;
        const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.MarketClass;
        int? operatorId = null;
        int? lessorId = null;
        var anyResultArg = Arg.Any<List<List<MonthlyUtilization>>>();
        var anyObjectArg = Arg.Any<object>();

        memoryCacheMock.CreateEntry(anyObjectArg).Returns(Substitute.For<ICacheEntry>());

        var getMonthlyUtilizationResult = new List<IEnumerable<MonthlyUtilization>>();
        utilizationRepositoryMock.GetMonthlyUtilization(
            portfolioId,
            groupBy,
            Arg.Any<IReadOnlyCollection<int>>(),
            operatorId,
            lessorId,
            false,
            false, false, false).Returns(getMonthlyUtilizationResult);

        var cachedResult = new List<List<MonthlyUtilization>>();
        var cacheKey = "risk";

        memoryCacheMock.TryGetValue(cacheKey, out anyResultArg)
           .Returns(x =>
           {
               x[1] = cachedResult;
               return true;
           });

        // act
        await utilizationService.GetMonthlyUtilization(
            portfolioId,
            new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, "userId") })),
            groupBy,
            Arg.Any<IReadOnlyCollection<int>>(),
            operatorId,
            lessorId,
            false, false, false);

        // assert
        memoryCacheMock.Received().TryGetValue(cacheKey, out cachedResult);
        memoryCacheMock.Received().CreateEntry(cacheKey);

        await utilizationRepositoryMock.Received().GetMonthlyUtilization(
            portfolioId,
            groupBy,
            Arg.Any<IReadOnlyCollection<int>>(),
            operatorId,
            lessorId,
            false,
            false, false, false);

        monthlyUtilizationMapperMock.Received().Map(
            getMonthlyUtilizationResult);
    }

    [Theory(Skip = "nsubstitude setup issues")]
    [InlineData(true, null, null, false, false, false, "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Results_IncludeBaseline=True_MarketClassIds=All_IncludeEmissions=False_IsEmissions=False_isHoursAndCycle=False")]
    [InlineData(true, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 }, false, false, true, "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Results_IncludeBaseline=True_MarketClassIds=1,2,3_IncludeEmissions=False_IsEmissions=False_isHoursAndCycle=True")]
    [InlineData(true, MonthlyUtilizationGroup.MarketClass, new[] { 3, 2, 1 }, false, true, true, "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Results_IncludeBaseline=True_MarketClassIds=1,2,3_IncludeEmissions=False_IsEmissions=True_isHoursAndCycle=True")]
    [InlineData(true, null, null, true, true, false, "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Results_IncludeBaseline=True_MarketClassIds=All_IncludeEmissions=True_IsEmissions=True_isHoursAndCycle=False")]
    [InlineData(false, null, null, true, false, true, "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Results_IncludeBaseline=False_MarketClassIds=All_IncludeEmissions=True_IsEmissions=False_isHoursAndCycle=True")]
    public async Task GetMonthlyUtilization_ResultIsCachedAgainstAllRelevantVariables(
        bool includeBaseline,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds,
        bool userHasEmissionsAddOn,
        bool isEmissions,
        bool isHoursAndCycle,
        string expectedCacheKey)
    {
        // arrange
        int? portfolioId = null;
        int? operatorId = null;
        int? lessorId = null;

        var repositoryResult = new List<IEnumerable<MonthlyUtilization>>()
        {
            new List<MonthlyUtilization>()
        };

        utilizationRepositoryMock.GetMonthlyUtilization(
            portfolioId,
            groupBy,
            groupByFilterIds,
            operatorId,
            lessorId,
            userHasEmissionsAddOn,
            includeBaseline, isEmissions, isHoursAndCycle).Returns(repositoryResult);

        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        var userClaims = new List<Claim>
        {
            new (ClaimTypes.NameIdentifier, "userId")
        };

        if (userHasEmissionsAddOn)
        {
            userClaims.Add(new Claim(PortfoliosClaim.ClaimType, PortfoliosClaim.EmissionsAddOn));
        }

        var cachedResult = new object();

        // act
        await utilizationService.GetMonthlyUtilization(
            portfolioId,
            new ClaimsPrincipal(new ClaimsIdentity(userClaims)),
            groupBy,
            groupByFilterIds,
            operatorId,
            lessorId,
            includeBaseline, isEmissions, isHoursAndCycle);

        // assert
        memoryCacheMock.Received().TryGetValue(expectedCacheKey, out cachedResult);
        memoryCacheMock.Received().CreateEntry(expectedCacheKey);
    }

    [Fact]
    public async Task GetGroupOptions_PortfolioIdIsNotNull_ValidateAccessToPortfolio()
    {
        // arrange
        const int portfolioId = 1;
        const string userId = "userId";

        // act
        await utilizationService.GetGroupOptions(portfolioId, 2, 1, userId);

        // assert
        await portfolioAuthorizationServiceMock.Received().ValidateAccessToPortfolioOrThrow(portfolioId, userId);
        await utilizationRepositoryMock.Received().GetGroupOptions(2, 1, portfolioId);
    }

    [Fact]
    public async Task GetGroupOptions_PortfolioIdIsNull_DoNotValidateAccessToPortfolio()
    {
        // arrange
        var portfolioId = (int?)null;
        const string userId = "userId";

        // act
        await utilizationService.GetGroupOptions(portfolioId, 2, 1, userId);

        // assert
        await portfolioAuthorizationServiceMock.DidNotReceive().ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), userId);
        await utilizationRepositoryMock.Received().GetGroupOptions(2, portfolioId, 1);
    }

    [Fact]
    public async Task GetGroupOptions_MapGroupOptionsToGroupOptionsModel()
    {
        // arrange
        var portfolioId = (int?)null;
        const string userId = "userId";

        var repositoryGroupOptions = new List<UtilizationGroupOption>
        {
            new(1, "Widebody", MonthlyUtilizationGroup.MarketClass.ToString()),
            new(2, "Narrow body", MonthlyUtilizationGroup.MarketClass.ToString()),
            new(3, "A320 Family", MonthlyUtilizationGroup.AircraftFamily.ToString()),
            new(4, "737 Family", MonthlyUtilizationGroup.AircraftFamily.ToString()),
            new(5, "A320", MonthlyUtilizationGroup.AircraftType.ToString()),
            new(6, "737", MonthlyUtilizationGroup.AircraftType.ToString()),
            new(7, "A320-123", MonthlyUtilizationGroup.AircraftSeries.ToString()),
            new(8, "737-123", MonthlyUtilizationGroup.AircraftSeries.ToString()),
            new(9, "MSN01", MonthlyUtilizationGroup.AircraftSerialNumber.ToString()),
            new(10, "MSN02", MonthlyUtilizationGroup.AircraftSerialNumber.ToString()),
        };

        utilizationRepositoryMock.GetGroupOptions(Arg.Any<int>(), portfolioId, Arg.Any<int>()).Returns(repositoryGroupOptions);

        // act
        var groupOptionsModel = await utilizationService.GetGroupOptions(portfolioId, 2, 1, userId);

        // assert
        Assert.Equal(2, groupOptionsModel.AircraftMarketClasses.Count());
        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[0].Id, repositoryGroupOptions[0].Name), groupOptionsModel.AircraftMarketClasses.First());
        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[1].Id, repositoryGroupOptions[1].Name), groupOptionsModel.AircraftMarketClasses.Last());

        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[2].Id, repositoryGroupOptions[2].Name), groupOptionsModel.AircraftFamilies.First());
        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[3].Id, repositoryGroupOptions[3].Name), groupOptionsModel.AircraftFamilies.Last());

        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[4].Id, repositoryGroupOptions[4].Name), groupOptionsModel.AircraftTypes.First());
        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[5].Id, repositoryGroupOptions[5].Name), groupOptionsModel.AircraftTypes.Last());

        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[6].Id, repositoryGroupOptions[6].Name), groupOptionsModel.AircraftSeries.First());
        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[7].Id, repositoryGroupOptions[7].Name), groupOptionsModel.AircraftSeries.Last());

        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[8].Id, repositoryGroupOptions[8].Name), groupOptionsModel.AircraftSerialNumbers.First());
        Assert.Equivalent(new IdNamePairModel(repositoryGroupOptions[9].Id, repositoryGroupOptions[9].Name), groupOptionsModel.AircraftSerialNumbers.Last());
    }

    [Theory]
    [InlineData(null, null, true)]
    [InlineData(1, null, false)]
    [InlineData(null, 1, false)]
    public async Task GetGroupOptions_UsesCacheForLargeResultsOnly(int? portfolioId, int? operatorId, bool expectToUseCache)
    {
        // arrange
        const string userId = "userId";
        var cacheKey = "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_GroupOptions";
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());
        var cacheResult = new UtilizationGroupOptionsModel();
        var anyResultArg = Arg.Any<UtilizationGroupOptionsModel?>();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out anyResultArg).Returns(x =>
        {
            x[1] = cacheResult;
            return true;
        });

        // act
        await utilizationService.GetGroupOptions(portfolioId, operatorId, null, userId);

        // assert
        memoryCacheMock.Received(expectToUseCache ? 1 : 0).TryGetValue(cacheKey, out anyResultArg);
        memoryCacheMock.Received(expectToUseCache ? 1 : 0).CreateEntry(cacheKey);
    }

    [Fact]
    public async Task GetGroupOptions_ResultIsCached_ReturnFromCache()
    {
        // arrange
        const string userId = "userId";

        var cachedResult = new UtilizationGroupOptionsModel();
        var anyResponseArg = Arg.Any<UtilizationGroupOptionsModel>();

        memoryCacheMock.TryGetValue("RiskAnalytics_MonthlyUtilization_GlobalBenchmark_GroupOptions", out anyResponseArg).Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        // act
        await utilizationService.GetGroupOptions(null, null, null, userId);

        // assert
        await utilizationRepositoryMock.DidNotReceive().GetGroupOptions(Arg.Any<int?>(), Arg.Any<int?>(), Arg.Any<int?>());
        memoryCacheMock.Received().TryGetValue(Arg.Any<string>(), out cachedResult);
        memoryCacheMock.DidNotReceive().CreateEntry(Arg.Any<string>());
    }

    [Fact]
    public async Task GetOperators_PortfolioIdIsNotNull_ValidateAccessToPortfolio()
    {
        // arrange
        const int portfolioId = 1;
        const int lessorId = 1;
        const string userId = "userId";
        const MonthlyUtilizationGroup monthlyUtilizationGroup = MonthlyUtilizationGroup.AircraftFamily;
        var groupByFilterIds = new[] { 1, 2, 3 };

        // act
        await utilizationService.GetOperators(portfolioId, lessorId, monthlyUtilizationGroup, groupByFilterIds, userId);

        // assert
        await portfolioAuthorizationServiceMock.Received().ValidateAccessToPortfolioOrThrow(portfolioId, userId);
        await utilizationRepositoryMock.Received().GetOperators(portfolioId, lessorId, monthlyUtilizationGroup, groupByFilterIds);
    }

    [Fact]
    public async Task GetOperators_PortfolioIdIsNull_DoNotValidateAccessToPortfolio()
    {
        // arrange
        var portfolioId = (int?)null;
        const string userId = "userId";
        const MonthlyUtilizationGroup monthlyUtilizationGroup = MonthlyUtilizationGroup.AircraftFamily;
        var groupByFilterIds = new[] { 1, 2, 3 };
        const int lessorId = 1;

        // act
        await utilizationService.GetOperators(portfolioId, lessorId, monthlyUtilizationGroup, groupByFilterIds, userId);

        // assert
        await portfolioAuthorizationServiceMock.DidNotReceive().ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), userId);
        await utilizationRepositoryMock.Received().GetOperators(portfolioId, lessorId, monthlyUtilizationGroup, groupByFilterIds);
    }

    [Fact]
    public async Task GetLessors_PortfolioIdIsNotNull_ValidateAccessToPortfolio()
    {
        // arrange
        const int portfolioId = 1;
        const int operatorId = 1;
        const string userId = "userId";
        const MonthlyUtilizationGroup monthlyUtilizationGroup = MonthlyUtilizationGroup.AircraftFamily;
        var groupByFilterIds = new[] { 1, 2, 3 };

        // act
        await utilizationService.GetLessors(portfolioId, operatorId, monthlyUtilizationGroup, groupByFilterIds, userId);

        // assert
        await portfolioAuthorizationServiceMock.Received().ValidateAccessToPortfolioOrThrow(portfolioId, userId);
        await utilizationRepositoryMock.Received().GetLessors(portfolioId, operatorId, monthlyUtilizationGroup, groupByFilterIds);
    }

    [Fact]
    public async Task GetLessors_PortfolioIdIsNull_DoNotValidateAccessToPortfolio()
    {
        // arrange
        var portfolioId = (int?)null;
        const string userId = "userId";
        const MonthlyUtilizationGroup monthlyUtilizationGroup = MonthlyUtilizationGroup.AircraftFamily;
        var groupByFilterIds = new[] { 1, 2, 3 };
        const int operatorId = 1;


        // act
        await utilizationService.GetLessors(portfolioId, operatorId, monthlyUtilizationGroup, groupByFilterIds, userId);

        // assert
        await portfolioAuthorizationServiceMock.DidNotReceive().ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), userId);
        await utilizationRepositoryMock.Received().GetLessors(portfolioId, operatorId, monthlyUtilizationGroup, groupByFilterIds);
    }

    [Theory(Skip = "nsubstitude setup issues")]
    [InlineData(null, null, true)]
    [InlineData(1, null, false)]
    [InlineData(null, MonthlyUtilizationGroup.AircraftFamily, false)]
    public async Task GetOperatorOptions_UsesCacheForLargeResultsOnly(
        int? portfolioId,
        MonthlyUtilizationGroup? groupBy,
        bool expectToUseCache)
    {
        // arrange
        const string userId = "userId";
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());
        var cachedResult = new object();

        // act
        await utilizationService.GetOperators(portfolioId, 1, groupBy, new List<int>(), userId);

        // assert
        memoryCacheMock.Received(expectToUseCache ? 1 : 0).TryGetValue(Arg.Any<string>(), out cachedResult);
        memoryCacheMock.Received(expectToUseCache ? 1 : 0).CreateEntry(Arg.Any<string>());
    }

    [Fact(Skip = "nsubstitude setup issues")]
    public async Task GetOperatorOptions_ResultIsCached_ReturnFromCache()
    {
        // arrange
        const string userId = "userId";

        var cachedResult = new List<IdNamePairModel>();
        var anyResponseArg = Arg.Any<List<IdNamePairModel>>();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out anyResponseArg).Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        // act
        await utilizationService.GetOperators(null, null, null, null, userId);

        // assert
        await utilizationRepositoryMock.DidNotReceive().GetOperators(null, null, null, null);
        memoryCacheMock.Received().TryGetValue(Arg.Any<string>(), out cachedResult);
        memoryCacheMock.DidNotReceive().CreateEntry("RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Operators");
    }

    [Theory]
    [InlineData(1, 3, 2, 2024, 2023, true, PortfoliosClaim.EmissionsAddOn, 1, 1, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, false, PortfoliosClaim.EmissionsAddOn, 1, 1, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, true, PortfoliosClaim.Standard, 1, 1, null, null)]
    [InlineData(1, 3, 2, 2024, 2023, true, PortfoliosClaim.Standard, 1, 1, MonthlyUtilizationGroup.AircraftFamily, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, true, PortfoliosClaim.EmissionsAddOn, 1, 1, MonthlyUtilizationGroup.AircraftType, new[] { 1, 2, 3 })]
    public async Task GetMonthlyUtilizationPerAircraft_ReturnResultOk(
    int portfolioId,
    int endMonthIndex,
    int startMonthIndex,
    int endYear,
    int startYear,
    bool isEmissions,
    string portfoliosClaim,
    int? operatorId,
    int? lessorId,
    MonthlyUtilizationGroup? groupBy,
    IReadOnlyCollection<int>? groupByFilterIds)
    {
        // testing the GetMonthlyUtilizationPerAircraft method
        // arrange
        const string userId = "blah";
        var repositoryResult = new List<MSNUtilizationPerAircraft>()
        {
            new()
        };

        utilizationRepositoryMock.GetMonthlyUtilizationPerAircraft(
            portfolioId,
            endMonthIndex,
            startMonthIndex,
            endYear,
            startYear,
            isEmissions,
            operatorId,
            lessorId,
            groupBy,
            groupByFilterIds).Returns(repositoryResult);

        var claimsIdentity = new ClaimsIdentity(new Claim[]
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(PortfoliosClaim.ClaimType, portfoliosClaim)
        });

        // act
        var monthlyUtilization = (await utilizationService.GetMonthlyUtilizationPerAircraft(portfolioId, endMonthIndex, startMonthIndex, endYear, startYear, isEmissions, new ClaimsPrincipal(claimsIdentity), operatorId, lessorId, groupBy, groupByFilterIds)).ToList();

        await utilizationRepositoryMock.GetMonthlyUtilizationPerAircraft(
            portfolioId,
            endMonthIndex,
            startMonthIndex,
            endYear,
            startYear,
            isEmissions,
            operatorId,
            lessorId,
            groupBy,
            groupByFilterIds);

        Assert.Single(monthlyUtilization);
        Assert.Equal(repositoryResult, monthlyUtilization);
    }


    [Theory]
    [InlineData(1, 3, 2, 2024, 2023, true, PortfoliosClaim.EmissionsAddOn, 1, 1, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, false, PortfoliosClaim.EmissionsAddOn, 1, 1, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, true, PortfoliosClaim.Standard, 1, 1, MonthlyUtilizationGroup.AircraftFamily, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, true, PortfoliosClaim.EmissionsAddOn, 1, 1, MonthlyUtilizationGroup.AircraftType, new[] { 1, 2, 3 })]
    public async Task GetMonthlyUtilizationPerAircraft_ReturnResultFromCache(
    int portfolioId,
    int endMonthIndex,
    int startMonthIndex,
    int endYear,
    int startYear,
    bool isEmissions,
    string portfoliosClaim,
    int? operatorId,
    int? lessorId,
    MonthlyUtilizationGroup? groupBy,
    IReadOnlyCollection<int>? groupByFilterIds)
    {
        // arrange
        var cachedResult = new List<MSNUtilizationPerAircraft>();
        var anyResultArg = Arg.Any<List<MonthlyUtilization>>();
        var groupByFilterIdsString = groupByFilterIds == null ? "All" : string.Join(",", groupByFilterIds);
        var cacheKey = "RiskAnalytics_MonthlyUtilization_PerAircraft_Results_" + "_PortfolioId=" + portfolioId +
                        "_EndMonthIndex=" + endMonthIndex + "_StartMonthIndex=" + startMonthIndex + "_EndYear="
                        + endYear + "_StartYear=" + startYear + "_OperatorId=" + operatorId +
                        "_LessorId=" + lessorId + "_GroupBy=" + groupBy + "_GroupByFilterIds=" + groupByFilterIdsString + "_IsEmissions=" + isEmissions;

        memoryCacheMock.TryGetValue(cacheKey, out anyResultArg)
            .Returns(x =>
            {
                x[1] = cachedResult;
                return true;
            });

        // act
        await utilizationService.GetMonthlyUtilizationPerAircraft(portfolioId, endMonthIndex, startMonthIndex, endYear, startYear, isEmissions,
         new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, "userId"), new(PortfoliosClaim.ClaimType, portfoliosClaim) })),
          operatorId, lessorId, groupBy, groupByFilterIds);

        // assert
        memoryCacheMock.Received().TryGetValue(cacheKey, out anyResultArg);
        memoryCacheMock.DidNotReceive().CreateEntry(Arg.Any<string>());
    }

    [Fact]
    public async Task GetGroupCounts_ShouldGetGroupCountsAndPopulateExistingList()
    {
        // arrange

        IList<IEnumerable<MonthlyUtilization>> existingMonthlyUtilizations = new List<IEnumerable<MonthlyUtilization>>
        {
            new List<MonthlyUtilization>
            {
                new() { GroupId = null, Year = 2023, Month = 1, AverageHours = 1, NumberOfAircraftInGroup = 123, AircraftType="xxx",Group = UtilizationBaselineGroupName.Name },
                new() { GroupId = null, Year = 2023, Month = 2, AverageHours = 2, NumberOfAircraftInGroup = 123, AircraftType="xxx",Group = UtilizationBaselineGroupName.Name }
            },
            new List<MonthlyUtilization>
            {
                new() { GroupId = 1, Year = 2023, Month = 3, AverageHours = 3, NumberOfAircraftInGroup = 456,Group = "Narrowbody" },
                new() { GroupId = 1, Year = 2023, Month = 4, AverageHours = 4, NumberOfAircraftInGroup = 456,Group = "Narrowbody" }
            }
        };

        var groupCountResult20231 = new List<MonthlyUtilizationGroupCount>
        {
            new MonthlyUtilizationGroupCount
            {
                GroupId = null,
                NumberOfAircraftInGroup = 10,
                Year = 2023,
                Month = 1
            },
            new MonthlyUtilizationGroupCount
            {
                GroupId = null,
                NumberOfAircraftInGroup = 20,
                Year = 2023,
                Month = 2
            },
            new MonthlyUtilizationGroupCount
            {
                GroupId = 1,
                NumberOfAircraftInGroup = 30,
                Year = 2023,
                Month = 3
            },
            new MonthlyUtilizationGroupCount
            {
                GroupId = 1,
                NumberOfAircraftInGroup = 40,
                Year = 2023,
                Month = 4
            }
        };

        groupCountQueryRepositoryMock.GetGroupCounts(
            Arg.Any<int?>(),
            Arg.Any<MonthlyUtilizationGroup?>(),
            Arg.Any< IEnumerable<int>?> (),
            Arg.Any<int?>(),
            Arg.Any<int?>(),
            Arg.Any<bool>())
            .Returns(groupCountResult20231);

        // act
        var result = await utilizationService.GetGroupCounts(
            1,
            null,
            null,
            null,
            null,
            existingMonthlyUtilizations,
            false);

        // assert
       

        Assert.Equal(2, result.Count);

    }
}
