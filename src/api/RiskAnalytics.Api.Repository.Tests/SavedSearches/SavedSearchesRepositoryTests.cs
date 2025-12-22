using NSubstitute;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.AssetWatchSavedSearches;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests.SavedSearches;

public class SavedSearchesRepositoryTests
{
    private readonly ISnowflakeRepository snowflakeRepositoryMock;
    private readonly SavedSearchesRepository savedSearchesRepository;

    public SavedSearchesRepositoryTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        savedSearchesRepository = new SavedSearchesRepository(snowflakeRepositoryMock);
    }

    [Fact]
    public async Task GetAll_ExecutesQueryWithExpectedSql()
    {
        // act
        await savedSearchesRepository.GetAll("x");

        // assert
        var expectedSql = $@"SELECT ss.*, p.name as PortfolioName
           FROM {Constants.EmailAlertingTablePrefix}saved_searches ss
           JOIN {Constants.RiskAnalyticsTablePrefix}portfolios p ON ss.portfolio_Id = p.id
           WHERE ss.user_id =:userId AND ss.date_deleted IS NULL
           ORDER BY ss.date_created DESC";

        await snowflakeRepositoryMock.Received().Query<dynamic>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<object?>());
    }

    [Fact]
    public async Task Get_ExecutesQueryWithExpectedSql()
    {
        // arrange
        var savedSearch = new[] { new Entities.SavedSearch() };

        int id = 5;
        var parameters = new { id };

        var expectedSql = @$"SELECT *
                FROM {Constants.EmailAlertingTablePrefix}saved_searches
                WHERE id =:id AND date_deleted IS NULL";

        await snowflakeRepositoryMock.Query<dynamic>(Arg.Any<string>(), Arg.Any<object?>());

        // act
        await savedSearchesRepository.Get(id);

        // assert

        await snowflakeRepositoryMock.Received().Query<dynamic>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<object?>());
    }

    [Fact]
    public async Task Delete_ExecutesQueryWithExpectedSql()
    {
        // act
        await savedSearchesRepository.Delete(1, "");

        // assert
        var expectedSql = @$"DELETE
            FROM {Constants.EmailAlertingTablePrefix}saved_searches
            WHERE id =:id AND user_id =:userId";

        await snowflakeRepositoryMock.Received().ExecuteScalar<int>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<object?>());
    }

    [Fact]
    public async Task IsNameUnique_ExecutesQueryWithExpectedSql()
    {
        // act
        await savedSearchesRepository.IsNameUnique("", "");

        // assert
        var expectedSql = @$"SELECT
                    COUNT(*)
                FROM {Constants.EmailAlertingTablePrefix}saved_searches
                WHERE name =:name AND user_id =:userId";

        await snowflakeRepositoryMock.Received().ExecuteScalar<int>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<object?>());
    }

    [Fact]
    public async Task Create_ExecutesQueryWithExpectedSql()
    {
        // act
        var savedSearch = new Entities.SavedSearch();
        await savedSearchesRepository.Create(savedSearch, "");
        var dateCreated = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, DateTime.UtcNow.Hour, DateTime.UtcNow.Minute, 0);

        var insertObject = new
        {
            savedSearch.PortfolioId,
            savedSearch.Name,
            savedSearch.Description,
            savedSearch.IsActive,
            MaintenanceActivityIds = savedSearch.MaintenanceActivityIds,
            savedSearch.MinNoOfFlights,
            savedSearch.MinTotalGroundStay,
            savedSearch.MinIndividualGroundStay,
            savedSearch.MinCurrentGroundStay,
            savedSearch.MaxCurrentGroundStay,
            savedSearch.MaxIndividualGroundStay,
            savedSearch.ShowAircraftOnGround,
            RegionCodes = savedSearch.RegionCodes,
            savedSearch.Period,
            savedSearch.RouteCategory,
            savedSearch.DateFrom,
            savedSearch.DateTo,
            OperatorIds = savedSearch.OperatorIds,
            LessorIds = savedSearch.LessorIds,
            AircraftSeriesIds = savedSearch.AircraftSeriesIds,
            EngineSeriesIds = savedSearch.EngineSeriesIds,
            AircraftIds = savedSearch.AircraftIds,
            CountryCodes = savedSearch.CountryCodes,
            Cities = savedSearch.Cities,
            AirportCodes = savedSearch.AirportCodes,
            UserId = "",
            DateCreated = dateCreated,
            DateModified = dateCreated
        };
        var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(insertObject);
        // assert
        var expectedSql = $@"
            MERGE INTO {Constants.EmailAlertingTablePrefix}saved_searches AS target
            USING (
                SELECT
                    CAST(GET_PATH(parsed_json, 'PortfolioId') AS INT) AS portfolio_id,
                    CAST(GET_PATH(parsed_json, 'Name') AS TEXT) AS name,
                    CAST(GET_PATH(parsed_json, 'Description') AS TEXT) AS description,
                    CAST(GET_PATH(parsed_json, 'IsActive') AS BOOLEAN) AS is_active,
                    GET_PATH(parsed_json, 'MaintenanceActivityIds') AS maintenance_activity_ids,
                    CAST(GET_PATH(parsed_json, 'MinNoOfFlights') AS INT) AS min_no_of_flights,
                    CAST(GET_PATH(parsed_json, 'MinTotalGroundStay') AS INT) AS min_total_ground_stay,
                    CAST(GET_PATH(parsed_json, 'MinIndividualGroundStay') AS INT) AS min_individual_ground_stay,
                    CAST(GET_PATH(parsed_json, 'MinCurrentGroundStay') AS INT) AS min_current_ground_stay,
                    CAST(GET_PATH(parsed_json, 'MaxCurrentGroundStay') AS INT) AS max_current_ground_stay,
                    CAST(GET_PATH(parsed_json, 'MaxIndividualGroundStay') AS INT) AS max_individual_ground_stay,
                    CAST(GET_PATH(parsed_json, 'ShowAircraftOnGround') AS BOOLEAN) AS show_aircraft_on_ground,
                    GET_PATH(parsed_json, 'RegionCodes') AS region_codes,
                    CAST(GET_PATH(parsed_json, 'Period') AS INT) AS period,
                    GET_PATH(parsed_json, 'RouteCategory') AS route_category,
                    CAST(GET_PATH(parsed_json, 'DateFrom') AS TIMESTAMP) AS date_from,
                    CAST(GET_PATH(parsed_json, 'DateTo') AS TIMESTAMP) AS date_to,
                    GET_PATH(parsed_json, 'OperatorIds') AS operator_ids,
                    GET_PATH(parsed_json, 'LessorIds') AS lessor_ids,
                    GET_PATH(parsed_json, 'AircraftSeriesIds') AS aircraft_series_ids,
                    GET_PATH(parsed_json, 'EngineSeriesIds') AS engine_series_ids,
                    GET_PATH(parsed_json, 'AircraftIds') AS aircraft_ids,
                    GET_PATH(parsed_json, 'CountryCodes') AS country_codes,
                    GET_PATH(parsed_json, 'Cities') AS cities,
                    GET_PATH(parsed_json, 'AirportCodes') AS airport_codes,
                    CAST(GET_PATH(parsed_json, 'UserId') AS TEXT) AS user_id,
                    CAST(GET_PATH(parsed_json, 'DateCreated') AS TIMESTAMP) AS date_created,
                    CAST(GET_PATH(parsed_json, 'DateModified') AS TIMESTAMP) AS date_modified
                FROM (
                    SELECT PARSE_JSON(column1) AS parsed_json
                    FROM (VALUES('{jsonString}')) AS A
                )
            ) AS source
            ON target.portfolio_id = source.portfolio_id AND target.name = source.name
            WHEN NOT MATCHED THEN
            INSERT (
                portfolio_id,
                name,
                description,
                is_active,
                maintenance_activity_ids,
                min_no_of_flights,
                min_total_ground_stay,
                min_individual_ground_stay,
                min_current_ground_stay,
                max_current_ground_stay,
                max_individual_ground_stay,
                show_aircraft_on_ground,
                region_code,
                period,
                route_category,
                date_from,
                date_to,
                operator_ids,
                lessor_ids,
                aircraft_series_ids,
                engine_series_ids,
                aircraft_ids,
                country_code,
                city_names,
                airport_code,
                user_id,
                date_created,
                date_modified
            )
            VALUES (
                source.portfolio_id,
                source.name,
                source.description,
                source.is_active,
                source.maintenance_activity_ids,
                source.min_no_of_flights,
                source.min_total_ground_stay,
                source.min_individual_ground_stay,
                source.min_current_ground_stay,
                source.max_current_ground_stay,
                source.max_individual_ground_stay,
                source.show_aircraft_on_ground,
                source.region_codes,
                source.period,
                source.route_category,
                source.date_from,
                source.date_to,
                source.operator_ids,
                source.lessor_ids,
                source.aircraft_series_ids,
                source.engine_series_ids,
                source.aircraft_ids,
                source.country_codes,
                source.cities,
                source.airport_codes,
                source.user_id,
                source.date_created,
                source.date_modified
            );
        ";

        await snowflakeRepositoryMock.Received().ExecuteScalar<int>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<object?>());
    }

    [Fact]
    public async Task Update_ExecutesQueryWithExpectedSql()
    {
        var dateModified = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, DateTime.UtcNow.Hour, DateTime.UtcNow.Minute, 0);
        var savedSearchObject = new Entities.SavedSearch();
        var updatedObject = new
        {
            Id = savedSearchObject.Id,
            PortfolioId = savedSearchObject.PortfolioId,
            Name = savedSearchObject.Name,
            Description = savedSearchObject.Description,
            IsActive = savedSearchObject.IsActive,
            MaintenanceActivityIds = savedSearchObject.MaintenanceActivityIds,
            MinNoOfFlights = savedSearchObject.MinNoOfFlights,
            MinTotalGroundStay = savedSearchObject.MinTotalGroundStay,
            MinIndividualGroundStay = savedSearchObject.MinIndividualGroundStay,
            MinCurrentGroundStay = savedSearchObject.MinCurrentGroundStay,
            MaxCurrentGroundStay = savedSearchObject.MaxCurrentGroundStay,
            MaxIndividualGroundStay = savedSearchObject.MaxIndividualGroundStay,
            ShowAircraftOnGround = savedSearchObject.ShowAircraftOnGround,
            RegionCodes = savedSearchObject.RegionCodes,
            Period = savedSearchObject.Period,
            RouteCategory = savedSearchObject.RouteCategory,
            DateFrom = savedSearchObject.DateFrom,
            DateTo = savedSearchObject.DateTo,
            OperatorIds = savedSearchObject.OperatorIds,
            LessorIds = savedSearchObject.LessorIds,
            AircraftSeriesIds = savedSearchObject.AircraftSeriesIds,
            EngineSeriesIds = savedSearchObject.EngineSeriesIds,
            AircraftIds = savedSearchObject.AircraftIds,
            CountryCodes = savedSearchObject.CountryCodes,
            Cities = savedSearchObject.Cities,
            AirportCodes = savedSearchObject.AirportCodes,
            UserId = savedSearchObject.UserId,
            DateModified = dateModified,
        };
        // act
        await savedSearchesRepository.Update(savedSearchObject);

        // assert
        var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(updatedObject);
        var expectedSql = $@"
            UPDATE {Constants.EmailAlertingTablePrefix}saved_searches
            SET portfolio_id = parsed_json:PortfolioId,
                name = parsed_json:Name,
                description = parsed_json:Description,
                is_active = parsed_json:IsActive,
                maintenance_activity_ids = parsed_json:MaintenanceActivityIds,
                min_no_of_flights = parsed_json:MinNoOfFlights,
                min_total_ground_stay = parsed_json:MinTotalGroundStay,
                min_individual_ground_stay = parsed_json:MinIndividualGroundStay,
                min_current_ground_stay = parsed_json:MinCurrentGroundStay,
                max_current_ground_stay = parsed_json:MaxCurrentGroundStay,
                max_individual_ground_stay = parsed_json:MaxIndividualGroundStay,
                show_aircraft_on_ground = parsed_json:ShowAircraftOnGround,
                region_code = parsed_json:RegionCodes,
                period = parsed_json:Period,
                route_category = parsed_json:RouteCategory,
                date_from = parsed_json:DateFrom,
                date_to = parsed_json:DateTo,
                operator_ids = parsed_json:OperatorIds,
                lessor_ids = parsed_json:LessorIds,
                aircraft_series_ids = parsed_json:AircraftSeriesIds,
                engine_series_ids = parsed_json:EngineSeriesIds,
                aircraft_ids = parsed_json:AircraftIds,
                country_code = parsed_json:CountryCodes,
                city_names = parsed_json:Cities,
                airport_code = parsed_json:AirportCodes,
                user_id = parsed_json:UserId::string,
                date_modified = parsed_json:DateModified
            FROM
                (SELECT parse_json(column1) as parsed_json
                FROM VALUES(
                    '{jsonString}'
                ) as A)
            WHERE  id=parsed_json:Id;
            ";

        await snowflakeRepositoryMock.Received().Execute(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<object?>());
    }


    [Fact]
    public async Task GetAllUserSavedSearches_ExecutesQueryWithExpectedSql()
    {
        // act
        await savedSearchesRepository.GetAllActiveSavedSearches();

        // assert
        var expectedSql =
        $@"SELECT
                ss.id,
                po.user_id,
                po.name AS PORTFOLIONAME,
                ss.name As NAME,
                ss.portfolio_id,
                ss.description,
                ss.is_active,
                ss.Frequency,
                ss.min_no_of_flights,
                ss.min_total_ground_stay,
                ss.min_individual_ground_stay,
                ss.min_current_ground_stay,
                ss.max_current_ground_stay,
                ss.max_individual_ground_stay,
                ss.show_aircraft_on_ground,
                ss.maintenance_activity_ids,
                ss.region_code AS RegionCodes,
                ss.operator_ids AS OperatorIds,
                ss.lessor_ids AS LessorIds,
                ss.aircraft_series_ids,
                ss.engine_series_ids,
                ss.aircraft_ids,
                ss.country_code,
                ss.city_names,
                ss.airport_code,
                ss.period,
                ss.route_category,
                ss.date_from,
                ss.date_to
                FROM {Constants.EmailAlertingTablePrefix}saved_searches ss
                JOIN  {Constants.RiskAnalyticsTablePrefix}portfolios po ON ss.portfolio_id = po.id
                WHERE ss.is_active = 'True'
                AND ss.date_deleted IS NULL
                AND (ss.last_processed_slot is NULL OR ss.last_processed_slot < (CONVERT_TIMEZONE('UTC', CURRENT_TIMESTAMP()) - INTERVAL '6 hours'))";

        await snowflakeRepositoryMock.Received().Query<dynamic>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)));
    }

    [Fact]
    public async Task GetAssetWatchFilterValues_ExecutesQueryWithExpectedSql()
    {
        // act
        await savedSearchesRepository.GetAssetWatchFilterValues(new Entities.SavedSearch() { PortfolioId = 1, RegionCodes = new string[] { "1" } });

        // assert
        var expectedSql = $@"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}regions WHERE region_code IN (""1"")";

        await snowflakeRepositoryMock.Received().Query<string>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)), null, true);
    }

    [Fact]
    public async Task TrackProcessedAlertForUser_ExecutesQueryWithExpectedSql()
    {
        var id = 4;
        var timeslot = new DateTime();
        // act
        await savedSearchesRepository.TrackProcessedAlertForUser(id, timeslot);

        // assert
        var expectedSql = @$"UPDATE {Constants.EmailAlertingTablePrefix}saved_searches
                 SET
                 last_processed_slot = :processedTimeSlotValue
                 WHERE
                 id=:id";

        await snowflakeRepositoryMock.Received().Execute(
     Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
     Arg.Any<object?>(), true);

    }

    [Fact]
    public async Task SetFrequency_CallDbWithExpectedQuery()
    {
        string calledQuery = string.Empty;
        const string insertUpdateSql = @$"UPDATE {Constants.EmailAlertingTablePrefix}saved_searches SET frequency=:frequency WHERE user_id=:userId";

        snowflakeRepositoryMock
            .When(t => t.Execute(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await savedSearchesRepository.SetFrequency("xxx", SavedSearchFrequency.AlertsOnly);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(insertUpdateSql, calledQuery));
    }

    [Fact]
    public async Task GetFrequency_CallDbWithExpectedQuery()
    {
        string calledQuery = string.Empty;
        const string insertUpdateSql = @$"SELECT frequency FROM {Constants.EmailAlertingTablePrefix}saved_searches WHERE user_id=:userId";

        snowflakeRepositoryMock
            .When(t => t.ExecuteScalar<string>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        // act
        await savedSearchesRepository.GetFrequency("xxx");

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(insertUpdateSql, calledQuery));
    }

    [Fact]
    public async Task GetAssetWatchFilterValues_ExecutesQueryMaintenanceActivityWithExpectedSql()
    {
        // act
        await savedSearchesRepository.GetAssetWatchFilterValues(new Entities.SavedSearch() { PortfolioId = 1, MaintenanceActivityIds = new int[] { 1 } });

        // assert
        var expectedSql = $@"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}ground_event_labels WHERE ground_events_label_id IN (1)";

        await snowflakeRepositoryMock.Received().Query<string>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)), null, true);
    }
}
