using NSubstitute;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;

namespace RiskAnalytics.Api.Repository.Tests.AssetWatch;

public class AssetWatchFlightDetailsRepositoryTests
{
    private readonly IAssetWatchFlightDetailsRepository assetWatchRepository;
    private readonly ISnowflakeRepository snowflakeRepositoryMock;

    const string assetWatchFlightDetailsQuery_1 = @$"
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
    $" AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '7 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL))) ";

    const string assetWatchFlightDetailsQuery_2 = @$" LIMIT 50 OFFSET 0
    )";

    const string aogLastFlightQuery = $@"alt_query AS (
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
                    WHERE flights.aircraft_id =:aircraftId
                    ORDER BY DepartureDate DESC
                    LIMIT 1
            )";

    const string unionQuery = @$"SELECT * FROM main_query
                UNION ALL
                SELECT * FROM alt_query WHERE NOT EXISTS(SELECT 1 FROM main_query) AND rk=1";

    public AssetWatchFlightDetailsRepositoryTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        assetWatchRepository = new AssetWatchFlightDetailsRepository(snowflakeRepositoryMock);
    }

    [Fact]
    public async Task GetFlightDetailsData_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0
        };

        var parameters = new { aircraftId };

        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithRegion_CallDbWithExpectedQuery()
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
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause +
        " AND flights.tracked_arrival_region_code IN ('2')" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithOperator_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            OperatorIds = new List<int> { 350501 }
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause +
        " AND flights.operator_organization_id IN (350501)" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithLessor_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            LessorIds = new List<int> { 420399 }
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause +
        " AND flights.lessor_organization_id IN (420399)" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithAircraftSeries_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            AircraftSeriesIds = new List<int> { 269 }
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause +
        " AND flights.aircraft_series_id IN (269)" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithEngineSeriesId_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            EngineSerieIds = new List<int> { 4 }
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause +
        " AND flights.engine_series_id IN  (4)" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithAircraftSerialNumber_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            AircraftIds = new List<int> { 863 }
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause +
        " AND flights.aircraft_id IN  (863)" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithCustomDateRangeAndOrderByDepartureDateDesc_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.SelectDateRange,
            DateFrom = new DateTime(2024, 2, 17),
            DateTo = new DateTime(2024, 2, 22),
            SortColumn = "DepartureDate",
            SortOrder = "DESC"
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        $" AND ((tracked_runway_departure_time_utc >='2024-02-17'::date" +
        $" AND tracked_runway_departure_time_utc <'2024-02-23'::date) OR (tracked_runway_departure_time_utc <'2024-02-17'::date AND tracked_runway_arrival_time_utc >='2024-02-17'::date)) ORDER BY DepartureDate DESC" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithEModelLabel_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            MaintenanceActivityIds = new List<int> { 2 },
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithSelectDateRangeButTheDatesFromIsNull_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.SelectDateRange,
            DateFrom = null,
            DateTo = DateTime.Now
        };

        // assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria));
        Assert.Equal(ValidationMessages.MandatoryDateFromDateIsNull, exception.Message);
    }

    [Fact]
    public async Task GetFlightDetailsDataWithSelectDateRangeButTheDatesToIsNull_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.SelectDateRange,
            DateFrom = DateTime.UtcNow,
            DateTo = null
        };

        // assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria));
        Assert.Equal(ValidationMessages.MandatoryDateToDateIsNull, exception.Message);
    }

    [Fact]
    public async Task GetFlightDetailsDataWithAirportCodes_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            AirportCodes = new List<string> { "4" }
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause +
        " AND flights.tracked_arrival_airport_fs_internal IN ('4')" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task GetFlightDetailsDataWithCityIds_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            Cities = new List<string> { "4" }
        };
        var parameters = new { aircraftId };
        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause +
        " AND flights.tracked_arrival_city_name IN (4))" + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

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
    public async Task ListAircraftFlightDetails_AOG_FilterCriteriaNotMatching_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        bool showAircraftOnGround = true;

        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            ShowAircraftOnGround = showAircraftOnGround
        };

        var parameters = new { aircraftId };

        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause + assetWatchFlightDetailsQuery_2 + aogLastFlightQuery + unionQuery;

        snowflakeRepositoryMock
        .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
        .Do(p =>
        {
            calledQuery = p.Arg<string>();
        });

        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task ListAircraftFlightDetails_WithoutAltQuery_CallDbWithExpectedQuery()
    {
        var aircraftId = 123;
        string calledQuery = string.Empty;
        bool showAircraftOnGround = false;

        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last7Days,
            MinNoOfFlights = 5,
            MinIndividualGroundStay = 0,
            MinTotalGroundStay = 0,
            ShowAircraftOnGround = showAircraftOnGround
        };

        var parameters = new { aircraftId };

        const string expectedSql = assetWatchFlightDetailsQuery_1 +
        last7daysClause + assetWatchFlightDetailsQuery_2 + " SELECT * FROM main_query";

        snowflakeRepositoryMock
        .When(t => t.Query<FlightDetailsModel>(Arg.Any<string>(), Arg.Any<object>()))
        .Do(p =>
        {
            calledQuery = p.Arg<string>();
        });

        await assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }


}
