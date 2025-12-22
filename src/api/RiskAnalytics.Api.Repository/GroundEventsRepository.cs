using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;
using System.Text;

namespace RiskAnalytics.Api.Repository;

public class GroundEventsRepository : IGroundEventsRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;


    public GroundEventsRepository(ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public async Task<IEnumerable<SummaryGroundEventsModel>> SummaryGroundEvents(int portfolioId, AssetWatchSearchParameters assetWatchSearchParameters, AssetWatchGroupingOption assetWatchGroupingOption)
    {
        var parameters = new { portfolioId };

        var whereQuery = BuildWhereQuery(assetWatchSearchParameters);

        var query = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
        very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
        FROM (SELECT ground_event_location_country_id AS id,
        COUNT(1),
        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
        FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
        WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
        {whereQuery}
        GROUP BY(ground_event_location_country_id)
        LIMIT 1000) AS rawdata
        INNER JOIN {Constants.RiskAnalyticsTablePrefix}countries AS countries ON countries.country_code_iata = id
        ORDER BY TOTAL DESC";

        switch (assetWatchGroupingOption)
        {
            case AssetWatchGroupingOption.Airport:
                query = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
                WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                {whereQuery}
                GROUP BY(arrival_airports.name)
                LIMIT 1000) AS rawdata
                ORDER BY TOTAL DESC";
                break;

            case AssetWatchGroupingOption.City:
                query = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT ground_event_location_city_name AS city_name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                {whereQuery}
                GROUP BY(ground_event_location_city_name)
                LIMIT 1000) AS rawdata
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}cities AS cities ON cities.name = city_name
                ORDER BY TOTAL DESC";
                break;

            case AssetWatchGroupingOption.Region:
                query = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT ground_event_location_region_id AS id,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                {whereQuery}
                GROUP BY(ground_event_location_region_id)
                LIMIT 1000) AS rawdata
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}regions AS regions ON regions.region_code = id
                ORDER BY TOTAL DESC";
                break;

            case AssetWatchGroupingOption.Operator:
                query = $@"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT AAH.OPERATOR AS NAME,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID= GE.AIRCRAFT_ID
                WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                {whereQuery}
                GROUP BY (AAH.OPERATOR)
                LIMIT 1000) AS RAWDATA
                ORDER BY TOTAL DESC";
                break;

            case AssetWatchGroupingOption.Lessor:
                query = $@"SELECT
                    NAME,
                    VERY_SHORT_STAY_COUNT,
                    SHORT_STAY_COUNT,
                    MEDIUM_STAY_COUNT,
                    LONG_STAY_COUNT,
                    VERY_SHORT_STAY_COUNT + SHORT_STAY_COUNT + MEDIUM_STAY_COUNT + LONG_STAY_COUNT AS TOTAL
                FROM (
                    SELECT
                    LESSOR.ORGANIZATION AS NAME,
                    COUNT(1),
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH
                    ON AAH.AIRCRAFT_ID = GE.AIRCRAFT_ID
                    LEFT JOIN ""organizations_latest"" AS LESSOR
                    ON LESSOR.ORGANIZATION_ID = AAH.MANAGER_ORGANIZATION_ID
                    AND LESSOR.ORGANIZATION_SUB_TYPE_ID = 88
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                    AND LESSOR.ORGANIZATION IS NOT NULL
                    {whereQuery}
					GROUP BY(LESSOR.ORGANIZATION)
					LIMIT 1000) AS RAWDATA
					ORDER BY TOTAL DESC";
                break;

            case AssetWatchGroupingOption.AircraftSeries:
                query = $@"SELECT NAME,
                    VERY_SHORT_STAY_COUNT,
                    SHORT_STAY_COUNT,
                    MEDIUM_STAY_COUNT,
                    LONG_STAY_COUNT,
                    VERY_SHORT_STAY_COUNT + SHORT_STAY_COUNT + MEDIUM_STAY_COUNT + LONG_STAY_COUNT AS TOTAL
                FROM
                (
                    SELECT AC.AIRCRAFT_SERIES AS NAME,
                    COUNT(1),
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID = GE.AIRCRAFT_ID
                    INNER JOIN ""aircraft_configurations_latest"" AS AC ON AC.AIRCRAFT_CONFIGURATION_ID = AAH.AIRCRAFT_CONFIGURATION_ID
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                    {whereQuery}
					GROUP BY(AC.AIRCRAFT_SERIES)
					LIMIT 1000) AS RAWDATA
					ORDER BY TOTAL DESC";
                break;

            case AssetWatchGroupingOption.EngineSeries:
                query = $@"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
                    very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                    FROM (SELECT AC.ENGINE_SERIES AS NAME,
                    COUNT(1),
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID = GE.AIRCRAFT_ID
                    INNER JOIN ""aircraft_configurations_latest"" AS AC ON AC.AIRCRAFT_CONFIGURATION_ID = AAH.AIRCRAFT_CONFIGURATION_ID
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
					{whereQuery}
					GROUP BY(AC.ENGINE_SERIES)
					LIMIT 1000) AS RAWDATA
					ORDER BY TOTAL DESC";
                break;

            case AssetWatchGroupingOption.AircraftType:
                query = $@"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
                    VERY_SHORT_STAY_COUNT+SHORT_STAY_COUNT+MEDIUM_STAY_COUNT+LONG_STAY_COUNT AS TOTAL
                    FROM (SELECT AC.AIRCRAFT_TYPE AS NAME,
                    COUNT(1),
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID= GE.AIRCRAFT_ID
                    INNER JOIN ""aircraft_configurations_latest"" AS AC ON AC.AIRCRAFT_CONFIGURATION_ID = AAH.AIRCRAFT_CONFIGURATION_ID
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                    {whereQuery}
					GROUP BY(AC.AIRCRAFT_TYPE)
					LIMIT 1000) AS RAWDATA
					ORDER BY TOTAL DESC";
                break;

            case AssetWatchGroupingOption.MarketClass:
                query = $@"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
                    very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                    FROM (SELECT AC.AIRCRAFT_MARKET_CLASS AS NAME,
                    COUNT(1),
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID= GE.AIRCRAFT_ID
                    INNER JOIN ""aircraft_configurations_latest"" AS AC ON AC.AIRCRAFT_CONFIGURATION_ID = AAH.AIRCRAFT_CONFIGURATION_ID
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                    {whereQuery}
                    GROUP BY(AC.AIRCRAFT_MARKET_CLASS)
                    LIMIT 1000) AS RAWDATA
                    ORDER BY TOTAL DESC";
                break;
            default:
                break;

        }

        return await snowflakeRepository.Query<SummaryGroundEventsModel>(query, parameters);
    }

    private static string BuildWhereQuery(AssetWatchSearchParameters assetWatchSearchParameters)
    {
        var whereQuery = new StringBuilder();

        if (assetWatchSearchParameters.CountryCodes?.Count > 0)
        {
            whereQuery.Append($" GE.ground_event_location_country_id IN ({string.Format("'{0}'", string.Join("','", assetWatchSearchParameters.CountryCodes.Select(i => i.Replace("'", "''"))))}) AND");
        }

        if (assetWatchSearchParameters.Cities?.Count > 0)
        {
            whereQuery.Append($" GE.ground_event_location_city_name IN ({string.Format("'{0}'", string.Join("','", assetWatchSearchParameters.Cities.Select(i => i.Replace("'", "''"))))}) AND");
        }

        if (assetWatchSearchParameters.AirportCodes?.Count > 0)
        {
            whereQuery.Append($" GE.ground_event_location_airport_code_fs_internal IN ({string.Format("'{0}'", string.Join("','", assetWatchSearchParameters.AirportCodes.Select(i => i.Replace("'", "''"))))}) AND");
        }

        if (assetWatchSearchParameters.RegionCodes?.Count > 0)
        {
            whereQuery.Append($" GE.ground_event_location_region_id IN ({string.Format("'{0}'", string.Join("','", assetWatchSearchParameters.RegionCodes.Select(i => i.Replace("'", "''"))))}) AND");
        }

        whereQuery = GetSearchPeriodQuery(whereQuery, assetWatchSearchParameters);

        if (assetWatchSearchParameters.OperatorIds?.Count > 0)
        {
            whereQuery.Append($" GE.operator_organization_id IN ({string.Join(",", assetWatchSearchParameters.OperatorIds)}) AND");
        }

        if (assetWatchSearchParameters.LessorIds?.Count > 0)
        {
            whereQuery.Append($" GE.lessor_organization_id IN ({string.Join(",", assetWatchSearchParameters.LessorIds)}) AND");
        }

        if (assetWatchSearchParameters.AircraftSeriesIds?.Count > 0)
        {
            whereQuery.Append($" GE.aircraft_series_id IN ({string.Join(",", assetWatchSearchParameters.AircraftSeriesIds)}) AND");
        }

        if (assetWatchSearchParameters.EngineSerieIds?.Count > 0)
        {
            whereQuery.Append($" GE.engine_series_id IN ({string.Join(",", assetWatchSearchParameters.EngineSerieIds)}) AND");
        }

        if (assetWatchSearchParameters.AircraftIds?.Count > 0)
        {
            whereQuery.Append($" GE.aircraft_id IN  ({string.Join(",", assetWatchSearchParameters.AircraftIds)}) AND");
        }

        var query = whereQuery.ToString();

        if (query.Length == 0)
        {
            return query;
        }

        if (query.EndsWith("OR "))
        {
            query = query.Remove(query.Length - 3, 3);
        }
        else
        {
            query = query.Remove(query.Length - 4, 4);
        }

        return "AND " + query;
    }

    private static StringBuilder GetSearchPeriodQuery(StringBuilder sb, AssetWatchSearchParameters assetWatchSearchParameters)
    {
        switch (assetWatchSearchParameters.Period)
        {
            case AssetWatchSearchPeriod.Yesterday:
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '1 day') AND ");
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND ");
                break;
            case AssetWatchSearchPeriod.Last7Days:
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND ");
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND ");
                break;
            case AssetWatchSearchPeriod.Last1Month:
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '1 month') AND ");
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND ");
                break;
            case AssetWatchSearchPeriod.Last3Months:
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '3 month') AND ");
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND ");
                break;
            case AssetWatchSearchPeriod.Last6Months:
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '6 month') AND ");
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND ");
                break;
            case AssetWatchSearchPeriod.Last12Months:
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '12 month') AND ");
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND ");
                break;
            case AssetWatchSearchPeriod.SelectDateRange:
                if (!assetWatchSearchParameters.DateFrom.HasValue)
                {
                    throw new ArgumentException("DateFrom is required for custom search period");
                }

                if (!assetWatchSearchParameters.DateTo.HasValue)
                {
                    throw new ArgumentException("DateTo is required for custom search period");
                }

                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >='{assetWatchSearchParameters.DateFrom.Value.ToString("yyyy-MM-dd")}'::date AND ");
                sb.Append($" GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <'{assetWatchSearchParameters.DateTo.Value.AddDays(1).ToString("yyyy-MM-dd")}'::date AND ");
                break;
        }

        return sb;
    }
}
