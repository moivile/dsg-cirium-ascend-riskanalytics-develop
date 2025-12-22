using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.QueryBuilders;
using System.Text;

namespace RiskAnalytics.Api.Repository.AssetWatch;

public class AssetWatchTableRepository : IAssetWatchTableRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;

    public AssetWatchTableRepository(ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    // the last one to check
    public int Priority { get => 0; }

    public bool CanHandle(AssetWatchTableSearchParameters assetWatchTableSearchParameters)
    {
        return true;
    }

    public async Task<AssetWatchGeographicFilterValues> GetGeographicFilterValues(AssetWatchTableSearchParameters filterCriteria)
    {
        var filterValues = new AssetWatchGeographicFilterValues
        {
            Regions = new List<string>(),
            Countries = new List<string>(),
            Cities = new List<string>(),
            Airports = new List<string>()
        };

        var tasks = new List<Task>();

        if (filterCriteria.RegionCodes?.Count > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.Regions = (List<string>)await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}regions WHERE region_code IN ({string.Format("'{0}'", string.Join("','", filterCriteria.RegionCodes.Select(i => i.Replace("'", "''"))))})")
            ));
        }
        if (filterCriteria.CountryCodes?.Count > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.Countries = (List<string>)await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}countries WHERE country_code_iata IN ({string.Format("'{0}'", string.Join("','", filterCriteria.CountryCodes.Select(i => i.Replace("'", "''"))))})")

            ));
        }
        if (filterCriteria.Cities?.Count > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.Cities = (List<string>)await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}cities WHERE name IN ({string.Format("'{0}'", string.Join("','", filterCriteria.Cities.Select(i => i.Replace("'", "''"))))})")
            ));
        }
        if (filterCriteria.AirportCodes?.Count > 0)
        {
            tasks.Add(Task.Run(async () =>
                filterValues.Airports = (List<string>)await snowflakeRepository.Query<string>($"SELECT name FROM {Constants.RiskAnalyticsTablePrefix}airports WHERE airport_fs_internal IN ({string.Format("'{0}'", string.Join("','", filterCriteria.AirportCodes.Select(i => i.Replace("'", "''"))))})")
            ));
        }

        await Task.WhenAll(tasks.ToArray());

        return filterValues;
    }



    public async Task<IEnumerable<AssetWatchListDataGridModel>> GetTrackedUtilizationData(int portfolioId, AssetWatchTableSearchParameters filterCriteria, bool isServiceUser = false)
    {
        var parameters = new
        {
            portfolioId,
            filterCriteria.DateFrom,
            filterCriteria.DateTo,
            filterCriteria.MinIndividualGroundStay,
            filterCriteria.MaxIndividualGroundStay
        };

        string whereClause = BuildTrackedUtilizationWhereClause(filterCriteria);

        var sql =
            $@"SELECT
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
            WHERE flights.aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId){whereClause}
            GROUP BY
            flights.aircraft_id";

        return await snowflakeRepository.Query<AssetWatchListDataGridModel>(sql, parameters, isServiceUser);
    }

    public async Task<IEnumerable<AssetWatchListDataGridModel>> GetPortfolioAircraft(int portfolioId, AssetWatchTableSearchParameters filterCriteria, bool isServiceUser = false)
    {
        var parameters = new
        {
            portfolioId
        };

        var wherePart = BuildAircraftWhereClause(filterCriteria);

        var sql =
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

                WHERE portfolio_id=:portfolioId
                {wherePart}";

        return await snowflakeRepository.Query<AssetWatchListDataGridModel>(sql, parameters, isServiceUser);
    }

    public async Task<DateTime> GetDateModified(int portfolioId)
    {
        var parameters = new
        {
            portfolioId
        };

        var sql = $"SELECT date_modified FROM {Constants.RiskAnalyticsTablePrefix}portfolios WHERE id=:portfolioId";

        return await snowflakeRepository.ExecuteScalar<DateTime>(sql, parameters);
    }

    private static string BuildAircraftWhereClause(AssetWatchTableSearchParameters filter)
    {
        var whereQuery = new StringBuilder();

        if (filter.OperatorIds?.Count > 0)
        {
            whereQuery.Append($" AND aah.operator_organization_id IN ({string.Join(",", filter.OperatorIds)})");
        }

        if (filter.LessorIds?.Count > 0)
        {
            whereQuery.Append($" AND lessor.organization_id IN ({string.Join(",", filter.LessorIds)})");
        }

        if (filter.AircraftSeriesIds?.Count > 0)
        {
            whereQuery.Append($" AND ac.aircraft_series_id IN ({string.Join(",", filter.AircraftSeriesIds)})");
        }

        if (filter.EngineSerieIds?.Count > 0)
        {
            whereQuery.Append($" AND es.engine_series_id IN ({string.Join(",", filter.EngineSerieIds)})");
        }

        if (filter.AircraftIds?.Count > 0)
        {
            whereQuery.Append($" AND a.aircraft_id IN  ({string.Join(",", filter.AircraftIds)})");
        }

        var query = whereQuery.ToString();
        return query;
    }

    private string BuildTrackedUtilizationWhereClause(AssetWatchTableSearchParameters filter)
    {
        var whereQuery = new StringBuilder();
        if (filter.ShowAircraftOnGround)
        {
            filter.Period = AssetWatchSearchPeriod.Last12Months;
        }
        whereQuery = TrackedUtilizationQueryBuilder.GetSearchPeriodQuery(whereQuery, filter);

        if (filter.CountryCodes?.Count > 0)
        {
            whereQuery.Append($" AND flights.tracked_arrival_country_code_iata IN ({string.Format("'{0}'", string.Join("','", filter.CountryCodes.Select(i => i.Replace("'", "''"))))})");
        }

        if (filter.RegionCodes?.Count > 0)
        {
            whereQuery.Append($" AND flights.tracked_arrival_region_code IN ({string.Format("'{0}'", string.Join("','", filter.RegionCodes.Select(i => i.Replace("'", "''"))))})");
        }

        if (filter.OperatorIds?.Count > 0)
        {
            whereQuery.Append($" AND flights.operator_organization_id IN ({string.Join(",", filter.OperatorIds)})");
        }

        if (filter.Cities?.Count > 0)
        {
            whereQuery.Append($" AND flights.tracked_arrival_city_name IN ({string.Format("'{0}'", string.Join("','", filter.Cities.Select(i => i.Replace("'", "''"))))})");
        }

        if (filter.AirportCodes?.Count > 0)
        {
            whereQuery.Append($" AND flights.tracked_arrival_airport_fs_internal IN ({string.Format("'{0}'", string.Join("','", filter.AirportCodes.Select(i => i.Replace("'", "''"))))})");
        }

        if (filter.LessorIds?.Count > 0)
        {
            whereQuery.Append($" AND flights.lessor_organization_id IN ({string.Join(",", filter.LessorIds)})");
        }

        if (filter.AircraftSeriesIds?.Count > 0)
        {
            whereQuery.Append($" AND flights.aircraft_series_id IN ({string.Join(",", filter.AircraftSeriesIds)})");
        }

        if (filter.EngineSerieIds?.Count > 0)
        {
            whereQuery.Append($" AND flights.engine_series_id IN  ({string.Join(",", filter.EngineSerieIds)})");
        }

        if (filter.AircraftIds?.Count > 0)
        {
            whereQuery.Append($" AND flights.aircraft_id IN  ({string.Join(",", filter.AircraftIds)})");
        }

        if (filter.MaintenanceActivityIds?.Count > 0)
        {
            whereQuery.Append($" AND flights.ground_event_model_label_id IN  ({string.Join(",", filter.MaintenanceActivityIds)})");
        }

        if (filter.ShowAircraftOnGround)
        {
            whereQuery.Append($" AND flights.is_ground_event_end_unknown=true");
        }

        switch (filter.RouteCategory)
        {
            case AssetWatchRouteCategory.Domestic:
                whereQuery.Append($" AND route_category='Domestic'");
                break;
            case AssetWatchRouteCategory.International:
                whereQuery.Append($" AND route_category='International'");
                break;
            default:
                break;
        }

        var query = whereQuery.ToString();
        return query;
    }
}
