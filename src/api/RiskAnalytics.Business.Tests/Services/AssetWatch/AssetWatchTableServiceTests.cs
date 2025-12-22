using Microsoft.Extensions.Caching.Memory;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.AssetWatch;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;

namespace RiskAnalytics.Business.Tests.Services.AssetWatch
{
    public class AssetWatchTableServiceTests
    {
        private readonly IAssetWatchFlightDetailsRepository assetWatchRepositoryMock;
        private readonly IPortfolioAuthorizationService portfolioAuthorizationServiceMock;
        private readonly IPortfoliosRepository portfoliosRepositoryMock;
        private readonly IMemoryCache memoryCacheMock;
        private readonly IAssetWatchTableRepository assetWatchTableRepository;
        private readonly IAssetWatchMaintenanceActivitiesService assetWatchMaintenanceActivitiesService;

        private readonly AssetWatchTableService assetWatchService;

        private List<AssetWatchListDataGridModel> tuResult = new List<AssetWatchListDataGridModel>
            {
                new AssetWatchListDataGridModel
                {
                    AircraftId = 1,
                    NumberOfFlights = 5,
                    TotalGroundStayHours = 1200,
                    TimesBetweenMinMaxIndGroundStay = 0,
                    MaintenanceActivity = "[1],[2]"
                },
                new AssetWatchListDataGridModel
                {
                    AircraftId = 2,
                    NumberOfFlights = 10,
                    TotalGroundStayHours = 2400,
                    TimesBetweenMinMaxIndGroundStay = 1,
                    MaintenanceActivity = "[4]"
                }
            };

        private List<AssetWatchListDataGridModel> aircraftDetails = new List<AssetWatchListDataGridModel>
            {
                new AssetWatchListDataGridModel
                {
                    AircraftId = 1,
                    CurrentGroundEventDurationMinutes = 1200
                },
                new AssetWatchListDataGridModel
                {
                    AircraftId = 2,
                    CurrentGroundEventDurationMinutes = 2400
                }
            };

        public AssetWatchTableServiceTests()
        {
            assetWatchRepositoryMock = Substitute.For<IAssetWatchFlightDetailsRepository>();
            portfoliosRepositoryMock = Substitute.For<IPortfoliosRepository>();
            portfolioAuthorizationServiceMock = Substitute.For<IPortfolioAuthorizationService>();
            memoryCacheMock = Substitute.For<IMemoryCache>();
            assetWatchTableRepository = Substitute.For<IAssetWatchTableRepository>();
            assetWatchMaintenanceActivitiesService = Substitute.For<IAssetWatchMaintenanceActivitiesService>();

            var repositories = new List<IAssetWatchTableRepository>
            {
                assetWatchTableRepository
            };

            assetWatchService = new AssetWatchTableService(
                memoryCacheMock,
                portfolioAuthorizationServiceMock,
                portfoliosRepositoryMock,
                assetWatchMaintenanceActivitiesService,
                repositories);
        }

        [Fact]
        public async Task GetTableData_PortfolioDoesNotExist_ThrowNotFound()
        {
            // arrange
            portfolioAuthorizationServiceMock
                .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new NotFoundException(); });

            var filterCriteria = new AssetWatchTableSearchParameters();

            // act & assert
            await Assert.ThrowsAsync<NotFoundException>(async () => await assetWatchService.GetTableData(1, filterCriteria, "bob"));
        }

        [Fact]
        public async Task GetTableData_UserDoesNotOwnPortfolio_ThrowForbidden()
        {
            // arrange
            portfolioAuthorizationServiceMock.When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

            var filterCriteria = new AssetWatchTableSearchParameters();

            // act & assert
            await Assert.ThrowsAsync<ForbiddenException>(async () => await assetWatchService.GetTableData(1, filterCriteria, "bob"));
        }

        [Fact]
        public async Task GetTableData_PeriodHandlingRepositoryNotFound_ThrowNullReferenceException()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters();

            // act & assert
            await Assert.ThrowsAsync<NullReferenceException>(async () => await assetWatchService.GetTableData(1, filterCriteria, "bob"));
        }

        [Fact]
        public async Task GetTableData_PortfolioExistsAndOwnedByUser_ReturnExpectedDataFromRepository()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters();


            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(2, data.Count());

            Assert.Equal(1, data[0].AircraftId);
            Assert.Equal(5, data[0].NumberOfFlights);
            Assert.Equal(20, data[0].TotalGroundStayHours);

            Assert.Equal(2, data[1].AircraftId);
            Assert.Equal(10, data[1].NumberOfFlights);
            Assert.Equal(40, data[1].TotalGroundStayHours);
        }

        [Fact]
        public async Task GetTableData_FilteredToAircraftsWith8AndMoreTotalFlights()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinNoOfFlights = 8
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(1, data.Count());
            Assert.Equal(2, data[0].AircraftId);
            Assert.Equal(10, data[0].NumberOfFlights);
            Assert.Equal(40, data[0].TotalGroundStayHours);
        }

        [Fact]
        public async Task GetTableData_FilteredToAircraftsWith34HoursOfGroundStay()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinTotalGroundStay = 34
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(1, data.Count());
            Assert.Equal(2, data[0].AircraftId);
            Assert.Equal(10, data[0].NumberOfFlights);
            Assert.Equal(40, data[0].TotalGroundStayHours);
        }

        [Fact]
        public async Task GetTableData_FilteredAOGWith30HoursOfGroundStay()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinCurrentGroundStay = 30
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(1, data.Count());
            Assert.Equal(2, data[0].AircraftId);
            Assert.Equal(10, data[0].NumberOfFlights);
            Assert.Equal(40, data[0].TotalGroundStayHours);
            Assert.Equal(2400, data[0].CurrentGroundEventDurationMinutes);
        }

        [Fact]
        public async Task GetTableData_FilteredAOGWith30MinHoursAnd60MaxHoursOfGroundStay()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinCurrentGroundStay = 30,
                MaxCurrentGroundStay = 60
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(1, data.Count());
            Assert.Equal(2, data[0].AircraftId);
            Assert.Equal(10, data[0].NumberOfFlights);
            Assert.Equal(40, data[0].TotalGroundStayHours);
            Assert.Equal(2400, data[0].CurrentGroundEventDurationMinutes);
        }

        [Fact]
        public async Task GetTableData_FilteredToAircraftsWith5ExceededStay()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinIndividualGroundStay = 55
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(1, data.Count());
            Assert.Equal(2, data[0].AircraftId);
            Assert.Equal(10, data[0].NumberOfFlights);
            Assert.Equal(40, data[0].TotalGroundStayHours);
            Assert.Equal(1, data[0].TimesBetweenMinMaxIndGroundStay);
        }

        [Fact]
        public async Task GetTableData_ReturnsTwoAircratThatMatchMinNumberOfFlightsAndTotalGroundStay()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinNoOfFlights = 1,
                MinTotalGroundStay = 34
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(2, data.Count());

            Assert.Equal(1, data[0].AircraftId);
            Assert.Equal(5, data[0].NumberOfFlights);
            Assert.Equal(20, data[0].TotalGroundStayHours);

            Assert.Equal(2, data[1].AircraftId);
            Assert.Equal(10, data[1].NumberOfFlights);
            Assert.Equal(40, data[1].TotalGroundStayHours);
        }

        [Fact]
        public async Task GetTableData_ReturnsTwoAircratThatMatchMinNumberOfFlightsAndTimesExceededGroundStay()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinNoOfFlights = 3,
                MinIndividualGroundStay = 1
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(2, data.Count());

            Assert.Equal(1, data[0].AircraftId);
            Assert.Equal(5, data[0].NumberOfFlights);
            Assert.Equal(20, data[0].TotalGroundStayHours);

            Assert.Equal(2, data[1].AircraftId);
            Assert.Equal(10, data[1].NumberOfFlights);
            Assert.Equal(40, data[1].TotalGroundStayHours);
        }

        [Fact]
        public async Task GetTableData_ReturnsTimesBetweenMinMaxIndGroundStayAsNullWhenItIsZero()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinNoOfFlights = 1,
                MinTotalGroundStay = 34
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(2, data.Count());

            Assert.Equal(1, data[0].AircraftId);
            Assert.Equal(5, data[0].NumberOfFlights);
            Assert.Null(data[0].TimesBetweenMinMaxIndGroundStay);
        }

        [Fact]
        public async Task GetTableData_ReturnsTwoAircraftWithReplacedActivityIdsToNames()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters();

            var activities = new List<IdNamePairModel>
            {
                new IdNamePairModel { Id = 1, Name = "CCheck" },
                new IdNamePairModel { Id = 2, Name = "Repaint" },
                new IdNamePairModel { Id = 4, Name = "WheelCheck" }
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchMaintenanceActivitiesService.GetMaintenanceActivities()
                .Returns(activities);

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(2, data.Count());

            Assert.Equal("CCheck,Repaint", data[0].MaintenanceActivity);
            Assert.Equal("WheelCheck", data[1].MaintenanceActivity);
        }

        [Fact]
        public async Task GetTableData_ReturnsTwoAircratThatMatchTotalGroundStayAndTimesExceededGroundStay()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                MinTotalGroundStay = 8,
                MinIndividualGroundStay = 1
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(aircraftDetails);

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(tuResult);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);

            var data = result.AssetWatchListDataGrid.ToList();

            Assert.NotNull(data);
            Assert.Equal(2, data.Count());

            Assert.Equal(1, data[0].AircraftId);
            Assert.Equal(5, data[0].NumberOfFlights);
            Assert.Equal(20, data[0].TotalGroundStayHours);

            Assert.Equal(2, data[1].AircraftId);
            Assert.Equal(10, data[1].NumberOfFlights);
            Assert.Equal(40, data[1].TotalGroundStayHours);
        }

        [Fact]
        public async Task GetTableData_GeneratesExpectedCacheKeys()
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
                MaintenanceActivityIds = new List<int> { 5 },
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 6
            };

            var cachedResult = new List<AssetWatchListDataGridModel>
        {
            new AssetWatchListDataGridModel
            {
                AircraftId = 6
            }
        };

            int? cachedTotalResultCount = 1;

            memoryCacheMock.TryGetValue("RiskAnalytics_AssetWatchFlight_Results_p1_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123_minF5_minI6_mAct5_rCAll_skip0_take50_0001-01-01 00:00:00.000", out cachedResult)
                .Returns(true);

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>()).Returns(true);

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            memoryCacheMock.Received().TryGetValue(Arg.Is<string>(i => i == "RiskAnalytics_AssetWatchFlight_Results_p1_sd1___2020_ed2___2020_cy5_g4_o1_l2_a3_e4_s123_minF5_mAct5_minI6_skip0_take50_0001-01-01 00:00:00.000"), out cachedResult);
        }

        [Fact]
        public async Task GetTableData_RequestIsCached_GetResponseFromCache()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters();

            var cachedResult = new List<AssetWatchListDataGridModel>
            {
                new AssetWatchListDataGridModel
                {
                    AircraftId = 6
                }
            };

            var cachedTotalResultCount = 1;

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            object cachedResultOut = cachedResult;
            memoryCacheMock.TryGetValue("RiskAnalytics_AssetWatchFlight_Results_p1_skip0_take50_0001-01-01 00:00:00.000", out Arg.Any<object>())
                .Returns(x =>
                {
                    x[1] = cachedResultOut;
                    return true;
                });


            object cachedTotalResultCountOut = cachedTotalResultCount;
            memoryCacheMock.TryGetValue("RiskAnalytics_AssetWatchFlight_ResultCountp1_0001-01-01 00:00:00.000", out Arg.Any<object>())
                .Returns(x =>
                {
                    x[1] = cachedTotalResultCountOut;
                    return true;
                });

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);
            Assert.NotNull(result.AssetWatchListDataGrid);
            Assert.Equal(6, result.AssetWatchListDataGrid.First().AircraftId);
            await assetWatchTableRepository.DidNotReceive().GetTrackedUtilizationData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>());
        }

        [Fact]
        public async Task GetTableData_WithNonEmptyFilterCriteria()
        {
            // arrange
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                RegionCodes
                    = new List<string> { "1", "2" },
            };
            var portfolioAircraft = new List<AssetWatchListDataGridModel>
            {
                new AssetWatchListDataGridModel
                {
                    AircraftId = 1,
                    NumberOfFlights = 5,
                    TotalGroundStayHours = 1200,
                    TimesBetweenMinMaxIndGroundStay = 0,
                    MaintenanceActivity = "[1],[2]",
                    RouteCategory = "Domestic",
                    Region = "Region1",
                },
                new AssetWatchListDataGridModel
                {
                    AircraftId = 3,
                    NumberOfFlights = 10,
                    TotalGroundStayHours = 2400,
                    TimesBetweenMinMaxIndGroundStay = 1,
                    MaintenanceActivity = "[4]",
                    RouteCategory = "International",
                    Region = "Region2"
                }
            };
            var tuResult = new List<AssetWatchListDataGridModel>
            {
                new AssetWatchListDataGridModel
                {
                    AircraftId = 1,
                    NumberOfFlights = 5,
                    TotalGroundStayHours = 1200,
                    TimesBetweenMinMaxIndGroundStay = 0,
                    MaintenanceActivity = "[1],[2]",
                    RouteCategory = "Domestic",
                    Region = "Region1",
                },
                new() {
                    AircraftId = 2,
                    NumberOfFlights = 10,
                    TotalGroundStayHours = 2400,
                    TimesBetweenMinMaxIndGroundStay = 1,
                    MaintenanceActivity = "[4]",
                    RouteCategory = "International",
                    Region = "Region2"
                }
            };
            var filterValues = new AssetWatchGeographicFilterValues
            {
                Regions = new List<string> { "Region1" },
                Countries = new List<string> { "Country1" },
                Cities = new List<string> { "City1" },
                Airports = new List<string> { "Airport1" }
            };

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            assetWatchTableRepository.CanHandle(Arg.Any<AssetWatchTableSearchParameters>())
                .Returns(true);

            assetWatchTableRepository.GetPortfolioAircraft(Arg.Any<int>(), filterCriteria)
                .Returns(Task.FromResult<IEnumerable<AssetWatchListDataGridModel>>(portfolioAircraft));

            assetWatchTableRepository.GetTrackedUtilizationData(Arg.Any<int>(), filterCriteria)
                .Returns(Task.FromResult<IEnumerable<AssetWatchListDataGridModel>>(tuResult));

            assetWatchTableRepository.GetGeographicFilterValues(filterCriteria)
                .Returns(Task.FromResult(filterValues));

            // act
            var result = await assetWatchService.GetTableData(1, filterCriteria, "bob");

            // assert
            Assert.NotNull(result);
            Assert.NotNull(result.AssetWatchListDataGrid);
            Assert.Single(result.AssetWatchListDataGrid);
            Assert.Equal(1, result.AssetWatchListDataGrid.First().AircraftId);
        }


        [Fact]
        public void HasValuesExcludingSpecifiedParameters_AllParametersNull_ReturnsFalse()
        {
            var filter = new AssetWatchTableSearchParameters();
            Assert.False(assetWatchService.HasValuesExcludingSpecifiedParameters(filter));
        }
        [Fact]
        public void HasValuesExcludingSpecifiedParameters_SingleParameterHasValue_ReturnsTrue()
        {
            var filter = new AssetWatchTableSearchParameters();
            filter.MinNoOfFlights = 5;
            Assert.True(assetWatchService.HasValuesExcludingSpecifiedParameters(filter));
        }

        [Fact]
        public void HasValuesExcludingSpecifiedParameters_MultipleParametersHaveValues_ReturnsTrue()
        {
            var filter = new AssetWatchTableSearchParameters();
            filter.MinNoOfFlights = 5;
            filter.MaintenanceActivityIds = new List<int>() { 1, 2, 3 };
            Assert.True(assetWatchService.HasValuesExcludingSpecifiedParameters(filter));
        }

        [Fact]
        public void HasValuesExcludingSpecifiedParameters_NullableIntegerListIsEmpty_ReturnsFalse()
        {
            var filter = new AssetWatchTableSearchParameters();
            filter.MaintenanceActivityIds = new List<int>();
            Assert.False(assetWatchService.HasValuesExcludingSpecifiedParameters(filter));
        }

        [Fact]
        public void DoesRowMatchFilterCriteria_NullRegion_ReturnsFalse()
        {
            // Arrange
            var filter = new AssetWatchTableSearchParameters();
            var filterValues = new AssetWatchGeographicFilterValues();
            filterValues.Regions = new List<string> { "Region1" };
            var row = new AssetWatchListDataGridModel { Region = null };

            // Act
            var result = assetWatchService.DoesRowMatchFilterCriteria(filter, row, filterValues);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void DoesRowMatchFilterCriteria_NullCountry_ReturnsFalse()
        {
            // Arrange
            var filter = new AssetWatchTableSearchParameters();
            var filterValues = new AssetWatchGeographicFilterValues();
            filterValues.Countries = new List<string> { "Country1" };
            var row = new AssetWatchListDataGridModel { Country = null };

            // Act
            var result = assetWatchService.DoesRowMatchFilterCriteria(filter, row, filterValues);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void DoesRowMatchFilterCriteria_NullCity_ReturnsFalse()
        {
            // Arrange
            var filter = new AssetWatchTableSearchParameters();
            var filterValues = new AssetWatchGeographicFilterValues();
            filterValues.Cities = new List<string> { "City1" };
            var row = new AssetWatchListDataGridModel { City = null };

            // Act
            var result = assetWatchService.DoesRowMatchFilterCriteria(filter, row, filterValues);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void DoesRowMatchFilterCriteria_NullAirport_ReturnsFalse()
        {
            // Arrange
            var filter = new AssetWatchTableSearchParameters();
            var filterValues = new AssetWatchGeographicFilterValues();
            filterValues.Airports = new List<string> { "Airport1" };
            var row = new AssetWatchListDataGridModel { CurrentGroundEventAirportName = null };

            // Act
            var result = assetWatchService.DoesRowMatchFilterCriteria(filter, row, filterValues);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void DoesRowMatchFilterCriteria_InvalidRouteCategory_ReturnsFalse()
        {
            // Arrange
            var filter = new AssetWatchTableSearchParameters { RouteCategory = AssetWatchRouteCategory.International };
            var filterValues = new AssetWatchGeographicFilterValues();
            var row = new AssetWatchListDataGridModel { RouteCategory = "Domestic" };

            // Act
            var result = assetWatchService.DoesRowMatchFilterCriteria(filter, row, filterValues);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void ShouldRemoveRowBasedOnFilterCriteria_RowDoesNotMatchCriteria_ReturnsFalse()
        {
            var trackedUtilizationDetails = new AssetWatchListDataGridModel();
            var filter = new AssetWatchTableSearchParameters();
            var row = new AssetWatchListDataGridModel();
            var filterValues = new AssetWatchGeographicFilterValues();

            filter.ShowAircraftOnGround = true;

            // Act
            var result = assetWatchService.ShouldRemoveRowBasedOnFilterCriteria(trackedUtilizationDetails, filter, row, filterValues);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void ShouldRemoveRowBasedOnFilterCriteria_RowDoesNotMatchGeographicCriteriaAndShowAircraftOnGround_True()
        {
            // Setup the parameters
            AssetWatchListDataGridModel trackedUtilizationDetails = null;
            var filter = new AssetWatchTableSearchParameters { ShowAircraftOnGround = true };
            var row = new AssetWatchListDataGridModel();
            var filterValues = new AssetWatchGeographicFilterValues();

            var result = assetWatchService.ShouldRemoveRowBasedOnFilterCriteria(trackedUtilizationDetails, filter, row, filterValues);

            Assert.True(result);
        }

        [Fact]
        public void ShouldRemoveRowBasedOnFilterCriteria_TrackedUtilizationNull_FilterValuesNotNull_RowNotMatchingCriteria_True()
        {
            // Setup the parameters
            AssetWatchListDataGridModel trackedUtilizationDetails = null;
            var filter = new AssetWatchTableSearchParameters();
            var row = new AssetWatchListDataGridModel();
            var filterValues = new AssetWatchGeographicFilterValues();

            var result = assetWatchService.ShouldRemoveRowBasedOnFilterCriteria(trackedUtilizationDetails, filter, row, filterValues);

            Assert.True(result);
        }



    }
}
