using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization;

namespace RiskAnalytics.Api.Repository.Tests.QueryBuilders.Utilization;

public class GetMonthlyUtilizationQueryBuilderTests
{
    [Fact]
    public void BuildQuery_GroupByIsNotNullAndIncludeBaseLineIsTrueAndIncludeEmissionsIsTrueIsEmissionIsFalseIsHoursAndCyclesIsTrue_BuildQuery()
    {
        // act
        var query = new GetMonthlyUtilizationQueryBuilder().BuildQuery(MonthlyUtilizationGroup.AircraftFamily, true, true, false, true);

        // assert
        const string expected = $@"        
        
        WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
        )
        SELECT * FROM (
            SELECT
                 NULL AS AircraftType, 'All aircraft' ""group"", NULL ""group_id"",
                data_year AS year,
                data_month AS month,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(hours) /
                COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_hours,
        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(cycles) /
                COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_cycles,
        COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                ROUND(SUM(hours), 2) AS total_hours,
                ROUND(SUM(cycles), 2) AS total_cycles,
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                
                data_year,
                data_month
UNION

            SELECT
                NULL AS AircraftType,aircraft_family ""group"", aircraft_family_id ""group_id"",
                data_year AS year,
                data_month AS month,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(hours) /
                COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_hours,
        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(cycles) /
                COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_cycles,
        COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                ROUND(SUM(hours), 2) AS total_hours,
                ROUND(SUM(cycles), 2) AS total_cycles,
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                AND aircraft_configurations.aircraft_family_id IN (SELECT Number FROM filtered_ids)
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                aircraft_family, aircraft_family_id,
                data_year,
                data_month) x";

        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByIsNotNullAndIncludeBaseLineIsTrueAndIncludeEmissionsIsTrueIsEmissionIsTrueIsHoursAndCyclesIsFalse_BuildQuery()
    {
        // act
        var query = new GetMonthlyUtilizationQueryBuilder().BuildQuery(MonthlyUtilizationGroup.AircraftFamily, true, true, true, false);

        // assert
        const string expected = $@"       
        
        WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
        )
        SELECT * FROM (
            SELECT
                 NULL AS AircraftType, 'All aircraft' ""group"", NULL ""group_id"",
                data_year AS year,
                data_month AS month,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(SUM(CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END)
                    / SUM(CASE WHEN number_of_seats > 0 THEN number_of_seats END), 2)
                END average_co2_kg_per_seat,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_kg_per_seat,
                CASE
                    WHEN SUM(number_of_seats) = 0 THEN 0
                    ELSE ROUND(SUM(co2_emissions_kg) / SUM(number_of_seats), 2)
                END AS total_co2_kg_per_seat,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(((SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END)) * 1.60934 , 2) 
                END AS average_co2_g_per_asm,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_asm,
                CASE
                    WHEN COUNT(CASE WHEN co2_g_per_ask >= 0 THEN 1 ELSE NULL END) = 0 THEN 0
                    ELSE ROUND(SUM(co2_g_per_ask * 1.60934), 2)
                END AS total_co2_g_per_asm,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE (SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END) 
                END average_co2_g_per_ask,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_ask,
                ROUND(SUM(co2_g_per_ask), 2) AS total_co2_g_per_ask
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                
                data_year,
                data_month
UNION

            SELECT
                NULL AS AircraftType,aircraft_family ""group"", aircraft_family_id ""group_id"",
                data_year AS year,
                data_month AS month,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(SUM(CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END)
                    / SUM(CASE WHEN number_of_seats > 0 THEN number_of_seats END), 2)
                END average_co2_kg_per_seat,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_kg_per_seat,
                CASE
                    WHEN SUM(number_of_seats) = 0 THEN 0
                    ELSE ROUND(SUM(co2_emissions_kg) / SUM(number_of_seats), 2)
                END AS total_co2_kg_per_seat,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(((SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END)) * 1.60934 , 2) 
                END AS average_co2_g_per_asm,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_asm,
                CASE
                    WHEN COUNT(CASE WHEN co2_g_per_ask >= 0 THEN 1 ELSE NULL END) = 0 THEN 0
                    ELSE ROUND(SUM(co2_g_per_ask * 1.60934), 2)
                END AS total_co2_g_per_asm,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE (SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END) 
                END average_co2_g_per_ask,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_ask,
                ROUND(SUM(co2_g_per_ask), 2) AS total_co2_g_per_ask
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                AND aircraft_configurations.aircraft_family_id IN (SELECT Number FROM filtered_ids)
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                aircraft_family, aircraft_family_id,
                data_year,
                data_month) x";

        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByIsNotNullAndIncludeBaseLineIsTrueAndIncludeEmissionsIsFalse_BuildQuery()
    {
        // act
        var query = new GetMonthlyUtilizationQueryBuilder().BuildQuery(MonthlyUtilizationGroup.AircraftFamily, true, false, false, true);

        // assert
        const string expected = @$"        
        
        WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
        )
        SELECT * FROM (
            SELECT
                 NULL AS AircraftType, 'All aircraft' ""group"", NULL ""group_id"",
                data_year AS year,
                data_month AS month,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(hours) /
                COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_hours,
        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(cycles) /
                COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_cycles,
        COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                ROUND(SUM(hours), 2) AS total_hours,
                ROUND(SUM(cycles), 2) AS total_cycles,
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                
                data_year,
                data_month
UNION

            SELECT
                NULL AS AircraftType,aircraft_family ""group"", aircraft_family_id ""group_id"",
                data_year AS year,
                data_month AS month,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(hours) /
                COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_hours,
        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(cycles) /
                COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_cycles,
        COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                ROUND(SUM(hours), 2) AS total_hours,
                ROUND(SUM(cycles), 2) AS total_cycles,
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                AND aircraft_configurations.aircraft_family_id IN (SELECT Number FROM filtered_ids)
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                aircraft_family, aircraft_family_id,
                data_year,
                data_month) x";

        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByIsNotNullAndIncludeBaseLineIsFalseAndIncludeEmissionsIsTrue_BuildQuery()
    {
        // act
        var query = new GetMonthlyUtilizationQueryBuilder().BuildQuery(MonthlyUtilizationGroup.AircraftFamily, false, true, true, true);

        // assert
        const string expected = $@"        
        
        WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
        )
        SELECT * FROM (
            SELECT
                NULL AS AircraftType,aircraft_family ""group"", aircraft_family_id ""group_id"",
                data_year AS year,
                data_month AS month,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(hours) /
                COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_hours,
        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(cycles) /
                COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_cycles,
        COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                ROUND(SUM(hours), 2) AS total_hours,
                ROUND(SUM(cycles), 2) AS total_cycles,
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(SUM(CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END)
                    / SUM(CASE WHEN number_of_seats > 0 THEN number_of_seats END), 2)
                END average_co2_kg_per_seat,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_kg_per_seat,
                CASE
                    WHEN SUM(number_of_seats) = 0 THEN 0
                    ELSE ROUND(SUM(co2_emissions_kg) / SUM(number_of_seats), 2)
                END AS total_co2_kg_per_seat,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(((SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END)) * 1.60934 , 2) 
                END AS average_co2_g_per_asm,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_asm,
                CASE
                    WHEN COUNT(CASE WHEN co2_g_per_ask >= 0 THEN 1 ELSE NULL END) = 0 THEN 0
                    ELSE ROUND(SUM(co2_g_per_ask * 1.60934), 2)
                END AS total_co2_g_per_asm,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE (SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END) 
                END average_co2_g_per_ask,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_ask,
                ROUND(SUM(co2_g_per_ask), 2) AS total_co2_g_per_ask
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                AND aircraft_configurations.aircraft_family_id IN (SELECT Number FROM filtered_ids)
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                aircraft_family, aircraft_family_id,
                data_year,
                data_month) x";

        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_IsGlobalFleetQuery_BuildQuery()
    {
        // act
        var query = new GetMonthlyUtilizationQueryBuilder().BuildQuery(MonthlyUtilizationGroup.AircraftFamily, false, true, true, true, true);

        // assert
        const string expected = $@"        
        
        WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
        )
        SELECT * FROM (
            SELECT
                NULL AS AircraftType,aircraft_family ""group"", aircraft_family_id ""group_id"",
                data_year AS year,
                data_month AS month,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(hours) /
                COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_hours,
        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(cycles) /
                COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_cycles,
        COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                ROUND(SUM(hours), 2) AS total_hours,
                ROUND(SUM(cycles), 2) AS total_cycles,
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(SUM(CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END)
                    / SUM(CASE WHEN number_of_seats > 0 THEN number_of_seats END), 2)
                END average_co2_kg_per_seat,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_kg_per_seat,
                CASE
                    WHEN SUM(number_of_seats) = 0 THEN 0
                    ELSE ROUND(SUM(co2_emissions_kg) / SUM(number_of_seats), 2)
                END AS total_co2_kg_per_seat,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(((SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END)) * 1.60934 , 2) 
                END AS average_co2_g_per_asm,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_asm,
                CASE
                    WHEN COUNT(CASE WHEN co2_g_per_ask >= 0 THEN 1 ELSE NULL END) = 0 THEN 0
                    ELSE ROUND(SUM(co2_g_per_ask * 1.60934), 2)
                END AS total_co2_g_per_asm,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE (SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END) 
                END average_co2_g_per_ask,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_ask,
                ROUND(SUM(co2_g_per_ask), 2) AS total_co2_g_per_ask
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

            FROM ""aircraft_latest"" AS aircraft
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                AND aircraft_configurations.aircraft_family_id IN (SELECT Number FROM filtered_ids)
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                aircraft_family, aircraft_family_id,
                data_year,
                data_month) x";

        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByIsNullAndIncludeBaseLineIsTrueAndIncludeEmissionsIsTrue_BuildQuery()
    {
        // act
        var query = new GetMonthlyUtilizationQueryBuilder().BuildQuery(null, true, true, true, true);

        // assert
        const string expected = $@"        
        
        WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
        )
        SELECT * FROM (
            SELECT
                 NULL AS AircraftType, 'All aircraft' ""group"", NULL ""group_id"",
                data_year AS year,
                data_month AS month,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(hours) /
                COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_hours,
        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(cycles) /
                COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_cycles,
        COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                ROUND(SUM(hours), 2) AS total_hours,
                ROUND(SUM(cycles), 2) AS total_cycles,
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(SUM(CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END)
                    / SUM(CASE WHEN number_of_seats > 0 THEN number_of_seats END), 2)
                END average_co2_kg_per_seat,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_kg_per_seat,
                CASE
                    WHEN SUM(number_of_seats) = 0 THEN 0
                    ELSE ROUND(SUM(co2_emissions_kg) / SUM(number_of_seats), 2)
                END AS total_co2_kg_per_seat,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE ROUND(((SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END)) * 1.60934 , 2) 
                END AS average_co2_g_per_asm,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_asm,
                CASE
                    WHEN COUNT(CASE WHEN co2_g_per_ask >= 0 THEN 1 ELSE NULL END) = 0 THEN 0
                    ELSE ROUND(SUM(co2_g_per_ask * 1.60934), 2)
                END AS total_co2_g_per_asm,
                
            CASE
                WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                ELSE (SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                    / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END) 
                END average_co2_g_per_ask,
                COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_ask,
                ROUND(SUM(co2_g_per_ask), 2) AS total_co2_g_per_ask
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                
                data_year,
                data_month) x";

        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByIsNullAndIncludeBaseLineIsTrueAndIncludeEmissionsIsFalse_BuildQuery()
    {
        // act
        var query = new GetMonthlyUtilizationQueryBuilder().BuildQuery(null, true, false, false, true);

        // assert
        const string expected = $@"        
        
        WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
        )
        SELECT * FROM (
            SELECT
                 NULL AS AircraftType, 'All aircraft' ""group"", NULL ""group_id"",
                data_year AS year,
                data_month AS month,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(hours) /
                COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_hours,
        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,
                
        CASE
            WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
            ELSE ROUND(SUM(cycles) /
                COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
        END AS average_cycles,
        COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                ROUND(SUM(hours), 2) AS total_hours,
                ROUND(SUM(cycles), 2) AS total_cycles,
                CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours_per_cycle) /
                                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                END AS average_hours_per_cycle,
                COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle
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

            FROM ""aircraft_latest"" AS aircraft
            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                
                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
            GROUP BY
                
                data_year,
                data_month) x";

        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByIsNullAndIncludeBaseLineIsFalse_ThrowException()
    {
        // act
        Assert.Throws<InvalidOperationException>(() => new GetMonthlyUtilizationQueryBuilder().BuildQuery(null, false, true, true, true));
    }

    [Fact]
    public void BuildQuery_GroupByIsNotRecognised_ThrowException()
    {
        // act
        Assert.Throws<ArgumentOutOfRangeException>(() => new GetMonthlyUtilizationQueryBuilder().BuildQuery((MonthlyUtilizationGroup)999, false, true, true, true));
    }

    [Theory]
    [InlineData(MonthlyUtilizationGroup.MarketClass, "aircraft_market_class_id", "aircraft_market_class", "NULL AS AircraftType,", "")]
    [InlineData(MonthlyUtilizationGroup.AircraftFamily, "aircraft_family_id", "aircraft_family", "NULL AS AircraftType,", "")]
    [InlineData(MonthlyUtilizationGroup.AircraftType, "aircraft_type_id", "aircraft_type", "NULL AS AircraftType,", "")]
    [InlineData(MonthlyUtilizationGroup.AircraftSeries, "aircraft_series_id", "aircraft_series", "NULL AS AircraftType,", "")]
    [InlineData(MonthlyUtilizationGroup.AircraftSerialNumber, "aircraft_id", "aircraft_serial_number", "aircraft_type AS AircraftType,", "AircraftType,")]
    public void BuildQuery_GroupByIsRecognised_BuildQuery(
        MonthlyUtilizationGroup monthlyUtilizationGroup,
        string groupByIdColumn,
        string groupByNameColumn,
        string additionalSelect,
        string additionalGroupBy)
    {
        var tableName = groupByIdColumn == "aircraft_id" ? "aircraft" : "aircraft_configurations";

        // act
        var query = new GetMonthlyUtilizationQueryBuilder().BuildQuery(monthlyUtilizationGroup, false, true, true, true);

        // assert
        var expected =
            $@"
                WITH filtered_ids AS ( 
                SELECT TO_NUMBER(VALUE)::INTEGER AS Number 
                FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
                )
                SELECT * FROM (
                    SELECT
                        {additionalSelect}{groupByNameColumn} ""group"", {groupByIdColumn} ""group_id"",
                        data_year AS year,
                        data_month AS month,

                    CASE
                    WHEN COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) = 0 THEN 0
                    ELSE ROUND(SUM(hours) /
                        COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END)::DECIMAL, 2)
                    END AS average_hours,
                    COUNT(DISTINCT CASE WHEN hours >= 0 THEN aircraft_id END) AS number_of_aircraft_with_hours,

                    CASE
                        WHEN COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) = 0 THEN 0
                        ELSE ROUND(SUM(cycles) /
                            COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END)::DECIMAL, 2)
                    END AS average_cycles,

                    COUNT(DISTINCT CASE WHEN cycles >= 0 THEN aircraft_id END) AS number_of_aircraft_with_cycles,
                    ROUND(SUM(hours), 2) AS total_hours,
                    ROUND(SUM(cycles), 2) AS total_cycles,

                    CASE
                        WHEN COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) = 0 THEN 0
                        ELSE ROUND(SUM(hours_per_cycle) /
                                    COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END)::DECIMAL, 2)
                    END AS average_hours_per_cycle,
                    COUNT(DISTINCT CASE WHEN hours_per_cycle > 0 THEN aircraft_id END) AS number_of_aircraft_with_hours_per_cycle,

                    CASE
                        WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) = 0 THEN 0
                        ELSE ROUND(SUM(CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END)
                            / SUM(CASE WHEN number_of_seats > 0 THEN number_of_seats END), 2)
                        END average_co2_kg_per_seat,
                        COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND number_of_seats > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_kg_per_seat,
                        CASE
                            WHEN SUM(number_of_seats) = 0 THEN 0
                            ELSE ROUND(SUM(co2_emissions_kg) / SUM(number_of_seats), 2)
                        END AS total_co2_kg_per_seat,

                    CASE
                        WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                        ELSE ROUND(((SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                            / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END)) * 1.60934 , 2) 
                        END AS average_co2_g_per_asm,
                        COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_asm,
                        CASE
                            WHEN COUNT(CASE WHEN co2_g_per_ask >= 0 THEN 1 ELSE NULL END) = 0 THEN 0
                            ELSE ROUND(SUM(co2_g_per_ask * 1.60934), 2)
                        END AS total_co2_g_per_asm,

                    CASE
                        WHEN COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) = 0 THEN 0
                        ELSE (SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(co2_emissions_kg AS NUMERIC) END) * 1000)
                            / SUM(CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN CAST(flight_distance_km AS NUMERIC) END) 
                        END average_co2_g_per_ask,
                        COUNT(DISTINCT CASE WHEN co2_emissions_kg > 0 AND flight_distance_km > 0 THEN aircraft_id END) AS number_of_aircraft_with_co2_g_per_ask,
                        ROUND(SUM(co2_g_per_ask), 2) AS total_co2_g_per_ask

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

                            FROM ""aircraft_latest"" AS aircraft
                            LEFT JOIN RI_portfolio_aircraft AS portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
                            JOIN ""aircraft_all_history_latest"" AS aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND aircraft_all_history.is_current = true
                            JOIN ""aircraft_status_history_latest"" AS aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.status_id IN (5, 6, 7)
                            JOIN ""aircraft_configurations_latest"" AS aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
                            JOIN RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED AS aircraft_utilization_by_month ON aircraft.aircraft_id = aircraft_utilization_by_month.aircraft_id
                            JOIN RI_aircraft AS ac ON ac.aircraft_id = aircraft.aircraft_id
                            WHERE
                                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                                AND (:operatorId IS NULL OR aircraft_utilization_by_month.operator_organization_id = :operatorId)
                                AND (:lessorId IS NULL OR aircraft_utilization_by_month.manager_organization_id = :lessorId)
                                AND {tableName}.{groupByIdColumn} IN (SELECT Number FROM filtered_ids)
                                QUALIFY ROW_NUMBER() OVER (PARTITION BY aircraft_utilization_by_month.aircraft_id,aircraft_utilization_by_month.year,aircraft_utilization_by_month.month
                                ORDER BY aircraft_utilization_by_month.aircraft_id) = 1)
                GROUP BY
                    {additionalGroupBy}{groupByNameColumn}, {groupByIdColumn},
                    data_year,
                    data_month) x";

        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }
}
