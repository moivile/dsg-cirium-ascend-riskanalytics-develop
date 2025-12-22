using System.Text;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization;

public class GetMonthlyUtilizationQueryBuilder : IGetMonthlyUtilizationQueryBuilder
{
    private const string SelectPlaceHolder = "**SELECT-PLACEHOLDER**";
    private const string WherePlaceHolder = "**WHERE-PLACEHOLDER**";
    private const string GroupByPlaceHolder = "**GROUP-BY-PLACEHOLDER**";
    private const double KmToMilesRate = 1.60934;

    public string BuildQuery(
        MonthlyUtilizationGroup? groupBy,
        bool includeBaseline,
        bool includeEmissions,
        bool isEmissions,
        bool isHoursAndCycle,
        bool isGlobalFleet = false)
    {
        if (groupBy == null && !includeBaseline)
        {
            throw new InvalidOperationException("groupBy cannot be null when includeBaseline is false.");
        }

        var query = "";

        if (includeBaseline)
        {
            query = BuildBaselineQuery(isGlobalFleet, includeEmissions, isEmissions, isHoursAndCycle);

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
                    BuildGroupByQuery(isGlobalFleet, "aircraft_market_class_id", "aircraft_market_class", includeEmissions, isEmissions, isHoursAndCycle, "NULL AS AircraftType,"),

                MonthlyUtilizationGroup.AircraftFamily =>
                    BuildGroupByQuery(isGlobalFleet, "aircraft_family_id", "aircraft_family", includeEmissions, isEmissions, isHoursAndCycle, "NULL AS AircraftType,"),

                MonthlyUtilizationGroup.AircraftType =>
                    BuildGroupByQuery(isGlobalFleet, "aircraft_type_id", "aircraft_type", includeEmissions, isEmissions, isHoursAndCycle, "NULL AS AircraftType,"),

                MonthlyUtilizationGroup.AircraftSeries =>
                    BuildGroupByQuery(isGlobalFleet, "aircraft_series_id", "aircraft_series", includeEmissions, isEmissions, isHoursAndCycle, "NULL AS AircraftType,"),

                MonthlyUtilizationGroup.AircraftSerialNumber =>
                    BuildGroupByQuery(isGlobalFleet, "aircraft_id", "aircraft_serial_number", includeEmissions, isEmissions, isHoursAndCycle, "aircraft_type AS AircraftType,", "AircraftType,"),

                _ => throw new ArgumentOutOfRangeException(nameof(groupBy))
            };
        }

        return @$"
        WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
        )
        SELECT * FROM ({query}) x";
    }

    private static string BuildBaselineQuery(bool isGlobalFleet, bool includeEmissions, bool isEmissions, bool isHoursAndCycle)
    {
        var template = BuildQueryTemplate(includeEmissions, isEmissions, isHoursAndCycle, isGlobalFleet);
        var totalQuery = template
            .Replace(SelectPlaceHolder, $" NULL AS AircraftType, '{UtilizationBaselineGroupName.Name}' \"group\", NULL \"group_id\",")
            .Replace(WherePlaceHolder, "")
            .Replace(GroupByPlaceHolder, "");

        return totalQuery;
    }

    private static string BuildGroupByQuery(bool isGlobalFleet, string groupByIdColumn, string groupByNameColumn, bool includeEmissions, bool isEmissions, bool isHoursAndCycle, string additionalSelect = "", string additionalGroupBy = "")
    {
        var template = BuildQueryTemplate(includeEmissions, isEmissions, isHoursAndCycle, isGlobalFleet);

        var tableName = groupByIdColumn == "aircraft_id" ? "aircraft" : "aircraft_configurations";

        return template
            .Replace(SelectPlaceHolder, $"{additionalSelect}{groupByNameColumn} \"group\", {groupByIdColumn} \"group_id\",")
            .Replace(WherePlaceHolder, $"AND {tableName}.{groupByIdColumn} IN (SELECT Number FROM filtered_ids)")
            .Replace(GroupByPlaceHolder, $"{additionalGroupBy}{groupByNameColumn}, {groupByIdColumn},");
    }

    private static string BuildQueryTemplate(bool includeEmissions, bool isEmissions, bool isHoursAndCycle, bool isGlobalFleet)
    {
        var sqlBuilder = new StringBuilder();

        sqlBuilder.Append($@"
            SELECT
                {SelectPlaceHolder}
                data_year AS year,
                data_month AS month");

        if (isHoursAndCycle)
        {
            sqlBuilder.Append(@$",
                {BuildAverageSelectQuery("hours")},
                {BuildAverageSelectQuery("cycles")},
                {BuildTotalSelectQuery("hours")},
                {BuildTotalSelectQuery("cycles")},
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle");
        }

        if (includeEmissions && isEmissions)
        {
            sqlBuilder.Append(@$",
                {QueryPartForCo2PerSeat()},
                {BuildTotalKgPerSeatSelectQuery()},
                {AverageCo2PerAsm()},
                CASE
                    WHEN COUNT(CASE WHEN co2_g_per_ask >= 0 THEN 1 ELSE NULL END) = 0 THEN 0
                    ELSE ROUND(SUM(co2_g_per_ask * {KmToMilesRate}), 2)
                END AS total_co2_g_per_asm,
                {QueryPartForCo2PerAsk()},
                {BuildTotalSelectQuery("co2_g_per_ask")}");
        }

        sqlBuilder.Append(@$"
                FROM (
                        SELECT
                            aircraft_configurations.aircraft_family,
                            aircraft_configurations.aircraft_family_id,

                            aircraft_configurations.aircraft_market_class_id,
                            aircraft_configurations.aircraft_market_class,

                            aircraft_configurations.aircraft_type_id,
                            aircraft_configurations.aircraft_type,

                            aircraft_configurations.aircraft_series_id,
                            aircraft_configurations.aircraft_series,
                            aircraft.aircraft_serial_number,

                            aircraft_utilization_by_month.aircraft_id,
                            aircraft_utilization_by_month.hours,
                            aircraft_utilization_by_month.cycles,
                            aircraft_utilization_by_month.hours_per_cycle,
                            aircraft_utilization_by_month.co2_emissions_kg,
                            aircraft_utilization_by_month.co2_g_per_ask,
                            ac.number_of_seats,
                            aircraft_utilization_by_month.flight_distance_km,
                            aircraft_utilization_by_month.year AS data_year,
                            aircraft_utilization_by_month.month AS data_month

            FROM ""aircraft_latest"" AS aircraft ");

        if (!isGlobalFleet)
        {
            sqlBuilder.Append(@$"LEFT JOIN {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId");
        }

        sqlBuilder.Append(@$"
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN {Constants.RiskAnalyticsTablePrefix}HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN {Constants.RiskAnalyticsTablePrefix}aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE ");

        if (!isGlobalFleet)
        {
            sqlBuilder.Append(@$" (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId) AND ");
        }

        sqlBuilder.Append(@$"                
                (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                {WherePlaceHolder}
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                {GroupByPlaceHolder}
                data_year,
                data_month");

        return sqlBuilder.ToString();
    }

    private static string BuildAverageSelectQuery(string column)
    {
        return @$"
        CASE
            WHEN COUNT(DISTINCT CASE WHEN {column} >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM({column}) /
                COUNT(DISTINCT CASE WHEN {column} >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_{column},
        COUNT(DISTINCT CASE WHEN {column} >= 0 THEN aircraft_id END) AS number_of_aircraft_with_{column}";
    }

    private static string QueryPartForCo2PerAsk()
    {
        return @$"
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE (SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END) 
                END average_co2_g_per_ask,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_ask";
    }

    private static string AverageCo2PerAsm()
    {
        return @$"
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(((SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END)) * {KmToMilesRate} , 2) 
                END AS average_co2_g_per_asm,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_asm";
    }

    private static string QueryPartForCo2PerSeat()
    {
        return @$"
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(SUM(CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END)
                    / SUM(CASE WHEN number_of_seats > 0 THEN number_of_seats END), 2)
                END average_co2_kg_per_seat,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_kg_per_seat";
    }

    private static string BuildTotalSelectQuery(string column)
    {
        return @$"ROUND(SUM({column}), 2) AS total_{column}";
    }

    private static string BuildTotalKgPerSeatSelectQuery()
    {
        return @$"CASE
                    WHEN SUM(number_of_seats) = 0 THEN 0
                    ELSE ROUND(SUM(co2_emissions_kg) / SUM(number_of_seats), 2)
                END AS total_co2_kg_per_seat";
    }
}
