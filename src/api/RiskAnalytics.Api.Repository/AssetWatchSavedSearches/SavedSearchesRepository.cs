using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository.AssetWatchSavedSearches;

public class SavedSearchesRepository : ISavedSearchesRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;

    public SavedSearchesRepository(ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public async Task<IEnumerable<Entities.SavedSearch>> GetAll(string userId)
    {
        var parameters = new { userId = userId };

        var result = await snowflakeRepository.Query<dynamic>(
            $@"SELECT ss.*, p.name as PortfolioName
           FROM {Constants.EmailAlertingTablePrefix}saved_searches ss
           JOIN {Constants.RiskAnalyticsTablePrefix}portfolios p ON ss.portfolio_Id = p.id
           WHERE ss.user_id =:userId AND ss.date_deleted IS NULL
           ORDER BY ss.date_created DESC", parameters);

        return GetSavedSearchesList(result);

    }

    private List<Entities.SavedSearch> GetSavedSearchesList(IEnumerable<dynamic> result)
    {
        var savedSearchList = new List<Entities.SavedSearch>();

        foreach (var row in result)
        {
            var search = new Entities.SavedSearch();
            foreach (var item in row)
            {
                switch (item.Key?.ToString()?.ToUpperInvariant())
                {
                    case "ID":
                        search.Id = int.Parse(item.Value.ToString());
                        break;
                    case "PORTFOLIO_ID":
                        search.PortfolioId = int.Parse(item.Value.ToString());
                        break;
                    case "NAME":
                        search.Name = item.Value.ToString();
                        break;
                    case "DESCRIPTION":
                        search.Description = item.Value.ToString();
                        break;
                    case "IS_ACTIVE":
                        search.IsActive = bool.Parse(item.Value.ToString());
                        break;
                    case "MAINTENANCE_ACTIVITY_IDS":
                        search.MaintenanceActivityIds = ParseIntArray(item.Value.ToString());
                        break;
                    case "MIN_NO_OF_FLIGHTS":
                        search.MinNoOfFlights = int.Parse(item.Value.ToString());
                        break;
                    case "MIN_TOTAL_GROUND_STAY":
                        search.MinTotalGroundStay = int.Parse(item.Value.ToString());
                        break;
                    case "MIN_INDIVIDUAL_GROUND_STAY":
                        search.MinIndividualGroundStay = int.Parse(item.Value.ToString());
                        break;
                    case "MAX_INDIVIDUAL_GROUND_STAY":
                        search.MaxIndividualGroundStay = int.Parse(item.Value.ToString());
                        break;
                    case "MIN_CURRENT_GROUND_STAY":
                        search.MinCurrentGroundStay = int.Parse(item.Value.ToString());
                        break;
                    case "MAX_CURRENT_GROUND_STAY":
                        search.MaxCurrentGroundStay = int.Parse(item.Value.ToString());
                        break;
                    case "SHOW_AIRCRAFT_ON_GROUND":
                        search.ShowAircraftOnGround = bool.Parse(item.Value.ToString());
                        break;
                    case "REGION_CODE":
                        search.RegionCodes = ParseStringArray(item.Value.ToString());
                        break;
                    case "PERIOD":
                        search.Period = (AssetWatchSearchPeriod)int.Parse(item.Value.ToString());
                        break;
                    case "ROUTE_CATEGORY":
                        if (item.Value != null)
                        {
                            search.RouteCategory = (AssetWatchRouteCategory?)int.Parse(item.Value.ToString());
                        }
                        else
                        {
                            search.RouteCategory = null;
                        }
                        break;
                    case "DATE_FROM":
                        search.DateFrom = DateTime.Parse(item.Value.ToString());
                        break;
                    case "DATE_TO":
                        search.DateTo = DateTime.Parse(item.Value.ToString());
                        break;
                    case "OPERATOR_IDS":
                        search.OperatorIds = ParseIntArray(item.Value.ToString());
                        break;
                    case "LESSOR_IDS":
                        search.LessorIds = ParseIntArray(item.Value.ToString());
                        break;
                    case "AIRCRAFT_SERIES_IDS":
                        search.AircraftSeriesIds = ParseIntArray(item.Value.ToString());
                        break;
                    case "ENGINE_SERIES_IDS":
                        search.EngineSeriesIds = ParseIntArray(item.Value.ToString());
                        break;
                    case "AIRCRAFT_IDS":
                        search.AircraftIds = ParseIntArray(item.Value.ToString());
                        break;
                    case "COUNTRY_CODE":
                        search.CountryCodes = ParseStringArray(item.Value.ToString());
                        break;
                    case "CITY_NAMES":
                        search.Cities = ParseStringArray(item.Value.ToString());
                        break;
                    case "AIRPORT_CODE":
                        search.AirportCodes = ParseStringArray(item.Value.ToString());
                        break;
                    case "USER_ID":
                        search.UserId = item.Value.ToString();
                        break;
                    case "DATE_CREATED":
                        search.DateCreated = DateTime.Parse(item.Value.ToString());
                        break;
                    case "DATE_MODIFIED":
                        search.DateModified = DateTime.Parse(item.Value.ToString());
                        break;
                    case "FREQUENCY":
                        search.Frequency = item.Value.ToString();
                        break;
                    case "PORTFOLIONAME":
                        search.PortfolioName = item.Value.ToString();
                        break;
                    default:
                        break;
                }
            }
            search.RegionCodes = search.RegionCodes?.Select(id => id.Replace("\"", "")).ToArray();
            search.Cities = search.Cities?.Select(id => id.Replace("\"", "")).ToArray();
            search.CountryCodes = search.CountryCodes?.Select(id => id.Replace("\"", "")).ToArray();
            search.AirportCodes = search.AirportCodes?.Select(id => id.Replace("\"", "")).ToArray();
            savedSearchList.Add(search);
        }
        return savedSearchList;
    }

    private int[] ParseIntArray(string value)
    {
        value = value.Trim('[', ']');
        if (string.IsNullOrWhiteSpace(value.Trim()))
        {
            return new int[0];
        }
        return value.Split(',').Select(int.Parse).ToArray();
    }

    private string[] ParseStringArray(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return new string[0];
        }

        value = value.Trim();

        if (value.StartsWith("[") && value.EndsWith("]"))
        {
            try
            {
                return Newtonsoft.Json.JsonConvert.DeserializeObject<string[]>(value) ?? new string[0];
            }
            catch (Newtonsoft.Json.JsonException)
            {
                value = value.Trim('[', ']');
                if (string.IsNullOrWhiteSpace(value))
                {
                    return new string[0];
                }
                return ParseCommaSeparatedWithQuotes(value);
            }
        }

        value = value.Trim('[', ']');
        if (string.IsNullOrWhiteSpace(value))
        {
            return new string[0];
        }

        if (value.Contains("\""))
        {
            return ParseCommaSeparatedWithQuotes(value);
        }
        return value.Split(',').Select(p => p.Trim()).Where(p => !string.IsNullOrEmpty(p)).ToArray();
    }

    private string[] ParseCommaSeparatedWithQuotes(string value)
    {
        var result = new List<string>();
        var current = new System.Text.StringBuilder();
        bool inQuotes = false;
        bool escapeNext = false;

        for (int i = 0; i < value.Length; i++)
        {
            char c = value[i];

            if (escapeNext)
            {
                current.Append(c);
                escapeNext = false;
                continue;
            }

            if (c == '\\')
            {
                escapeNext = true;
                continue;
            }

            if (c == '"')
            {
                inQuotes = !inQuotes;
                continue;
            }

            if (c == ',' && !inQuotes)
            {
                var item = current.ToString().Trim();
                if (!string.IsNullOrEmpty(item))
                {
                    result.Add(item);
                }
                current.Clear();
                continue;
            }

            current.Append(c);
        }
        var lastItem = current.ToString().Trim();
        if (!string.IsNullOrEmpty(lastItem))
        {
            result.Add(lastItem);
        }

        return result.ToArray();
    }

    public async Task<IEnumerable<Entities.SavedSearch>> GetAllActiveSavedSearches()
    {
        var sql =
        @$"SELECT
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

        var savedsearches = await snowflakeRepository.Query<dynamic>(sql);
        var savedsearchesList = GetSavedSearchesList(savedsearches);

        if (savedsearchesList == null)
        {
            return new List<Entities.SavedSearch>();
        }
        return savedsearchesList;

    }

    public async Task<Entities.SavedSearch?> Get(int id)
    {
        var parameters = new { id };

        var sql = @$"SELECT *
                FROM {Constants.EmailAlertingTablePrefix}saved_searches
                WHERE id =:id AND date_deleted IS NULL";

        var result = await snowflakeRepository.Query<dynamic>(sql, parameters);

        return GetSavedSearchesList(result).FirstOrDefault();
    }

    public async Task Delete(int id, string userId)
    {
        var parameters = new { id, userId };

        await snowflakeRepository.ExecuteScalar<int>(@$"
            DELETE
            FROM {Constants.EmailAlertingTablePrefix}saved_searches
            WHERE id =:id AND user_id =:userId", parameters);
    }

    public async Task<bool> IsNameUnique(string name, string userId)
    {
        var parameters = new { name, userId };

        var sql = @$"
                SELECT
                    COUNT(*)
                FROM {Constants.EmailAlertingTablePrefix}saved_searches
                WHERE name =:name AND user_id =:userId";

        var savedSearchesWithTheName = await snowflakeRepository.ExecuteScalar<int>(sql, parameters);

        return savedSearchesWithTheName == 0;
    }

    public async Task<int> Create(Entities.SavedSearch savedSearch, string userId)
    {
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
            UserId = userId,
            DateCreated = dateCreated,
            DateModified = dateCreated,
        };

        var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(insertObject);

        var query = $@"
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

        await snowflakeRepository.ExecuteScalar<int>(query);

        var selectQuery = $@"
            SELECT ID
            FROM {Constants.EmailAlertingTablePrefix}saved_searches
            WHERE portfolio_id = {savedSearch.PortfolioId} AND name = '{savedSearch.Name}'
            LIMIT 1;
        ";

        var savedSearchId = await snowflakeRepository.ExecuteScalar<int>(selectQuery);

        return savedSearchId;
    }



    public async Task Update(Entities.SavedSearch savedSearch)
    {
        var dateModified = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, DateTime.UtcNow.Hour, DateTime.UtcNow.Minute, 0);

        var updateObject = new
        {
            Id = savedSearch.Id,
            PortfolioId = savedSearch.PortfolioId,
            Name = savedSearch.Name,
            Description = savedSearch.Description,
            IsActive = savedSearch.IsActive,
            MaintenanceActivityIds = savedSearch.MaintenanceActivityIds,
            MinNoOfFlights = savedSearch.MinNoOfFlights,
            MinTotalGroundStay = savedSearch.MinTotalGroundStay,
            MinIndividualGroundStay = savedSearch.MinIndividualGroundStay,
            MinCurrentGroundStay = savedSearch.MinCurrentGroundStay,
            MaxCurrentGroundStay = savedSearch.MaxCurrentGroundStay,
            MaxIndividualGroundStay = savedSearch.MaxIndividualGroundStay,
            ShowAircraftOnGround = savedSearch.ShowAircraftOnGround,
            RegionCodes = savedSearch.RegionCodes,
            Period = savedSearch.Period,
            RouteCategory = savedSearch.RouteCategory,
            DateFrom = savedSearch.DateFrom,
            DateTo = savedSearch.DateTo,
            OperatorIds = savedSearch.OperatorIds,
            LessorIds = savedSearch.LessorIds,
            AircraftSeriesIds = savedSearch.AircraftSeriesIds,
            EngineSeriesIds = savedSearch.EngineSeriesIds,
            AircraftIds = savedSearch.AircraftIds,
            CountryCodes = savedSearch.CountryCodes,
            Cities = savedSearch.Cities,
            AirportCodes = savedSearch.AirportCodes,
            UserId = savedSearch.UserId,
            DateModified = dateModified,
        };

        // Convert the update object to a JSON string
        var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(updateObject);

        // SQL update query
        var sql = $@"
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
                max_individual_ground_stay=parsed_json:MaxIndividualGroundStay,
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

        await snowflakeRepository.Execute(sql,null);
    }



    public async Task TrackProcessedAlertForUser(int id, DateTime dateTimeSent)
    {
        var parameters = new
        {
            id,
            processedTimeSlotValue = dateTimeSent
        };

        var sql = @$"UPDATE {Constants.EmailAlertingTablePrefix}saved_searches
                 SET
                 last_processed_slot =:processedTimeSlotValue
                 WHERE
                 id=:id";

        await snowflakeRepository.Execute(sql, parameters, isServiceUser: true);
    }


    public async Task SetFrequency(string userId, SavedSearchFrequency frequency)
    {
        var queryParams = new
        {
            userId,
            frequency = frequency.ToString().ToLowerInvariant()
        };

        var sql = @$"UPDATE {Constants.EmailAlertingTablePrefix}saved_searches SET frequency=:frequency WHERE user_id=:userId";
        await snowflakeRepository.Execute(sql, queryParams);
    }

    public async Task<SavedSearchFrequency> GetFrequency(string userId)
    {
        var queryParams = new
        {
            userId
        };

        var sql = @$"SELECT frequency FROM {Constants.EmailAlertingTablePrefix}saved_searches WHERE user_id=:userId";

        var frequency = await snowflakeRepository.ExecuteScalar<string>(sql, queryParams);

        return frequency?.ToLowerInvariant() == "alertsonly" ? SavedSearchFrequency.AlertsOnly : SavedSearchFrequency.Daily;
    }

    public async Task<AssetWatchFilterValues> GetAssetWatchFilterValues(SavedSearch savedSearch)
    {
        var filterValues = new AssetWatchFilterValues
        {
            Regions = new List<string>(),
            Countries = new List<string>(),
            Cities = new List<string>(),
            Airports = new List<string>(),
            Operators = new List<string>(),
            Lessors = new List<string>(),
            AircraftSeries = new List<string>(),
            EngineSeries = new List<string>(),
            SerialNumbers = new List<string>(),
            MaintenanceActivities = new List<string>()
        };

        var tasks = new List<Task>();

        tasks.AddRange(GetAssetWatchGeographicFilterValues(savedSearch, filterValues));
        tasks.AddRange(GetAssetWatchAircraftSpecificFilterValues(savedSearch, filterValues));

        Task.WaitAll(tasks.ToArray());

        return filterValues;
    }

    private List<Task> GetAssetWatchAircraftSpecificFilterValues(SavedSearch savedSearch, AssetWatchFilterValues filterValues)
    {
        var tasks = new List<Task>();
        if (savedSearch.OperatorIds?.Length > 0)
        {
            var parameters = new { portfolioId = savedSearch.PortfolioId };
            var sql =
                @$"SELECT DISTINCT aah.operator AS Name
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah ON pa.aircraft_id = aah.aircraft_id
                WHERE aah.operator IS NOT NULL AND aah.operator_organization_id IN ({string.Join(",", savedSearch.OperatorIds)})
                AND portfolio_id =:portfolioId
                ORDER BY Name";
            tasks.Add(Task.Run(async () =>
                filterValues.Operators = await snowflakeRepository.Query<string>(sql, parameters, isServiceUser: true)
            ));
        }
        if (savedSearch.LessorIds?.Length > 0)
        {
            var parameters = new { portfolioId = savedSearch.PortfolioId };
            var sql =
                @$"SELECT DISTINCT lessor.organization AS Name
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah on pa.aircraft_id = aah.aircraft_id
                LEFT JOIN ""organizations_latest"" AS lessor on lessor.organization_id = aah.manager_organization_id
                AND lessor.organization_sub_type_id = {(int)OrganizationSubType.OperatingLessor}
                WHERE lessor.organization IS NOT NULL AND lessor.organization_id IN ({string.Join(",", savedSearch.LessorIds)})
                AND portfolio_id =:portfolioId
                ORDER BY Name";
            tasks.Add(Task.Run(async () =>
                filterValues.Lessors = await snowflakeRepository.Query<string>(sql, parameters, isServiceUser: true)
            ));
        }
        if (savedSearch.AircraftSeriesIds?.Length > 0)
        {
            var parameters = new { portfolioId = savedSearch.PortfolioId };
            var sql =
           @$"SELECT DISTINCT ac.aircraft_series AS Name
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah on pa.aircraft_id = aah.aircraft_id
                JOIN ""aircraft_configurations_latest"" AS ac on aah.aircraft_configuration_id = ac.aircraft_configuration_id
                WHERE ac.aircraft_series IS NOT NULL AND ac.aircraft_series_id IN ({string.Join(",", savedSearch.AircraftSeriesIds)})
                AND portfolio_id =:portfolioId
                ORDER BY Name";

            tasks.Add(Task.Run(async () =>
                filterValues.AircraftSeries = await snowflakeRepository.Query<string>(sql, parameters, isServiceUser: true)
            ));
        }
        if (savedSearch.EngineSeriesIds?.Length > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.EngineSeries = await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}engine_series WHERE engine_series_id IN ({string.Join(",", savedSearch.EngineSeriesIds)})", null, isServiceUser: true)
            ));
        }
        if (savedSearch.AircraftIds?.Length > 0)
        {
            var parameters = new { portfolioId = savedSearch.PortfolioId };
            var sql =
                @$"SELECT DISTINCT CONCAT(a.aircraft_serial_number, ' (', ac.aircraft_master_series, ')') AS Name
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_latest"" AS a on a.aircraft_id = pa.aircraft_id
                JOIN ""aircraft_all_history_latest"" aah on pa.aircraft_id = aah.aircraft_id
                JOIN ""aircraft_configurations_latest"" AS ac ON aah.aircraft_configuration_id = ac.aircraft_configuration_id
                WHERE ac.aircraft_master_series IS NOT NULL AND a.aircraft_id IN ({string.Join(",", savedSearch.AircraftIds)})
                AND portfolio_id =:portfolioId
                ORDER BY Name";
            tasks.Add(Task.Run(async () =>
                filterValues.SerialNumbers = await snowflakeRepository.Query<string>(sql, parameters, isServiceUser: true)
            ));
        }
        if (savedSearch.MaintenanceActivityIds?.Length > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.MaintenanceActivities = await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}ground_event_labels WHERE ground_events_label_id IN ({string.Join(",", savedSearch.MaintenanceActivityIds)})", null, isServiceUser: true)
            ));
        }

        return tasks;
    }

    private List<Task> GetAssetWatchGeographicFilterValues(SavedSearch savedSearch, AssetWatchFilterValues filterValues)
    {
        var tasks = new List<Task>();
        if (savedSearch.RegionCodes?.Length > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.Regions = await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}regions WHERE region_code IN ({string.Format("'{0}'", string.Join("','", savedSearch.RegionCodes.Select(i => i.Replace("'", "''"))))})", null, isServiceUser: true)
            ));
        }
        if (savedSearch.CountryCodes?.Length > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.Countries = await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}countries WHERE country_code_iata IN ({string.Format("'{0}'", string.Join("','", savedSearch.CountryCodes.Select(i => i.Replace("'", "''"))))})", null, isServiceUser: true)
            ));
        }
        if (savedSearch.Cities?.Length > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.Cities = await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}cities WHERE name IN ({string.Format("'{0}'", string.Join("','", savedSearch.Cities.Select(i => i.Replace("'", "''"))))})", null, isServiceUser: true)
            ));
        }
        if (savedSearch.AirportCodes?.Length > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.Airports = await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}airports WHERE airport_fs_internal IN ({string.Format("'{0}'", string.Join("','", savedSearch.AirportCodes.Select(i => i.Replace("'", "''"))))})", null, isServiceUser: true)
            ));
        }

        return tasks;
    }
}


