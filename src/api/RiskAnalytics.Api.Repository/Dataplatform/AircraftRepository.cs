using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Mappers.Dependencies;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using System.Text;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.Dataplatform;

public class AircraftRepository : Interfaces.IAircraftRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;
    private readonly IAircraftsMapper aircraftsMapper;

    public AircraftRepository(
    ISnowflakeRepository snowflakeRepository, IAircraftsMapper aircraftsMapper)
    {
        this.snowflakeRepository = snowflakeRepository;
        this.aircraftsMapper = aircraftsMapper;
    }

    private static string BuildAircraftSearchWhereQuery(
        string? keyword,
        List<int>? manufacturerIds,
        List<int>? aircraftTypeIds,
        List<int>? aircraftMasterSeriesIds,
        List<int>? aircraftOperatorIds,
        List<int>? operatorCountryIds,
        List<int>? lessorIds,
        List<int>? companyTypeIds,
        List<int>? statusIds)
    {
        if (string.IsNullOrEmpty(keyword)
            && (manufacturerIds is null || !manufacturerIds.Any())
            && (aircraftTypeIds is null || !aircraftTypeIds.Any())
            && (aircraftMasterSeriesIds is null || !aircraftMasterSeriesIds.Any())
            && (aircraftOperatorIds is null || !aircraftOperatorIds.Any())
            && (operatorCountryIds is null || !operatorCountryIds.Any())
            && (lessorIds is null || !lessorIds.Any())
            && (companyTypeIds is null || !companyTypeIds.Any())
            && (statusIds is null || !statusIds.Any())
            )
        {
            return string.Empty;
        }

        var whereQuery = new StringBuilder();

        if (!string.IsNullOrEmpty(keyword))
        {
            whereQuery.Append($"({Constants.RiskAnalyticsTablePrefix}aircraft.keywords LIKE :Keyword) AND ");
        }

        if (manufacturerIds?.Count > 0)
        {
            whereQuery.Append($" aircraft_manufacturer_organization_id in ({string.Join(",", manufacturerIds)}) AND ");
        }

        if (aircraftTypeIds?.Count > 0)
        {
            whereQuery.Append($" aircraft_configurations.aircraft_type_id in ({string.Join(",", aircraftTypeIds)}) AND ");
        }

        if (aircraftMasterSeriesIds?.Count > 0)
        {
            whereQuery.Append($" aircraft_configurations.aircraft_master_series_id in ({string.Join(",", aircraftMasterSeriesIds)}) AND ");
        }

        if (aircraftOperatorIds?.Count > 0)
        {
            whereQuery.Append($" operator_organization_id in ({string.Join(",", aircraftOperatorIds)}) AND ");
        }

        if (operatorCountryIds?.Count > 0)
        {
            whereQuery.Append($" operator_country_id in ({string.Join(",", operatorCountryIds)}) AND ");
        }

        if (lessorIds?.Count > 0)
        {
            whereQuery.Append($" lessor.organization_id in ({string.Join(",", lessorIds)}) AND ");
        }

        if (companyTypeIds?.Count > 0)
        {
            whereQuery.Append($" company.organization_sub_type_id IN ({string.Join(",", companyTypeIds)}) AND ");
        }

        if (statusIds?.Count > 0)
        {
            whereQuery.Append($" aircraft_status_history.status_id in ({string.Join(",", statusIds)}) AND ");
        }

        var query = whereQuery.ToString();

        if (query.EndsWith("OR "))
        {
            query = query.Remove(query.Length - 3, 3);
        }
        else
        {
            query = query.Remove(query.Length - 4, 4);
        }

        return $"WHERE {query}";
    }

    public async Task<IEnumerable<Aircraft>> Search(SearchAircraftParameters searchAircraftRequest)
    {
        if (!string.IsNullOrEmpty(searchAircraftRequest.Keyword))
        {
            searchAircraftRequest.Keyword = "%" + searchAircraftRequest.Keyword.ToLowerInvariant() + "%";
        }

        var parameters = new
        {
            searchAircraftRequest.Keyword
        };

        var whereQuery = BuildAircraftSearchWhereQuery(
            searchAircraftRequest.Keyword,
            searchAircraftRequest.ManufacturerIds,
            searchAircraftRequest.AircraftTypeIds,
            searchAircraftRequest.AircraftMasterSeriesIds,
            searchAircraftRequest.AircraftOperatorIds,
            searchAircraftRequest.OperatorCountryIds,
            searchAircraftRequest.LessorIds,
            searchAircraftRequest.CompanyTypeIds,
            searchAircraftRequest.StatusIds);

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
                            operator.country AS Operator_Country,
                            operator.country_id AS Operator_Country_Id,
                            company.organization_sub_type AS company_type,
                            company.organization_sub_type_id AS company_type_id,
                            lessor.organization AS lessor_organization,
                            lessor.organization_id AS lessor_organization_id,
                            aircraft_all_history.is_current,
                            REPLACE(aircraft_status_history.status, 'Letter of Intent', 'LOI' ) as status,
                            aircraft_status_history.status_id,
                            (SELECT MIN(status_start_date) FROM ""aircraft_status_history_latest"" WHERE aircraft_id = aircraft.aircraft_id AND status_id = {(int)AircraftStatus.InService}) status_start_date,
                            aircraft_configurations.aircraft_series,
                            aircraft_configurations.aircraft_series_id,
                            aircraft_configurations.aircraft_market_class_id,
                            aircraft_configurations.aircraft_market_class,
                            aircraft_configurations.aircraft_manufacturer,
                            aircraft_configurations.aircraft_manufacturer_organization_id,
                            aircraft_configurations.aircraft_type,
                            aircraft_configurations.aircraft_type_id,
                            aircraft_configurations.aircraft_family,
                            aircraft_configurations.aircraft_family_id,
                            aircraft_configurations.aircraft_master_series,
                            aircraft_configurations.aircraft_master_series_id,
                            aircraft_configurations.engine_series
                        FROM ""aircraft_latest"" AS aircraft
                        JOIN ""aircraft_all_history_latest"" as aircraft_all_history ON aircraft_all_history.aircraft_id = aircraft.aircraft_id
                        LEFT JOIN ""organizations_latest"" operator ON aircraft_all_history.operator_organization_id = operator.organization_id                        
                        JOIN ""aircraft_configurations_latest"" as aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
                        JOIN ""aircraft_status_history_latest"" as aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.is_current = true
                        LEFT JOIN ""aircraft_usage_history_latest"" as aircraft_usage_history ON aircraft_usage_history.aircraft_id = aircraft.aircraft_id AND aircraft_usage_history.is_current = true
                        JOIN {Constants.RiskAnalyticsTablePrefix}aircraft AS {Constants.RiskAnalyticsTablePrefix}aircraft ON {Constants.RiskAnalyticsTablePrefix}aircraft.aircraft_id = aircraft.aircraft_id
                        LEFT JOIN ""organizations_latest"" as lessor ON lessor.organization_id = aircraft_all_history.manager_organization_id AND lessor.organization_sub_type_id={(int)OrganizationSubType.OperatingLessor}
                        LEFT JOIN ""organizations_latest"" as company ON company.organization_id = aircraft_all_history.owner_organization_id AND company.organization_sub_type_id IN ({(int)OrganizationSubType.AssetBackedSecurities},{(int)OrganizationSubType.EETC})
                        {whereQuery} ORDER BY aircraft_id LIMIT {searchAircraftRequest.Take} OFFSET {searchAircraftRequest.Skip}";

        var existingAircrafts = new Dictionary<int, Aircraft>();

        return await snowflakeRepository.Query(
            sql,
            new Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>(
                (aircraft, aircraftHistory, aircraftStatusHistory, aircraftConfiguration)
                    => aircraftsMapper.Map
                    (existingAircrafts, aircraft,
                    new AircraftHistoryDependencies(aircraftHistory, aircraftStatusHistory, aircraftConfiguration)
                    )
            ),
            "aircraft_id, aircraft_history_id, status, aircraft_series",
            parameters
        );
    }

    public async Task<IEnumerable<AircraftSearchFilterOption>> GetSearchFilterOptions(SearchAircraftParameters searchParams)
    {
        var whereClauses = new List<string>();

        if (!string.IsNullOrWhiteSpace(searchParams.Keyword))
        {
            whereClauses.Add("(keywords LIKE :Keyword)");
        }

        AddArrayParameter(whereClauses, searchParams.ManufacturerIds, "aircraft_manufacturer_organization_id", "MANUFACTURER_IDS");
        AddArrayParameter(whereClauses, searchParams.AircraftTypeIds, "aircraft_type_id", "AIRCRAFT_TYPE_IDS");
        AddArrayParameter(whereClauses, searchParams.AircraftMasterSeriesIds, "aircraft_master_series_id", "AIRCRAFT_MASTER_SERIES_IDS");
        AddArrayParameter(whereClauses, searchParams.AircraftOperatorIds, "operator_organization_id", "AIRCRAFT_OPERATOR_IDS");
        AddArrayParameter(whereClauses, searchParams.OperatorCountryIds, "operator_country_id", "AIRCRAFT_OPERATOR_COUNTRY_IDS");
        AddArrayParameter(whereClauses, searchParams.LessorIds, "lessor_organization_id", "LESSOR_IDS");
        AddArrayParameter(whereClauses, searchParams.CompanyTypeIds, "company_type_id", "COMPANY_TYPE_IDS");
        AddArrayParameter(whereClauses, searchParams.StatusIds, "status_id", "STATUS_IDS");

        string whereClause = whereClauses.Count > 0 ? ("WHERE " + string.Join(" AND ", whereClauses)) : "";

        string sql = $@"
                    WITH FilteredResults AS (
                        SELECT *
                        FROM {Constants.RiskAnalyticsTablePrefix}AIRCRAFT_SEARCH_FILTERS
                        {whereClause}
                    )
                    SELECT
                        id, name, type
                    FROM (
                        SELECT DISTINCT
                            aircraft_manufacturer_organization_id AS id,
                            aircraft_manufacturer AS name,
                            'aircraft_manufacturer' AS type
                        FROM FilteredResults
                        WHERE aircraft_manufacturer_organization_id IS NOT NULL

                        UNION ALL

                        SELECT DISTINCT
                            aircraft_type_id AS id,
                            aircraft_type AS name,
                            'aircraft_type' AS type
                        FROM FilteredResults
                        WHERE aircraft_type_id IS NOT NULL

                        UNION ALL

                        SELECT DISTINCT
                            aircraft_master_series_id AS id,
                            aircraft_master_series AS name,
                            'aircraft_master_series' AS type
                        FROM FilteredResults
                        WHERE aircraft_master_series_id IS NOT NULL

                        UNION ALL

                        SELECT DISTINCT
                            operator_organization_id AS id,
                            operator AS name,
                            'operator' AS type
                        FROM FilteredResults
                        WHERE operator_organization_id IS NOT NULL

                        UNION ALL

                        SELECT DISTINCT
                            operator_country_id AS id,
                            operator_country AS name,
                            'operator_country' AS type
                        FROM FilteredResults
                        WHERE operator_country_id IS NOT NULL

                        UNION ALL

                        SELECT DISTINCT
                            lessor_organization_id AS id,
                            lessor_organization AS name,
                            'lessor' AS type
                        FROM FilteredResults
                        WHERE lessor_organization_id IS NOT NULL

                        UNION ALL

                        SELECT DISTINCT
                            company_type_id AS id,
                            company_type AS name,
                            'company_type' AS type
                        FROM FilteredResults
                        WHERE company_type_id IS NOT NULL

                        UNION ALL

                        SELECT DISTINCT
                            status_id AS id,
                            status AS name,
                            'status' AS type
                        FROM FilteredResults
                        WHERE status_id IS NOT NULL
                    )
                    ORDER BY type, name
                ";

        var parameters = new
        {
            Keyword = searchParams.Keyword,
            MANUFACTURER_IDS = ConvertArrayToJson(searchParams.ManufacturerIds),
            AIRCRAFT_TYPE_IDS = ConvertArrayToJson(searchParams.AircraftTypeIds),
            AIRCRAFT_MASTER_SERIES_IDS = ConvertArrayToJson(searchParams.AircraftMasterSeriesIds),
            AIRCRAFT_OPERATOR_IDS = ConvertArrayToJson(searchParams.AircraftOperatorIds),
            AIRCRAFT_OPERATOR_COUNTRY_IDS = ConvertArrayToJson(searchParams.OperatorCountryIds),
            LESSOR_IDS = ConvertArrayToJson(searchParams.LessorIds),
            COMPANY_TYPE_IDS = ConvertArrayToJson(searchParams.CompanyTypeIds),
            STATUS_IDS = ConvertArrayToJson(searchParams.StatusIds)
        };

        var searchResults = await snowflakeRepository.Query<AircraftSearchFilterOption>(sql, parameters);

        return searchResults;
    }

    private string ConvertArrayToJson(IEnumerable<int> values)
    {
        return values != null && values.Any() ? Newtonsoft.Json.JsonConvert.SerializeObject(values) : null;
    }

    private void AddArrayParameter(List<string> sqlParts, IEnumerable<int> values, string columnName, string parameterName)
    {
        if (values != null && values.Any())
        {
            sqlParts.Add($"ARRAY_CONTAINS({columnName}, PARSE_JSON(:{parameterName}))");
        }
    }

}
