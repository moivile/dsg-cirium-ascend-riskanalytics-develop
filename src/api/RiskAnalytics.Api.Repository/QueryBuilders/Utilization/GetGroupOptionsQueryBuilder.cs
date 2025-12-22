using System.Text;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization;

public class GetGroupOptionsQueryBuilder : IGetGroupOptionsQueryBuilder
{
    public string BuildQuery(int? portfolioId)
    {
        var queryBuilder = new StringBuilder();

        queryBuilder.AppendLine(@$"
            WITH aircraft AS
            (
                SELECT DISTINCT
                    aircraft.aircraft_id,
                    aircraft.aircraft_serial_number || ' ('  || aircraft_configurations.aircraft_type || ')' AS aircraft_serial_number,
                    aircraft_configurations.aircraft_market_class,
                    aircraft_configurations.aircraft_market_class_id,
                    aircraft_configurations.aircraft_family,
                    aircraft_configurations.aircraft_family_id,
                    aircraft_configurations.aircraft_type,
                    aircraft_configurations.aircraft_type_id,
                    aircraft_configurations.aircraft_series,
                    aircraft_configurations.aircraft_series_id
                FROM ""aircraft_latest"" as aircraft
                LEFT JOIN {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft as portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
                JOIN ""aircraft_all_history_latest"" as aircraft_all_history ON aircraft_all_history.aircraft_id = aircraft.aircraft_id
                JOIN ""aircraft_configurations_latest"" as aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
                WHERE
                    (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                    AND (:portfolioId IS NOT NULL OR aircraft_configurations.aircraft_market_sector_id = {(int)AircraftMarketSector.Commercial})
                    AND (:operatorId IS NULL OR aircraft_all_history.operator_organization_id = :operatorId)
                    AND (:lessorId IS NULL OR aircraft_all_history.manager_organization_id = :lessorId)
            )

            SELECT DISTINCT aircraft_market_class_id AS id, aircraft_market_class AS name, '{MonthlyUtilizationGroup.MarketClass}'::VARCHAR as type
            FROM aircraft

            UNION
            SELECT DISTINCT aircraft_family_id, aircraft_family, '{MonthlyUtilizationGroup.AircraftFamily}'
            FROM aircraft

            UNION
            SELECT DISTINCT aircraft_type_id, aircraft_type, '{MonthlyUtilizationGroup.AircraftType}'
            FROM aircraft

            UNION
            SELECT DISTINCT aircraft_series_id, aircraft_series, '{MonthlyUtilizationGroup.AircraftSeries}'
            FROM aircraft");

        if (portfolioId != null)
        {
            queryBuilder.AppendLine(@$"
            UNION
            SELECT DISTINCT aircraft_id, aircraft_serial_number, '{MonthlyUtilizationGroup.AircraftSerialNumber}'
            FROM aircraft");
        }

        queryBuilder.AppendLine(@"ORDER BY type, name;");

        return queryBuilder.ToString();
    }
}
