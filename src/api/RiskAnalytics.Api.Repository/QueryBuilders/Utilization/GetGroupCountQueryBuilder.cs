using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization;

public class GetGroupCountQueryBuilder : IGetGroupCountQueryBuilder
{
    private const string SelectPlaceHolder = "**SELECT-PLACEHOLDER**";
    private const string WherePlaceHolder = "**WHERE-PLACEHOLDER**";
    private const string GroupByPlaceHolder = "**GROUP-BY-PLACEHOLDER**";
    private const string OrderByPlaceHolder = "**ORDER-BY-PLACEHOLDER**";

    public string BuildQuery(MonthlyUtilizationGroup? groupBy, bool includeBaseline)
    {
        if (groupBy == null && !includeBaseline)
        {
            throw new InvalidOperationException("groupBy cannot be null when includeBaseline is false.");
        }

        var query = $@"
            WITH filtered_ids AS (
            SELECT TO_NUMBER(VALUE)::INTEGER AS Number
            FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
            )";

        if (includeBaseline)
        {
            query = query + BuildBaselineQuery();

            if (groupBy != null)
            {
                query = $"{query}{Environment.NewLine}UNION{Environment.NewLine}";
            }
        }

        if (groupBy != null)
        {
            query += groupBy switch
            {
                MonthlyUtilizationGroup.MarketClass =>
                    BuildGroupByQuery("aircraft_market_class_id", "aircraft_market_class", "NULL AS AircraftType,"),

                MonthlyUtilizationGroup.AircraftFamily =>
                    BuildGroupByQuery("aircraft_family_id", "aircraft_family", "NULL AS AircraftType,"),

                MonthlyUtilizationGroup.AircraftType =>
                    BuildGroupByQuery("aircraft_type_id", "aircraft_type", "NULL AS AircraftType,"),

                MonthlyUtilizationGroup.AircraftSeries =>
                    BuildGroupByQuery("aircraft_series_id", "aircraft_series", "NULL AS AircraftType,"),

                MonthlyUtilizationGroup.AircraftSerialNumber =>
                    BuildGroupByQuery("aircraft_id", "aircraft_serial_number", "aircraft_type AS AircraftType,", "AircraftType,"),

                _ => throw new ArgumentOutOfRangeException(nameof(groupBy))
            };
        }

        return query;
    }

    private static string BuildBaselineQuery()
    {
        var template = BuildQueryTemplate();
        var totalQuery = template
            .Replace(SelectPlaceHolder, $"NULL AS AircraftType,'{UtilizationBaselineGroupName.Name}' \"group\", NULL \"group_id\",")
            .Replace(WherePlaceHolder, "")
            .Replace(GroupByPlaceHolder, "GROUP BY a.year, a.month");

        return totalQuery;
    }

    private static string BuildGroupByQuery(string groupByIdColumn, string groupByNameColumn, string additionalSelect = "", string additionalGroupBy = "")
    {
        var template = BuildQueryTemplate();

        return template
            .Replace(SelectPlaceHolder, $"{additionalSelect}{groupByNameColumn} \"group\", {groupByIdColumn} \"group_id\",")
            .Replace(WherePlaceHolder, $"AND {groupByIdColumn} IN(SELECT Number FROM filtered_ids)")
            .Replace(GroupByPlaceHolder, $"GROUP BY {additionalGroupBy}{groupByNameColumn}, {groupByIdColumn}, a.year, a.month");
    }

    private static string BuildQueryTemplate()
    {
        return $@"
            SELECT
                {SelectPlaceHolder}
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM {Constants.RiskAnalyticsTablePrefix}HYBRID_AIRCRAFT_UTILIZATION_COMBINED a
            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)
                {WherePlaceHolder}
            {GroupByPlaceHolder}";
    }
}
