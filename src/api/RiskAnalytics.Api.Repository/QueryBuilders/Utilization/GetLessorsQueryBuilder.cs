using System.Text;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

namespace RiskAnalytics.Api.Repository.QueryBuilders.Utilization;

public class GetLessorsQueryBuilder : IGetLessorsQueryBuilder
{
    public string BuildQuery(MonthlyUtilizationGroup? groupBy)
    {
        var queryBuilder = new StringBuilder();

        queryBuilder.AppendLine(@$"
            WITH filtered_ids AS ( 
            SELECT TO_NUMBER(VALUE)::INTEGER AS Number 
            FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
            )
            SELECT DISTINCT
                aircraft_all_history.manager_organization_id id,
                aircraft_all_history.manager name
            FROM ""aircraft_latest"" as aircraft
            LEFT JOIN {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft as portfolio_aircraft ON aircraft.aircraft_id = portfolio_aircraft.aircraft_id AND portfolio_aircraft.portfolio_id = :portfolioId
            JOIN ""aircraft_all_history_latest"" as aircraft_all_history ON aircraft.aircraft_id = aircraft_all_history.aircraft_id AND is_current = true
            JOIN ""aircraft_configurations_latest"" as aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
            JOIN ""organizations_latest"" as organizations ON aircraft_all_history.manager_organization_id = organizations.organization_id
            WHERE
                (:portfolioId IS NULL OR portfolio_aircraft.portfolio_id = :portfolioId)
                AND
                (
                    :portfolioId IS NOT NULL
                    OR
                    (
                        aircraft_configurations.aircraft_market_sector_id = {(int)AircraftMarketSector.Commercial}
                        AND organizations.organization_sub_type_id = {(int)OrganizationSubType.OperatingLessor}
                    )
                )");

        if (groupBy != null)
        {
            var groupByIdColumn = groupBy switch
            {
                MonthlyUtilizationGroup.MarketClass => "aircraft_configurations.aircraft_market_class_id",
                MonthlyUtilizationGroup.AircraftFamily => "aircraft_configurations.aircraft_family_id",
                MonthlyUtilizationGroup.AircraftType => "aircraft_configurations.aircraft_type_id",
                MonthlyUtilizationGroup.AircraftSeries => "aircraft_configurations.aircraft_series_id",
                MonthlyUtilizationGroup.AircraftSerialNumber => "aircraft.aircraft_id",
                _ => throw new ArgumentOutOfRangeException(nameof(groupBy))
            };

            queryBuilder.AppendLine($"AND {groupByIdColumn} IN(SELECT Number FROM filtered_ids)");
            
        }
        
        queryBuilder.AppendLine($"AND (:operatorId IS NULL OR aircraft_all_history.operator_organization_id = :operatorId)");
        queryBuilder.AppendLine("ORDER BY aircraft_all_history.manager");

        return queryBuilder.ToString();
    }
}
