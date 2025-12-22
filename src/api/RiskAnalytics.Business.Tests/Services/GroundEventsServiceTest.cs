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
    public class GroundEventsServiceTest
    {
        private readonly IGroundEventsRepository GroundEventsRepositoryMock;
        private readonly IPortfolioAuthorizationService portfolioAuthorizationServiceMock;
        private readonly IPortfoliosRepository portfoliosRepositoryMock;
        private readonly IMemoryCache memoryCacheMock;

        private readonly GroundEventsService GroundEventsService;

        public GroundEventsServiceTest()
        {
            GroundEventsRepositoryMock = Substitute.For<IGroundEventsRepository>();
            portfoliosRepositoryMock = Substitute.For<IPortfoliosRepository>();
            portfolioAuthorizationServiceMock = Substitute.For<IPortfolioAuthorizationService>();
            memoryCacheMock = Substitute.For<IMemoryCache>();

            GroundEventsService = new GroundEventsService(
                GroundEventsRepositoryMock,
                portfolioAuthorizationServiceMock,
                portfoliosRepositoryMock,
                memoryCacheMock);
        }

        [Fact]
        public async Task Flights_PortfolioDoesNotExist_ThrowNotFound()
        {
            // arrange
            portfolioAuthorizationServiceMock
                .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new NotFoundException(); });

            // act & assert
            await Assert.ThrowsAsync<NotFoundException>(async () => await GroundEventsService.SummaryGroundEvents("bob", 1, null, Api.Repository.Models.AssetWatchGroupingOption.Airport));
        }

        [Fact]
        public async Task Get_UserDoesNotOwnPortfolio_ThrowForbidden()
        {
            // arrange
            portfolioAuthorizationServiceMock
                .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

            // act & assert
            await Assert.ThrowsAsync<ForbiddenException>(async () => await GroundEventsService.SummaryGroundEvents("bob", 1, null, Api.Repository.Models.AssetWatchGroupingOption.Airport));
        }

        [Fact]
        public async Task SummaryGroundEvents_PortfolioExistsAndOwnedByUserReturnFromRepository_ReturnPortfolio()
        {
            // arrange
            GroundEventsRepositoryMock.SummaryGroundEvents(Arg.Any<int>(), Arg.Any<AssetWatchSearchParameters>(), Api.Repository.Models.AssetWatchGroupingOption.Airport)
                .Returns(new List<SummaryGroundEventsModel> { new SummaryGroundEventsModel
                {
                     Name = "a",
                     ShortStayCount = 5,
                     MediumStayCount = 5,
                     LongStayCount = 5
                }
                });

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            // act
            var stats = await GroundEventsService.SummaryGroundEvents("bob", 1, new AssetWatchSearchParameters(), Api.Repository.Models.AssetWatchGroupingOption.Airport);

            // assert
            Assert.NotNull(stats);
            Assert.Equal(5, stats.First().LongStayCount);
        }

        [Fact]
        public async Task SummaryGroundEvents_GeneratesExpectedCacheKeys()
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

            var cachedResult = new List<SummaryGroundEventsModel>
            {
                new SummaryGroundEventsModel
                {
                    Name = "a",
                    ShortStayCount = 5,
                    MediumStayCount = 5,
                    LongStayCount = 5
                }
            };

            var anyListArg = Arg.Any<List<SummaryGroundEventsModel>>();
            var cacheKey = "RiskAnalytics_AssetWatchSummaryGroundEvents_Results_p1_grp_Region_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123";

            memoryCacheMock.TryGetValue(Arg.Is<string>(cacheKey), out cachedResult)
                .Returns(x =>
                {
                    x[1] = cachedResult;
                    return true;
                });

            // act
            var result = await GroundEventsService.SummaryGroundEvents("bob", 1, filterCriteria, Api.Repository.Models.AssetWatchGroupingOption.Region);

            // assert
            memoryCacheMock.Received().TryGetValue(Arg.Is<string>(cacheKey), out cachedResult);
        }

        [Fact]
        public async Task SummaryGroundEvents_RequestIsCached_GetResponseFromCache()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters();

            object? cachedResult = new List<SummaryGroundEventsModel>
            {
                new SummaryGroundEventsModel
                {
                    Name = "a",
                    ShortStayCount = 5,
                    MediumStayCount = 5,
                    LongStayCount = 5
                }
            };

            var anyListArg = Arg.Any<List<SummaryGroundEventsModel>>();
            var cacheKey = "RiskAnalytics_AssetWatchSummaryGroundEvents_Results_p1_grp_Region";

            memoryCacheMock.TryGetValue(cacheKey, out anyListArg)
                .Returns(x =>
                {
                    x[1] = cachedResult;
                    return true;
                });

            // act
            var result = await GroundEventsService.SummaryGroundEvents("bob", 1, filterCriteria, Api.Repository.Models.AssetWatchGroupingOption.Region);

            // assert
            Assert.NotNull(result);
            Assert.Equal("a", result.First().Name);

            await GroundEventsRepositoryMock.DidNotReceive().SummaryGroundEvents(Arg.Any<int>(), Arg.Any<AssetWatchSearchParameters>(), Arg.Any<Api.Repository.Models.AssetWatchGroupingOption>());
        }

    }
}
