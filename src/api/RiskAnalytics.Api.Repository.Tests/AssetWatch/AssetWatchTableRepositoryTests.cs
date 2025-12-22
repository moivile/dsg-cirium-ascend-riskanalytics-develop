using System.Text;
using NSubstitute;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.AssetWatch;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests;

public class AssetWatchTableRepositoryTests
{
    private readonly IAssetWatchTableRepository assetWatchRepository;
    private readonly ISnowflakeRepository snowflakeRepositoryMock;
    const string assetWatchTableDataQuery_1 =
                    @$"SELECT
            flights.aircraft_id AS aircraftid,
            COUNT(*) AS numberofflights,
            SUM(flights.tracked_air_minutes) AS totalFlightMinutes,

            COALESCE(SUM(IFNULL(flights.ground_event_duration_minutes, 0)), 0) AS totalgroundstayhours,
            LISTAGG('[' || flights.ground_event_model_label_id || ']', ', ') WITHIN GROUP (ORDER BY flights.ground_event_model_label_id) AS maintenanceActivity,
            SUM(CASE
            WHEN :MinIndividualGroundStay = 0 AND :MaxIndividualGroundStay > 0 THEN
                CASE
                    WHEN flights.ground_event_duration_minutes <= :MaxIndividualGroundStay * 60 THEN 1
                    ELSE 0
                END
            WHEN :MaxIndividualGroundStay = 0 AND :MinIndividualGroundStay > 0 THEN
                CASE
                    WHEN flights.ground_event_duration_minutes >= :MinIndividualGroundStay * 60 THEN 1
                    ELSE 0
                END
            WHEN :MaxIndividualGroundStay > 0 AND :MinIndividualGroundStay > 0 THEN
                CASE
                    WHEN flights.ground_event_duration_minutes BETWEEN :MinIndividualGroundStay * 60 AND :MaxIndividualGroundStay * 60 THEN 1
                    ELSE 0
                END
            ELSE 0
            END) AS timesBetweenMinMaxIndGroundStay
            FROM
            {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization flights
            WHERE flights.aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id=:portfolioId) AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '12 month') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '12 month')  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '12 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))";

    const string assetWatchTableDataQuery_2 = @$"
            GROUP BY
            flights.aircraft_id
            ";

    const string portfolioAircraftQuery =
        $@"SELECT
                a.aircraft_id AS aircraftid,
                ra_aircraft.aircraft_serial_number AS aircraftserialnumber,
                ra_aircraft.aircraft_registration_number AS aircraftregistrationnumber,
                ra_aircraft.aircraft_series AS aircraftseries,
                aircraft_status_history.status AS aircraftstatus,
                ra_aircraft.operator AS operatorname,
                ra_aircraft.manager AS managername,
                ra_aircraft.last_flight_date,
                ra_aircraft.Current_Ground_Event_Airport_Name AS CurrentGroundEventAirportName,
                ra_aircraft.Current_Ground_Event_Duration_Minutes AS CurrentGroundEventDurationMinutes,
                ra_aircraft.tracked_arrival_region_name AS region,
                ra_aircraft.tracked_arrival_country_name AS country,
                ra_aircraft.tracked_arrival_city_name AS city,
                ra_aircraft.route_category AS routecategory,
                es.name AS engineSeriesName
                FROM
                {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS a
                LEFT JOIN {Constants.RiskAnalyticsTablePrefix}aircraft AS ra_aircraft ON ra_aircraft.aircraft_id=a.aircraft_id
                INNER JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON ra_aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.is_current = true
                INNER JOIN ""aircraft_all_history_latest"" AS aah ON aah.aircraft_id = a.aircraft_id
                INNER JOIN ""aircraft_configurations_latest"" AS ac ON ac.aircraft_configuration_id = aah.aircraft_configuration_id
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}engine_series AS es ON es.name = ac.engine_series
                LEFT JOIN ""organizations_latest"" as lessor ON lessor.organization_id = aah.manager_organization_id AND lessor.organization_sub_type_id=88

                WHERE portfolio_id=:portfolioId";

    public AssetWatchTableRepositoryTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        assetWatchRepository = new AssetWatchTableRepository(snowflakeRepositoryMock);
    }

    [Fact]
    public async Task GetTableData_CallDbWithExpectedQuery()
    {
        var portfolioId = 11;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months
        };

        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };

        const string expectedSql = assetWatchTableDataQuery_1 + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetTableDataWithRegion_CallDbWithExpectedQuery()
    {
        var portfolioId = 11;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            RegionCodes = new List<string> { "2", "6" }
        };
        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
        const string expectedSql = assetWatchTableDataQuery_1 + " AND flights.tracked_arrival_region_code IN ('2','6')" + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetAssetWatchListGridDataWithOperator_CallDbWithExpectedQuery()
    {
        var portfolioId = 11;
        string calledQuery = string.Empty;

        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            OperatorIds = new List<int> { 350501, 6 }
        };
        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
        const string expectedSql = assetWatchTableDataQuery_1 + " AND flights.operator_organization_id IN (350501,6)" + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);
        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetAssetWatchListGridDataWithLessor_CallDbWithExpectedQuery()
    {
        var portfolioId = 10;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            LessorIds = new List<int> { 420399, 2 }
        };
        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
        const string expectedSql = assetWatchTableDataQuery_1 + " AND flights.lessor_organization_id IN (420399,2)" + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetAssetWatchListGridDataWithAircraftSeries_CallDbWithExpectedQuery()
    {
        var portfolioId = 10;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            AircraftSeriesIds = new List<int> { 269 }
        };
        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
        const string expectedSql = assetWatchTableDataQuery_1 + " AND flights.aircraft_series_id IN (269)" + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetAssetWatchListGridDataWithEngineSeries_CallDbWithExpectedQuery()
    {
        var portfolioId = 10;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            EngineSerieIds = new List<int> { 4 }
        };
        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
        const string expectedSql = assetWatchTableDataQuery_1 + " AND flights.engine_series_id IN  (4)" + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetAssetWatchListGridDataWithCityIds_CallDbWithExpectedQuery()
    {
        var portfolioId = 10;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            Cities = new List<string> { "4" }
        };
        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
        const string expectedSql = assetWatchTableDataQuery_1 + " AND flights.tracked_arrival_city_name IN ('4')" + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetAssetWatchListGridDataWithAirportCodes_CallDbWithExpectedQuery()
    {
        var portfolioId = 10;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            AirportCodes = new List<string> { "4" }
        };
        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
        const string expectedSql = assetWatchTableDataQuery_1 + " AND flights.tracked_arrival_airport_fs_internal IN ('4')" + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetAssetWatchListGridDataWithAircraftSerialNumber_CallDbWithExpectedQuery()
    {
        var portfolioId = 10;
        string calledQuery = string.Empty;

        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            AircraftIds = new List<int> { 5 }
        };
        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
        const string expectedSql = assetWatchTableDataQuery_1 + " AND flights.aircraft_id IN  (5)" + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetGroundEventsTableData_WithMaintenanceActivity_CallDbWithExpectedQuery()
    {
        var portfolioId = 11;
        string calledQuery = string.Empty;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            MaintenanceActivityIds = new List<int> { 1 }
        };

        var whereClause = " AND flights.ground_event_model_label_id IN (1)";

        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, filterCriteria.MaintenanceActivityIds, portfolioId };
        var expectedSql = assetWatchTableDataQuery_1 + whereClause + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetGroundEventsTableData_AircraftOnGround_CallDbWithExpectedQuery()
    {
        var portfolioId = 11;
        string calledQuery = string.Empty;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            ShowAircraftOnGround = true
        };

        var whereClause = new StringBuilder();
        if (filterCriteria.ShowAircraftOnGround)
        {
            whereClause.Append($" AND flights.is_ground_event_end_unknown=true");
        }

        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, filterCriteria.MaintenanceActivityIds, portfolioId };
        var expectedSql = assetWatchTableDataQuery_1 + whereClause + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetTableData_CallWithSelectDateRangeButTheDatesFromIsNull_ThrowsArgumentException()
    {
        var portfolioId = 10;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.SelectDateRange,
            DateFrom = null,
            DateTo = DateTime.Now
        };

        // act
        // assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria));
        Assert.Equal(ValidationMessages.MandatoryDateFromDateIsNull, exception.Message);
    }

    [Fact]
    public async Task GetTableData_CallWithSelectDateRangeButTheDatesToIsNull_ThrowsArgumentException()
    {
        var portfolioId = 10;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.SelectDateRange,
            DateFrom = DateTime.UtcNow,
            DateTo = null
        };

        // act
        // assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria));
        Assert.Equal(ValidationMessages.MandatoryDateToDateIsNull, exception.Message);
    }

    [Theory]
    [InlineData(AssetWatchSearchPeriod.Yesterday, "0", "0", 0, 0, 0, 0, 0, true)]
    [InlineData(AssetWatchSearchPeriod.Last1Month, "0", "0", 0, 0, 0, 0, 0, true)]
    [InlineData(AssetWatchSearchPeriod.Last3Months, "0", "0", 0, 0, 0, 0, 0, true)]
    [InlineData(AssetWatchSearchPeriod.Last7Days, "0", "0", 0, 0, 0, 0, 0, true)]
    [InlineData(AssetWatchSearchPeriod.Last6Months, "0", "0", 0, 0, 0, 0, 0, true)]
    [InlineData(AssetWatchSearchPeriod.Last12Months, "0", "0", 0, 0, 0, 0, 0, true)]

    [InlineData(AssetWatchSearchPeriod.Last6Months, "1", "0", 0, 0, 0, 0, 0, true)]
    [InlineData(AssetWatchSearchPeriod.Last12Months, "1", "0", 0, 0, 0, 0, 0, true)]

    public void CanHandle_ReturnsExpectedBoolean(
        AssetWatchSearchPeriod period,
        string regionId,
        string countryId,
        int operatorId,
        int lessorId,
        int aircraftSeriesId,
        int engineSerieId,
        int aircraftIds,
        bool expectedOutput)
    {
        //arrange

        var sssetWatchTableSearchParameters = new AssetWatchTableSearchParameters
        {
            Period = period,
            RegionCodes = new List<string> { regionId },
            CountryCodes = new List<string> { countryId },
            OperatorIds = operatorId == 0 ? null : new List<int> { operatorId },
            LessorIds = lessorId == 0 ? null : new List<int> { lessorId },
            AircraftSeriesIds = aircraftSeriesId == 0 ? null : new List<int> { aircraftSeriesId },
            EngineSerieIds = engineSerieId == 0 ? null : new List<int> { engineSerieId },
            AircraftIds = aircraftIds == 0 ? null : new List<int> { aircraftIds }
        };

        // act
        var result = assetWatchRepository.CanHandle(sssetWatchTableSearchParameters);

        // assert
        Assert.Equal(expectedOutput, result);
    }

    [Fact]
    public async Task GetPortfolioAircraft_CallWithOperatorId_GenerateExpectedSql()
    {
        var portfolioId = 10;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            OperatorIds = new List<int> { 4 }
        };

        const string expectedSql = portfolioAircraftQuery + " AND aah.operator_organization_id IN (4)";

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetPortfolioAircraft(portfolioId, filterCriteria);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetDateModified_ReturnsCorrectDateTime()
    {
        //Arrange
        var portfolioId = 10;
        var expectedDateTime = new DateTime(2024, 1, 1);

        snowflakeRepositoryMock.ExecuteScalar<DateTime>(Arg.Any<string>(), Arg.Any<object>()).Returns(expectedDateTime);

        //Act
        var result = await assetWatchRepository.GetDateModified(portfolioId);

        //Assert
        Assert.Equal(expectedDateTime, result);
    }

    [Fact]
    public async Task GetDateModified_CallWithPortfolioId_GenerateExpectedSql()
    {
        var portfolioId = 10;
        string calledQuery = string.Empty;

        const string expectedSql = $"SELECT date_modified FROM {Constants.RiskAnalyticsTablePrefix}portfolios WHERE id=:portfolioId";

        snowflakeRepositoryMock
            .When(t => t.ExecuteScalar<DateTime>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetDateModified(portfolioId);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetTableData_WithMinIndividualGroundStay_CallDbWithExpectedQuery()
    {
        var portfolioId = 11;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            MinIndividualGroundStay = 5
        };

        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };

        const string expectedSql = assetWatchTableDataQuery_1 + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.Contains("MinIndividualGroundStay", calledQuery);
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetTableData_WithMaxIndividualGroundStay_CallDbWithExpectedQuery()
    {
        var portfolioId = 11;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            MaxIndividualGroundStay = 10
        };

        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };

        const string expectedSql = assetWatchTableDataQuery_1 + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p => calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.Contains("MaxIndividualGroundStay", calledQuery);
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetTableData_WithMinAndMaxIndividualGroundStay_CallDbWithExpectedQuery()
    {
        var portfolioId = 11;
        string calledQuery = string.Empty;
        var filterCriteria = new AssetWatchTableSearchParameters
        {
            Period = AssetWatchSearchPeriod.Last12Months,
            MinIndividualGroundStay = 5,
            MaxIndividualGroundStay = 10
        };

        var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MaxIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };

        const string expectedSql = assetWatchTableDataQuery_1 + assetWatchTableDataQuery_2;

        snowflakeRepositoryMock
            .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p => calledQuery = p.Args().First() as string);

        // act
        await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

        // assert
        Assert.Contains("MinIndividualGroundStay", calledQuery);
        Assert.Contains("MaxIndividualGroundStay", calledQuery);
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }
}
