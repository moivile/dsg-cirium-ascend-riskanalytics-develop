using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders;
using System.Text;

namespace RiskAnalytics.Api.Repository;

public class TrackedUtilizationRepository : ITrackedUtilizationRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;

    public TrackedUtilizationRepository(
    ISnowflakeRepository snowflakeRepository
    )
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public async Task<IEnumerable<IdNameCountModel>> SummaryFlights(
        int portfolioId,
        AssetWatchSearchParameters assetWatchSearchParameters,
        AssetWatchGroupingOption assetWatchGroupingOption)
    {
        var parameters = new { portfolioId };

        var groupingColumn = "ptu.tracked_arrival_country_code_iata";
        var whereQuery = BuildFlightsWhereQuery(assetWatchSearchParameters);

        var query = $@"SELECT countries.name, count FROM (SELECT
{groupingColumn} AS id,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
INNER JOIN {Constants.RiskAnalyticsTablePrefix}countries AS countries ON countries.country_code_iata = id ORDER BY count DESC";

        switch (assetWatchGroupingOption)
        {
            case AssetWatchGroupingOption.Airport:
                groupingColumn = "arrival_airports.name";

                query = $@"SELECT
{groupingColumn} AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn})
ORDER BY count DESC
LIMIT 1000";
                break;
            case AssetWatchGroupingOption.City:
                groupingColumn = "ptu.tracked_arrival_city_name";

                query = $@"SELECT cities.name, count FROM (SELECT {groupingColumn} AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
INNER JOIN {Constants.RiskAnalyticsTablePrefix}cities AS cities ON cities.name = id ORDER BY count DESC";
                break;
            case AssetWatchGroupingOption.Region:
                groupingColumn = "ptu.tracked_arrival_region_code";
                query = $@"SELECT regions.name, count FROM (SELECT {groupingColumn} AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
INNER JOIN {Constants.RiskAnalyticsTablePrefix}regions AS regions ON regions.region_code = id ORDER BY count DESC";
                break;
            case AssetWatchGroupingOption.Operator:
                groupingColumn = "ptu.operator_organization_id";
                query = $@"SELECT DISTINCT aah.operator as name, count FROM (SELECT {groupingColumn} AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
INNER JOIN ""aircraft_all_history_latest"" AS aah ON aah.operator_organization_id = id ORDER BY count DESC";
                break;
            case AssetWatchGroupingOption.Lessor:
                groupingColumn = "ptu.lessor_organization_id";
                query = $@"SELECT DISTINCT lessor.organization as name, count FROM (SELECT {groupingColumn} AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
INNER JOIN ""organizations_latest"" AS lessor ON lessor.organization_id = id
AND lessor.organization_sub_type_id = 88
ORDER BY count DESC";
                break;
            case AssetWatchGroupingOption.AircraftSeries:
                groupingColumn = "ptu.aircraft_series_id";
                query = $@"SELECT DISTINCT ac.aircraft_series as name, count FROM (SELECT {groupingColumn} AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
INNER JOIN ""aircraft_configurations_latest"" AS ac ON ac.aircraft_series_id = id  ORDER BY count DESC";
                break;
            case AssetWatchGroupingOption.EngineSeries:
                groupingColumn = "ptu.engine_series_id";
                query = $@"SELECT DISTINCT name, count FROM (SELECT {groupingColumn} AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
INNER JOIN {Constants.RiskAnalyticsTablePrefix}engine_series AS es ON es.engine_series_id = id ORDER BY count DESC";
                break;
            case AssetWatchGroupingOption.AircraftType:
                groupingColumn = "ptu.aircraft_type_id";
                query = $@"SELECT DISTINCT ac.aircraft_type as name, count FROM (SELECT {groupingColumn} AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
INNER JOIN ""aircraft_configurations_latest"" AS ac ON ac.aircraft_type_id = id  ORDER BY count DESC";
                break;
            case AssetWatchGroupingOption.MarketClass:
                groupingColumn = "ac.aircraft_market_class";
                query = $@"SELECT DISTINCT  name, count FROM (SELECT {groupingColumn} AS name,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization as ptu
INNER JOIN ""aircraft_all_history_latest"" AS aah ON aah.aircraft_id = ptu.aircraft_id
INNER JOIN ""aircraft_configurations_latest"" AS ac ON ac.aircraft_configuration_id = aah.aircraft_configuration_id
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id=:portfolioId)
{whereQuery}
GROUP BY({groupingColumn}) LIMIT 1000) AS rawdata
ORDER BY count DESC";
                break;
            default:
                break;
        }

        return await snowflakeRepository.Query<IdNameCountModel>(query, parameters);
    }

    private static string BuildFlightsWhereQuery(
        AssetWatchSearchParameters assetWatchSearchParameters)
    {
        var whereQuery = new StringBuilder();

        whereQuery = TrackedUtilizationQueryBuilder.GetSearchPeriodQuery(whereQuery, assetWatchSearchParameters);
        whereQuery.Append(" ");

        if (assetWatchSearchParameters.CountryCodes?.Count > 0)
        {
            whereQuery.Append($" AND ptu.tracked_arrival_country_code_iata IN ({string.Format("'{0}'", string.Join("','", assetWatchSearchParameters.CountryCodes.Select(i => i.Replace("'", "''"))))})");
        }
        if (assetWatchSearchParameters.Cities?.Count > 0)
        {
            whereQuery.Append($" AND ptu.tracked_arrival_city_name IN ({string.Format("'{0}'", string.Join("','", assetWatchSearchParameters.Cities.Select(i => i.Replace("'", "''"))))})");
        }

        if (assetWatchSearchParameters.AirportCodes?.Count > 0)
        {
            whereQuery.Append($" AND ptu.tracked_arrival_airport_fs_internal IN ({string.Format("'{0}'", string.Join("','", assetWatchSearchParameters.AirportCodes.Select(i => i.Replace("'", "''"))))})");
        }

        if (assetWatchSearchParameters.RegionCodes?.Count > 0)
        {
            whereQuery.Append($" AND ptu.tracked_arrival_region_code IN ({string.Format("'{0}'", string.Join("','", assetWatchSearchParameters.RegionCodes.Select(i => i.Replace("'", "''"))))})");
        }

        if (assetWatchSearchParameters.OperatorIds?.Count > 0)
        {
            whereQuery.Append($" AND ptu.operator_organization_id IN ({string.Join(",", assetWatchSearchParameters.OperatorIds)})");
        }

        if (assetWatchSearchParameters.LessorIds?.Count > 0)
        {
            whereQuery.Append($" AND ptu.lessor_organization_id IN ({string.Join(",", assetWatchSearchParameters.LessorIds)})");
        }

        if (assetWatchSearchParameters.AircraftSeriesIds?.Count > 0)
        {
            whereQuery.Append($" AND ptu.aircraft_series_id IN ({string.Join(",", assetWatchSearchParameters.AircraftSeriesIds)})");
        }

        if (assetWatchSearchParameters.EngineSerieIds?.Count > 0)
        {
            whereQuery.Append($" AND ptu.engine_series_id IN ({string.Join(",", assetWatchSearchParameters.EngineSerieIds)})");
        }

        if (assetWatchSearchParameters.AircraftIds?.Count > 0)
        {
            whereQuery.Append($" AND ptu.aircraft_id IN  ({string.Join(",", assetWatchSearchParameters.AircraftIds)})");
        }

        switch (assetWatchSearchParameters.RouteCategory)
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

        return whereQuery.ToString();
    }
}
