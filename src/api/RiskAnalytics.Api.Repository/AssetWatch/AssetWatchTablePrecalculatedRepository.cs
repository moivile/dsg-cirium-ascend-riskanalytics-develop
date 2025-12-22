using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using System.Text;

namespace RiskAnalytics.Api.Repository.AssetWatch;

public class AssetWatchTablePrecalculatedRepository : IAssetWatchTableRepository
{
    private List<int> calculatedRanges = new List<int> { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 24, 48, 168 };

    private readonly ISnowflakeRepository snowflakeRepository;
    public AssetWatchTablePrecalculatedRepository(ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public int Priority { get => 10; }

    public bool CanHandle(AssetWatchTableSearchParameters assetWatchTableSearchParameters)
    {
        return false;
    }

    private bool IsWithinCalculatedRange(int value)
    {
        return calculatedRanges.Any(i => i == value);
    }

    public async Task<AssetWatchGeographicFilterValues> GetGeographicFilterValues(AssetWatchTableSearchParameters filterCriteria)
    {
        return await Task.FromResult(new AssetWatchGeographicFilterValues());
    }

    public async Task<IEnumerable<AssetWatchListDataGridModel>> GetTrackedUtilizationData(int portfolioId, AssetWatchTableSearchParameters filterCriteria, bool isServiceUser = false)
    {
        var parameters = new
        {
            filterCriteria.MinIndividualGroundStay,
            filterCriteria.MinTotalGroundStay,
            filterCriteria.MinNoOfFlights,
            portfolioId,
            filterCriteria.DateFrom,
            filterCriteria.DateTo
        };

        var tableNamePart = filterCriteria.Period == AssetWatchSearchPeriod.Last6Months ? "6" : "12";

        string whereClause = BuildWhereClause(filterCriteria);
        string showAircraftClause = filterCriteria.ShowAircraftOnGround ? " AND ra_aircraft.current_ground_event_start_flight_id IS NOT NULL" : "";

        var sql = @$"
                    SELECT
                    flights.aircraft_id AS aircraftid,
                    flights.maintenance_activities AS maintenanceActivity,
                    COALESCE(SUM(ground_event_duration_minutes_s{filterCriteria.MinTotalGroundStay / 60}),0) AS totalgroundstayhours,
                    COALESCE(SUM(flights_count_s{filterCriteria.MinNoOfFlights}),0) AS numberofflights,
                    COALESCE(SUM(totalFlightMinutes),0) AS totalFlightMinutes,
                    COALESCE(SUM(times_exceeded_min_ground_stay_s{filterCriteria.MinIndividualGroundStay}),0) AS numberoftimeexceedsmingroundstay
                    FROM
                    {Constants.RiskAnalyticsTablePrefix}tracked_utilization_{tableNamePart}m flights
                    LEFT JOIN {Constants.RiskAnalyticsTablePrefix}aircraft AS ra_aircraft ON ra_aircraft.aircraft_id=flights.aircraft_id
                    WHERE flights.aircraft_id IN
                    (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id=:portfolioId)
                    {whereClause}
                    {showAircraftClause}
                    GROUP BY
                    flights.aircraft_id,
                    flights.maintenance_activities
                    ";

        return await snowflakeRepository.Query<AssetWatchListDataGridModel>(sql, parameters, isServiceUser);
    }

    private static string BuildWhereClause(AssetWatchTableSearchParameters filter)
    {
        var whereQuery = new StringBuilder();

        if (filter.MaintenanceActivityIds?.Count > 0)
        {
            whereQuery.Append(" AND ");
            whereQuery.Append(string.Join(" OR ", filter.MaintenanceActivityIds.Select(id => $"maintenance_activities LIKE '%[{id}]%'")));
        }
        if (filter.MinNoOfFlights == 0 && filter.MinTotalGroundStay == 0 && filter.MinIndividualGroundStay == 0)
        {
            return whereQuery.ToString();
        }

        whereQuery.Append(" AND (");

        if (filter.MinNoOfFlights > 0)
        {
            whereQuery.Append($"flights_count_s{filter.MinNoOfFlights} > 0");
        }

        if (filter.MinTotalGroundStay > 0)
        {
            if (whereQuery.Length > 6 && filter.MinNoOfFlights > 0)
            {
                whereQuery.Append(" OR ");
            }
            whereQuery.Append($"ground_event_duration_minutes_s{filter.MinTotalGroundStay / 60} > 0");
        }

        if (filter.MinIndividualGroundStay > 0)
        {
            if (whereQuery.Length > 6 && (filter.MinNoOfFlights > 0 || filter.MinTotalGroundStay > 0))
            {
                whereQuery.Append(" OR ");
            }
            whereQuery.Append($"times_exceeded_min_ground_stay_s{filter.MinIndividualGroundStay} > 0");
        }

        whereQuery.Append(")");
        var query = whereQuery.ToString();
        return query;
    }

    public async Task<IEnumerable<AssetWatchListDataGridModel>> GetPortfolioAircraft(int portfolioId, AssetWatchTableSearchParameters filterCriteria, bool isServiceUser = false)
    {
        var parameters = new
        {
            portfolioId
        };

        var sql =
            $@"SELECT
                a.aircraft_id AS aircraftid,
                ra_aircraft.aircraft_serial_number AS aircraftserialnumber,
                ra_aircraft.aircraft_registration_number AS aircraftregistrationnumber,
                ra_aircraft.aircraft_series AS aircraftseries,
                ash.status AS aircraftstatus,
                ra_aircraft.operator AS operatorname,
                ra_aircraft.manager AS managername,
                ra_aircraft.last_flight_date,
                ra_aircraft.Current_Ground_Event_Airport_Name AS CurrentGroundEventAirportName,
                ra_aircraft.Current_Ground_Event_Duration_Minutes AS CurrentGroundEventDurationMinutes
                FROM
                {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS a
                LEFT JOIN {Constants.RiskAnalyticsTablePrefix}aircraft AS ra_aircraft ON ra_aircraft.aircraft_id=a.aircraft_id
                INNER JOIN ""aircraft_all_history_latest"" AS aah ON aah.aircraft_id = a.aircraft_id
                INNER JOIN ""aircraft_status_history_latest"" AS ash on ash.aircraft_id = a.aircraft_id AND ash.is_current = true
                INNER JOIN ""aircraft_configurations_latest"" AS ac ON ac.aircraft_configuration_id = aah.aircraft_configuration_id
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}engine_series AS es ON es.name = ac.engine_series
                LEFT JOIN ""organizations_latest"" as lessor ON lessor.organization_id = aah.manager_organization_id AND lessor.organization_sub_type_id=88

                WHERE portfolio_id=:portfolioId
                {BuildAircraftWhereClause(filterCriteria)}";

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
            whereQuery.Append($" AND aah.operator_organization_id IN ({string.Join(",", filter.OperatorIds)}");
        }

        if (filter.LessorIds?.Count > 0)
        {
            whereQuery.Append($" AND lessor.organization_id IN ({string.Join(",", filter.LessorIds)}");
        }

        if (filter.AircraftSeriesIds?.Count > 0)
        {
            whereQuery.Append($" AND ac.aircraft_series_id IN ({string.Join(",", filter.AircraftSeriesIds)}");
        }

        if (filter.EngineSerieIds?.Count > 0)
        {
            whereQuery.Append($" AND es.engine_series_id IN ({string.Join(",", filter.EngineSerieIds)}");
        }

        if (filter.AircraftIds?.Count > 0)
        {
            whereQuery.Append($" AND a.aircraft_id IN  ({string.Join(",", filter.AircraftIds)}");
        }

        var query = whereQuery.ToString();
        return query;
    }
}
