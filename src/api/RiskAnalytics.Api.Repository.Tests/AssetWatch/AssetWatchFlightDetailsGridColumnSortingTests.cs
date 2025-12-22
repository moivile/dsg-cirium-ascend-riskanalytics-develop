using NSubstitute;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;

namespace RiskAnalytics.Api.Repository.Tests.AssetWatch;

public class AssetWatchFlightDetailsGridColumnSortingTests
{
    private readonly IAssetWatchFlightDetailsRepository assetWatchRepository;
    private readonly ISnowflakeRepository snowflakeRepositoryMock;

    const string assetWatchFlightDetailsSelectPartQuery = @$"
            WITH main_query AS (
                SELECT
                    ROW_NUMBER() OVER (PARTITION BY flights.aircraft_id ORDER BY flights.tracked_runway_arrival_time_utc) as rk,
                    flights.tracked_runway_arrival_time_utc AS ArrivalDate,
                    departure_airports.name AS LastOriginAirport,
                    arrival_airports.name AS SelectedAirport,
                    arrival_countries.name AS SelectedCountry,
                    CASE
                    WHEN (flights.tracked_arrival_country_id = departure_airports.country_id) THEN 'Domestic'
                    ELSE 'International'
                    END AS RouteCategory,
                    CASE
                    WHEN (flights.is_unscheduled_flight = false) THEN 'Scheduled'
                    WHEN (flights.is_unscheduled_flight = true) THEN 'Unscheduled'
                    ELSE NULL
                    END AS OperationType,
                    CASE
                    WHEN (flights.ground_event_duration_minutes IS NULL) THEN NULL
                    ELSE
                    flights.ground_event_duration_minutes
                    END AS GroundEventTime,
                    CASE
                    WHEN (flights.tracked_air_minutes IS NULL) THEN 0
                    ELSE
                    flights.tracked_air_minutes
                    END AS FlightMinutes,
                    flights.ground_event_model_label AS MaintenanceActivity,
                    flights.tracked_runway_departure_time_utc AS DepartureDate,
                    arrival_airports.name AS NextDestinationAirport
                    FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization flights
                    INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = flights.tracked_arrival_airport_fs_internal
                    INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS departure_airports ON departure_airports.airport_fs_internal = flights.departure_airport_code_fs_internal
                    INNER JOIN {Constants.RiskAnalyticsTablePrefix}countries AS arrival_countries ON arrival_countries.country_id = arrival_airports.country_id
                    WHERE flights.aircraft_id =:aircraftId";

    const string last7daysClause = $" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '7 day') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '7 day') " +
        $"  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '7 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL))) ";

    const string assetWatchFlightDetailsLimitQuery = @$" LIMIT 50 OFFSET 0)";

    public AssetWatchFlightDetailsGridColumnSortingTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        assetWatchRepository = new AssetWatchFlightDetailsRepository(snowflakeRepositoryMock);
    }

    [Fact]
    public async Task GetFlightDetailsData_With_ArrivalDate_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes = new List<string> { "2" },
            SortColumn = "ArrivalDate",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY ArrivalDate DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_ArrivalDate_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "ArrivalDate",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY ArrivalDate ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_LastOriginAirport_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "LastOriginAirport",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY LastOriginAirport DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_LastOriginAirport_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "LastOriginAirport",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY LastOriginAirport ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_SelectedAirport_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "SelectedAirport",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY SelectedAirport DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_SelectedAirport_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "SelectedAirport",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY SelectedAirport ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }
    [Fact]
    public async Task GetFlightDetailsData_With_SelectedCountry_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "SelectedCountry",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY SelectedCountry DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_SelectedCountry_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "SelectedCountry",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY SelectedCountry ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_RouteCategory_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "RouteCategory",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY RouteCategory DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_RouteCategory_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "RouteCategory",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY RouteCategory ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_OperationType_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "OperationType",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY OperationType DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_OperationType_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "OperationType",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY OperationType ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }
    [Fact]
    public async Task GetFlightDetailsData_With_GroundEventTime_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "GroundEventTime",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY GroundEventTime DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_GroundEventTime_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "GroundEventTime",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY GroundEventTime ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }
    [Fact]
    public async Task GetFlightDetailsData_With_MaintenanceActivity_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "MaintenanceActivity",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY MaintenanceActivity DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_MaintenanceActivity_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "MaintenanceActivity",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY MaintenanceActivity ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }
    [Fact]
    public async Task GetFlightDetailsData_With_DepartureDate_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "DepartureDate",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY DepartureDate DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_DepartureDate_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "DepartureDate",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY DepartureDate ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }
    [Fact]
    public async Task GetFlightDetailsData_With_NextDestinationAirport_SortByDescending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "NextDestinationAirport",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY NextDestinationAirport DESC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetFlightDetailsData_With_NextDestinationAirport_SortByAscending__CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            RegionCodes =  new List<string> { "2" },
            SortColumn = "NextDestinationAirport",
            SortOrder = "ASC"
        };
        var parameters = new { aircraftId };
        const string sortByClause = "ORDER BY NextDestinationAirport ASC";
        const string expectedSql = assetWatchFlightDetailsSelectPartQuery +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + sortByClause + assetWatchFlightDetailsLimitQuery  + " SELECT * FROM main_query";

        snowflakeRepositoryMock
            .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }
}
