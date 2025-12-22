using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Model;
using System.Text;
using RiskAnalytics.Api.Repository.QueryBuilders;

namespace RiskAnalytics.Api.Repository;

public class AssetWatchFlightDetailsRepository : IAssetWatchFlightDetailsRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;
    public AssetWatchFlightDetailsRepository(ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public async Task<IEnumerable<FlightDetailsModel>> ListAircraftFlightDetails(int aircraftId, AssetWatchTableSearchParameters filterCriteria)
    {
        var parameters = new { aircraftId };

        string whereClause = BuildWhereClause(filterCriteria);
        string sortByQuery = BuildFlightDetailsSortByClause(filterCriteria);

        var mainSubquery = $@"
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
                    ";

        var commonFromClause = $@"
                    FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization flights
                    INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = flights.tracked_arrival_airport_fs_internal
                    INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS departure_airports ON departure_airports.airport_fs_internal = flights.departure_airport_code_fs_internal
                    INNER JOIN {Constants.RiskAnalyticsTablePrefix}countries AS arrival_countries ON arrival_countries.country_id = arrival_airports.country_id
                    WHERE flights.aircraft_id =:aircraftId
                    ";

        var sql = @$"
            WITH main_query AS (
                SELECT
                    {mainSubquery}
                    {commonFromClause}
                    {whereClause}
                    {sortByQuery}
                    LIMIT {filterCriteria.Take}
                    OFFSET {filterCriteria.Skip}
            )";

        if (filterCriteria.ShowAircraftOnGround)
        {
            var unionQuery = @$"
                ,alt_query AS (
                    SELECT
                        {mainSubquery}
                        {commonFromClause}
                        ORDER BY DepartureDate DESC
                        LIMIT 1
                )
                SELECT * FROM main_query
                UNION ALL
                SELECT * FROM alt_query WHERE NOT EXISTS(SELECT 1 FROM main_query) AND rk=1
                ";

                sql += unionQuery;
        }
        else
        {
            sql += "SELECT * FROM main_query";
        }
        return await snowflakeRepository.Query<FlightDetailsModel>(sql, parameters);
    }


    public async Task<int> AircraftFlightsCount(int aircraftId, AssetWatchTableSearchParameters filterCriteria)
    {
        var parameters = new { aircraftId };

        string whereClause = BuildWhereClause(filterCriteria);
        var sql =
                    @$"
                    SELECT COUNT(*)
                    FROM
                    (
                        SELECT
                        flights.flight_id
                        FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization flights
                        WHERE flights.aircraft_id =:aircraftId " + whereClause + @$"
                    )AS TotalResults";

        return (await snowflakeRepository.Query<int>(sql, parameters)).First();
    }

    private static string BuildWhereClause(AssetWatchTableSearchParameters filter)
    {
        var whereQuery = new StringBuilder();
        whereQuery = TrackedUtilizationQueryBuilder.GetSearchPeriodQuery(whereQuery, filter);

        if (filter.CountryCodes?.Count > 0)
        {
            whereQuery.Append($" AND flights.tracked_arrival_country_code_iata IN ({string.Format("'{0}'", string.Join("','", filter.CountryCodes.Select(i => i.Replace("'", "''"))))})");
        }

        if (filter.Cities?.Count > 0)
        {
            whereQuery.Append($" AND flights.tracked_arrival_city_name IN ({string.Format("'{0}'", string.Join("','", filter.Cities.Select(i => i.Replace("'", "''"))))})");
        }

        if (filter.AirportCodes?.Count > 0)
        {
            whereQuery.Append($" AND flights.tracked_arrival_airport_fs_internal IN ({string.Format("'{0}'", string.Join("','", filter.AirportCodes.Select(i => i.Replace("'", "''"))))})");
        }

        if (filter.RegionCodes?.Count > 0)
        {
            whereQuery.Append($" AND flights.tracked_arrival_region_code IN ({string.Format("'{0}'", string.Join("','", filter.RegionCodes.Select(i => i.Replace("'", "''"))))})");
        }

        if (filter.OperatorIds?.Count > 0)
        {
            whereQuery.Append($" AND flights.operator_organization_id IN ({string.Join(",", filter.OperatorIds)})");
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
    private static string BuildFlightDetailsSortByClause(AssetWatchTableSearchParameters filter)
    {
        var sortByQuery = " ";
        var colName = filter.SortColumn?.Trim().ToString().ToLower();

        switch (colName)
        {
            case var value when value == "ArrivalDate".ToLower():
                sortByQuery += "ORDER BY ArrivalDate " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "LastOriginAirport".ToLower():
                sortByQuery += "ORDER BY LastOriginAirport " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "SelectedAirport".ToLower():
                sortByQuery += "ORDER BY SelectedAirport " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "SelectedCountry".ToLower():
                sortByQuery += "ORDER BY SelectedCountry " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "RouteCategory".ToLower():
                sortByQuery += "ORDER BY RouteCategory " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "OperationType".ToLower():
                sortByQuery += "ORDER BY OperationType " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "GroundEventTime".ToLower():
                sortByQuery += "ORDER BY GroundEventTime " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "MaintenanceActivity".ToLower():
                sortByQuery += "ORDER BY MaintenanceActivity " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "DepartureDate".ToLower():
                sortByQuery += "ORDER BY DepartureDate " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
            case var value when value == "NextDestinationAirport".ToLower():
                sortByQuery += "ORDER BY NextDestinationAirport " + filter.SortOrder?.Trim().ToString().ToUpper();
                break;
        }
        return sortByQuery;

    }
}
