using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Mappers.Dependencies;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;
using System.Text;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Repository.Portfolios;

public class PortfolioAircraftRepository : IPortfolioAircraftRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;
    private readonly IAircraftsMapper aircraftsMapper;

    public PortfolioAircraftRepository(
        ISnowflakeRepository snowflakeRepository,
        IAircraftsMapper aircraftsMapper)
    {
        this.snowflakeRepository = snowflakeRepository;
        this.aircraftsMapper = aircraftsMapper;
    }

    public async Task Insert(int portfolioId, IEnumerable<Aircraft> portfolioAircraft)
    {
        var queryBuilder = new StringBuilder();
        queryBuilder.Append($"INSERT INTO {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft(portfolio_id, aircraft_id) VALUES");

        foreach (var aircraft in portfolioAircraft)
        {
            queryBuilder.Append($"({portfolioId},{aircraft.AircraftId}),");
        }

        var sqlQuery = queryBuilder.ToString();
        sqlQuery = sqlQuery.Remove(sqlQuery.Length - 1);

        await snowflakeRepository.ExecuteScalar<int>(sqlQuery);
    }

    public async Task DeleteAll(int portfolioId)
    {
        var parameters = new { portfolioId };

        var sqlQuery = $"DELETE FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id=:portfolioId";
        await snowflakeRepository.Execute(sqlQuery, parameters);
    }

    public async Task<IEnumerable<Aircraft>> GetAll(int portfolioId)
    {
        var parameters = new { portfolioId };

        var sql =
            @$"SELECT
                    aircraft.aircraft_id,
                    aircraft.aircraft_age_years,
                    aircraft.aircraft_serial_number,
                    aircraft_usage_history.aircraft_usage,
                    aircraft_all_history.aircraft_history_id,
                    aircraft_all_history.aircraft_registration_number,
                    aircraft_all_history.manager,
                    aircraft_all_history.manager_organization_id,
                    aircraft_all_history.operator,
                    aircraft_all_history.operator_organization_id,
                    aircraft_all_history.owner,
                    aircraft_all_history.owner_organization_id,
                    operator.country,
                    operator.country_id,
                    company.organization_sub_type as company_type,
                    company.organization_sub_type_id as company_type_id,
                    lessor.organization as lessor_organization,
                    lessor.organization_id as lessor_organization_id,
                    aircraft_all_history.is_current,
                    aircraft_status_history.status,
                    (SELECT MIN(status_start_date) FROM ""aircraft_status_history_latest"" WHERE aircraft_id = aircraft.aircraft_id AND status_id = {(int)AircraftStatus.InService}) status_start_date,
                    aircraft_configurations.aircraft_series,
                    aircraft_configurations.aircraft_series_id,
                    aircraft_configurations.aircraft_type,
                    aircraft_configurations.aircraft_type_id,
                    aircraft_configurations.aircraft_family,
                    aircraft_configurations.aircraft_family_id,
                    aircraft_configurations.engine_series,
                    aircraft_configurations.aircraft_market_class_id,
                    aircraft_configurations.aircraft_market_class,
                    aircraft_configurations.aircraft_manufacturer,
                    aircraft_configurations.aircraft_manufacturer_organization_id,
                    aircraft_configurations.aircraft_master_series,
                    aircraft_configurations.aircraft_master_series_id,
                    aircraft_reported_utilization.aircraft_id,
                    aircraft_reported_utilization.utilized_hours hours,
                    aircraft_reported_utilization.utilized_cycles cycles,
                    aircraft_reported_utilization.reported_date,
                    aircraft_reported_utilization.is_current
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft as portfolio_aircraft
                JOIN ""aircraft_all_history_latest"" as aircraft_all_history  ON portfolio_aircraft.aircraft_id = aircraft_all_history.aircraft_id
                LEFT JOIN ""organizations_latest"" operator ON operator.organization_id = aircraft_all_history.operator_organization_id
                JOIN ""aircraft_latest"" as aircraft ON portfolio_aircraft.aircraft_id = aircraft.aircraft_id
                JOIN ""aircraft_configurations_latest"" as aircraft_configurations  ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
                JOIN ""aircraft_status_history_latest"" as aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.is_current = true
                LEFT JOIN ""aircraft_usage_history_latest"" as aircraft_usage_history ON aircraft_usage_history.aircraft_id = portfolio_aircraft.aircraft_id AND aircraft_usage_history.is_current = true
                LEFT JOIN ""organizations_latest"" as lessor ON lessor.organization_id = aircraft_all_history.manager_organization_id AND lessor.organization_sub_type_id={(int)OrganizationSubType.OperatingLessor}
                LEFT JOIN ""organizations_latest"" as company ON company.organization_id = aircraft_all_history.owner_organization_id AND company.organization_sub_type_id IN ({(int)OrganizationSubType.AssetBackedSecurities},{(int)OrganizationSubType.EETC})
                LEFT JOIN {Constants.DataPlatformTablePrefix}aircraft_reported_utilization as aircraft_reported_utilization  ON portfolio_aircraft.aircraft_id = aircraft_reported_utilization.aircraft_id AND aircraft_reported_utilization.is_current = true
                WHERE portfolio_id = :portfolioId
                ORDER BY date_created";

        var existingAircrafts = new Dictionary<int, Aircraft>();

        return (await snowflakeRepository.Query(
            sql,
            new Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, AircraftReportedUtilization, Aircraft>(
                (aircraft, aircraftHistory, aircraftStatusHistory, aircraftConfiguration, aircraftReportedUtilization)
                    => aircraftsMapper.Map(existingAircrafts, aircraft,
                        new AircraftHistoryDependencies(aircraftHistory, aircraftStatusHistory, aircraftConfiguration),
                        aircraftReportedUtilization
                    )),
            "aircraft_id, aircraft_history_id, status, aircraft_series, aircraft_id",
            parameters
        )).Distinct();
    }
}
