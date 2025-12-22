using Microsoft.Extensions.Caching.Memory;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.AssetWatch;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;

namespace RiskAnalytics.Business.Tests.Services.AssetWatch;

public class AssetWatchFlightDetailsServiceTests
{
    private readonly IAssetWatchFlightDetailsRepository assetWatchRepositoryMock;
    private readonly IAircraftRepository aircraftRepositoryMock;
    private readonly IMemoryCache memoryCacheMock;

    private readonly AssetWatchFlightDetailsService assetWatchService;

    public AssetWatchFlightDetailsServiceTests()
    {
        assetWatchRepositoryMock = Substitute.For<IAssetWatchFlightDetailsRepository>();
        aircraftRepositoryMock = Substitute.For<IAircraftRepository>();
        memoryCacheMock = Substitute.For<IMemoryCache>();

        assetWatchService = new AssetWatchFlightDetailsService(
            assetWatchRepositoryMock,
            memoryCacheMock,
            aircraftRepositoryMock);
    }

    [Fact]
    public async Task GetFlightDetailsData_ReturnExpectedDataFromRepository()
    {
        // arrange
        var filterCriteria = new AssetWatchTableSearchParameters();
        var repositoryResult = new List<FlightDetailsModel>();

        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        assetWatchRepositoryMock.ListAircraftFlightDetails(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
            .Returns(repositoryResult);

        assetWatchRepositoryMock.AircraftFlightsCount(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
            .Returns(5);

        // act
        var result = await assetWatchService.GetFlightDetails(1, filterCriteria);

        // assert
        Assert.NotNull(result);
        Assert.Equal(5, result.TotalResultCount);
    }

    [Fact]
    public async Task GetFlightDetailsData_GeneratesExpectedCacheKeys()
    {
        // arrange
        var filterCriteria = new AssetWatchTableSearchParameters
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
            AircraftSeriesIds = new List<int> { 3 },
            SortColumn = "groundEventTime",
            SortOrder = "desc",
            MaintenanceActivityIds = new List<int>(){5},
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 6,
            Skip = 50,
            Take = 25
        };

        var cachedResult = new List<FlightDetailsModel>
        {
            new FlightDetailsModel
            {
                ArrivalDate = new DateTime(2020, 1, 1)
            }
        };

        int cachedTotalResultCount = 1;
        var anyListArg = Arg.Any<List<FlightDetailsModel>>();
        int? anyIntArg = 2;

        memoryCacheMock.TryGetValue("RiskAnalytics_FlightDetails_Results_p1_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123_minF5_minI6_mAct5_rCAll_sortColgroundEventTime_sortOrddesc_skip50_take25", out anyListArg)
            .Returns(x =>
            {
                x[1] = cachedResult;
                return true;
            });

        memoryCacheMock.TryGetValue("RiskAnalytics_FlightDetails_ResultCountp1_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123_minF5_minI6_mAct5_rCAll", out anyIntArg)
        .Returns(x =>
        {
            x[1] = cachedTotalResultCount;
            return true;
        });

        // act
        var result = await assetWatchService.GetFlightDetails(1, filterCriteria);

        // assert
        memoryCacheMock.Received().TryGetValue("RiskAnalytics_FlightDetails_Results_p1_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123_minF5_mAct5_minI6_sortColgroundEventTime_sortOrddesc_skip50_take25", out cachedResult);
        memoryCacheMock.Received().TryGetValue("RiskAnalytics_FlightDetails_ResultCountp1_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123_minF5_mAct5_minI6", out cachedTotalResultCount);
    }

    [Fact]
    public async Task GetFlightDetailsData_GetResponseFromCache()
    {
        // arrange
        var filterCriteria = new AssetWatchTableSearchParameters();

        object? cachedResult = new List<FlightDetailsModel>
        {
            new FlightDetailsModel
            {
                ArrivalDate = new DateTime(2020, 1, 1)
            }
        };

        var anyListArg = Arg.Any<List<FlightDetailsModel>>();
        int? anyIntArg = 1;
        int? cachedTotalResultCount = 1;

        memoryCacheMock.TryGetValue("RiskAnalytics_FlightDetails_Results_p1_skip0_take50", out anyListArg)
            .Returns(x =>
            {
                x[1] = cachedResult;
                return true;
            });
        memoryCacheMock.TryGetValue("RiskAnalytics_FlightDetails_ResultCountp1", out anyIntArg)
            .Returns(x =>
            {
                x[1] = cachedTotalResultCount;
                return true;
            });

        // act
        var result = await assetWatchService.GetFlightDetails(1, filterCriteria);

        // assert
        Assert.NotNull(result);
        Assert.Equal(1, result.TotalResultCount);
        Assert.NotNull(result.FlightDetails);
        Assert.Equal(new DateTime(2020, 1, 1), result.FlightDetails.First().ArrivalDate);
        await assetWatchRepositoryMock.DidNotReceive().AircraftFlightsCount(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>());
        await assetWatchRepositoryMock.DidNotReceive().ListAircraftFlightDetails(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>());
    }

    [Fact]
    public async Task ReplaceLastFlightOnGroundHours_ApplyTheAOGTimeToTheFlightWithUnknownNextAirport()
    {
        // arrange
        aircraftRepositoryMock.Get(Arg.Any<int>())
            .Returns(new Api.Repository.Entities.Aircraft
            {
                Id = 1,
                Current_ground_event_duration_minutes =150
            });

        var flights = new List<FlightDetailsModel>
        {
            new FlightDetailsModel
            {
                ArrivalDate = new DateTime(2020, 1, 1),
                DepartureDate = new DateTime(2020, 1, 2),
                NextDestinationAirport = "LHR",
                GroundEventTime = 100
            },
            new FlightDetailsModel
            {
                ArrivalDate = new DateTime(2020, 1, 1),
                DepartureDate = new DateTime(2020, 1, 2),
                GroundEventTime = 100
            }
        };

        // act
        var result = await assetWatchService.ReplaceLastFlightOnGroundHours(1, flights);

        // assert
        Assert.NotNull(result);
        Assert.Equal(150, result.Last().GroundEventTime);
    }

    [Fact]
    public async Task ReplaceLastFlightOnGroundHours_AllFlightsAreInProgress_NothingToApply()
    {
        // arrange
        aircraftRepositoryMock.Get(Arg.Any<int>())
            .Returns(new Api.Repository.Entities.Aircraft
            {
                Id = 1,
                Current_ground_event_duration_minutes = 150
            });

        var flights = new List<FlightDetailsModel>
        {
            new FlightDetailsModel
            {
                ArrivalDate = new DateTime(2020, 1, 1),
                DepartureDate = new DateTime(2020, 1, 2),
                NextDestinationAirport = "LHR",
                GroundEventTime = 100
            },
            new FlightDetailsModel
            {
                ArrivalDate = new DateTime(2020, 1, 1),
                DepartureDate = new DateTime(2020, 1, 2),
                GroundEventTime = 100,
                NextDestinationAirport = "JFK"
            }
        };

        // act
        var result = await assetWatchService.ReplaceLastFlightOnGroundHours(1, flights);

        // assert
        Assert.NotNull(result);
        Assert.Equal(100, result.Last().GroundEventTime);
    }
}
