using Microsoft.Extensions.Caching.Memory;
using NSubstitute;
using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;

namespace RiskAnalytics.Business.Tests.Services
{
    public class TrackedUtilizationServiceTests
    {
        private readonly ITrackedUtilizationRepository trackedUtilizationRepositoryMock;
        private readonly IPortfolioAuthorizationService portfolioAuthorizationServiceMock;
        private readonly IPortfoliosRepository portfoliosRepositoryMock;
        private readonly IMemoryCache memoryCacheMock;

        private readonly TrackedUtilizationService trackedUtilizationService;

        public TrackedUtilizationServiceTests()
        {
            trackedUtilizationRepositoryMock = Substitute.For<ITrackedUtilizationRepository>();
            portfoliosRepositoryMock = Substitute.For<IPortfoliosRepository>();
            portfolioAuthorizationServiceMock = Substitute.For<IPortfolioAuthorizationService>();
            memoryCacheMock = Substitute.For<IMemoryCache>();

            trackedUtilizationService = new TrackedUtilizationService(
                trackedUtilizationRepositoryMock,
                portfolioAuthorizationServiceMock,
                portfoliosRepositoryMock,
                memoryCacheMock);
        }

        [Fact]
        public async Task SummaryFlights_PortfolioDoesNotExist_ThrowNotFound()
        {
            // arrange
            portfolioAuthorizationServiceMock
                .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new NotFoundException(); });

            // act & assert
            await Assert.ThrowsAsync<NotFoundException>(async () => await trackedUtilizationService.SummaryFlights("bob", 1, null, Api.Repository.Models.AssetWatchGroupingOption.Airport));
        }

        [Fact]
        public async Task SummaryFlights_UserDoesNotOwnPortfolio_ThrowForbidden()
        {
            // arrange
            portfolioAuthorizationServiceMock
                .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

            // act & assert
            await Assert.ThrowsAsync<ForbiddenException>(async () => await trackedUtilizationService.SummaryFlights("bob", 1, null, Api.Repository.Models.AssetWatchGroupingOption.Airport));
        }

        [Fact]
        public async Task SummaryFlights_GeneratesExpectedCacheKeys()
        {
            // arrange
            var filterCriteria = new AssetWatchSearchParameters
            {
                RegionCodes = new List<string> { "4" },
                CountryCodes = new List<string> { "5" },
                Period = AssetWatchSearchPeriod.Last1Month,
                DateFrom = new DateTime(2020, 1, 1),
                DateTo = new DateTime(2020, 1, 2),
                OperatorIds = new List<int> { 1 },
                EngineSerieIds = new List<int> { 4 },
                LessorIds = new List<int> { 2 },
                AircraftIds = new List<int> { 123 },
                AircraftSeriesIds = new List<int> { 3 }
            };

            var cachedResult = new List<IdNameCountModel> {
                new IdNameCountModel("a", "xxx", 5)
            };
            var anyListArg = Arg.Any<IdNameCountModel>();

            var cacheKey = "RiskAnalytics_AssetWatchSummaryFlights_Results_p1_grp_Region_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123_rC";

            memoryCacheMock.TryGetValue(Arg.Is<string>(i => i == cacheKey), out anyListArg)
                .Returns(x =>
                {
                    x[1] = cachedResult;
                    return true;
                });

            // act
            var result = await trackedUtilizationService.SummaryFlights("bob", 1, filterCriteria, Api.Repository.Models.AssetWatchGroupingOption.Region);

            // assert
            memoryCacheMock.Received().TryGetValue(Arg.Is<string>(i => i == cacheKey), out cachedResult);
        }

        [Fact]
        public async Task SummaryFlights_PortfolioExistsAndOwnedByUserReturnFromRepository_ReturnExpectedData()
        {
            // arrange
            trackedUtilizationRepositoryMock.SummaryFlights(Arg.Any<int>(), Arg.Any<AssetWatchSearchParameters>(), Api.Repository.Models.AssetWatchGroupingOption.Airport)
                .Returns(new List<IdNameCountModel> { new IdNameCountModel("a", "xxx", 5) });

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            // act
            var stats = await trackedUtilizationService.SummaryFlights("bob", 1, new AssetWatchSearchParameters(), Api.Repository.Models.AssetWatchGroupingOption.Airport);

            // assert
            Assert.NotNull(stats);
            Assert.Equal(5, stats.First().Count);
        }

        [Fact]
        public async Task SummaryFlights_PortfolioExistsAndOwnedByUserReturnFromCache_ReturnExpectedData()
        {
            // arrange
            var filterCriteria = new AssetWatchSearchParameters
            {
                RegionCodes = new List<string> { "4" },
                CountryCodes = new List<string> { "5" },
                Period = AssetWatchSearchPeriod.Last1Month,
                DateFrom = new DateTime(2020, 1, 1),
                DateTo = new DateTime(2020, 1, 2),
                OperatorIds = new List<int> { 1 },
                EngineSerieIds = new List<int> { 4 },
                LessorIds = new List<int> { 2 },
                AircraftIds = new List<int> { 123 },
                AircraftSeriesIds = new List<int> { 3 }
            };

            trackedUtilizationRepositoryMock.SummaryFlights(Arg.Any<int>(), Arg.Any<AssetWatchSearchParameters>(), Api.Repository.Models.AssetWatchGroupingOption.Airport)
                .Returns(new List<IdNameCountModel> { new IdNameCountModel("a", "xxx", 5) });

            var cachedResult = new List<IdNameCountModel> {
                new IdNameCountModel("a", "xxx", 5)
            };
            var anyListArg = Arg.Any<IdNameCountModel>();

            var cacheKey = "RiskAnalytics_AssetWatchSummaryFlights_Results_p1_grp_Airport_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123_rC";

            memoryCacheMock.TryGetValue(cacheKey, out anyListArg)
                .Returns(x =>
                {
                    x[1] = cachedResult;
                    return true;
                });

            // act
            var stats = await trackedUtilizationService.SummaryFlights("bob", 1, filterCriteria, Api.Repository.Models.AssetWatchGroupingOption.Airport);

            // assert
            Assert.NotNull(stats);
            Assert.Equal(5, stats.First().Count);
            memoryCacheMock.Received().TryGetValue(cacheKey, out cachedResult);
            await trackedUtilizationRepositoryMock.DidNotReceive().SummaryFlights(Arg.Any<int>(), Arg.Any<AssetWatchSearchParameters>(), Arg.Any<Api.Repository.Models.AssetWatchGroupingOption>());
        }

    }
}
