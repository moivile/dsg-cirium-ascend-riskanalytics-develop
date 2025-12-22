using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository;

public class AssetWatchFiltersRepository : IAssetWatchFiltersRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;
    public AssetWatchFiltersRepository(ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public async Task<IEnumerable<CountriesRegionsModel>> GetCountriesAndRegions()
    {
        var sql = $@"
            SELECT
                c.country_code_iata AS Id,
                c.name AS name,
                r.region_code AS RegionCode
            FROM {Constants.RiskAnalyticsTablePrefix}countries AS c
            JOIN {Constants.RiskAnalyticsTablePrefix}regions AS r ON c.region_code = r.region_code
            ORDER BY c.name";

        return await snowflakeRepository.Query<CountriesRegionsModel>(sql);
    }

    public async Task<IEnumerable<StringIdNamePairModel>> GetRegions()
    {
        var sql =
            @$"SELECT region_code AS Id,
                name
                FROM {Constants.RiskAnalyticsTablePrefix}regions
                ORDER BY name";
        return await snowflakeRepository.Query<StringIdNamePairModel>(sql);
    }
    public async Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterOperators(int portfolioId)
    {
        var parameters = new { portfolioId };
        var sql =
            @$"SELECT DISTINCT aah.operator AS Name,
                aah.operator_organization_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah ON pa.aircraft_id = aah.aircraft_id
                WHERE aah.operator IS NOT NULL
                AND portfolio_id =:portfolioId
                ORDER BY Name";
        return await snowflakeRepository.Query<IdNamePairModel>(sql, parameters);

    }

    public async Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterLessors(int portfolioId)
    {
        var parameters = new { portfolioId };
        var sql =
            @$"SELECT DISTINCT lessor.organization AS Name,
                lessor.organization_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah on pa.aircraft_id = aah.aircraft_id
                LEFT JOIN ""organizations_latest"" AS lessor on lessor.organization_id = aah.manager_organization_id
                AND lessor.organization_sub_type_id = {(int)OrganizationSubType.OperatingLessor}
                WHERE lessor.organization IS NOT NULL
                AND portfolio_id =:portfolioId
                ORDER BY Name";
        return await snowflakeRepository.Query<IdNamePairModel>(sql, parameters);

    }

    public async Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterAircraftSeries(int portfolioId)
    {
        var parameters = new { portfolioId };
        var sql =
            @$"SELECT DISTINCT ac.aircraft_series AS Name,
                ac.aircraft_series_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah on pa.aircraft_id = aah.aircraft_id
                JOIN ""aircraft_configurations_latest"" AS ac on aah.aircraft_configuration_id = ac.aircraft_configuration_id
                WHERE ac.aircraft_series IS NOT NULL
                AND portfolio_id =:portfolioId
                ORDER BY Name";
        return await snowflakeRepository.Query<IdNamePairModel>(sql, parameters);

    }
    public async Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterEngineSeries(int portfolioId)
    {
        var parameters = new { portfolioId };

        var sql =
            @$"SELECT DISTINCT es.name AS Name,
                es.engine_series_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah on pa.aircraft_id = aah.aircraft_id
                JOIN ""aircraft_configurations_latest"" AS ac on aah.aircraft_configuration_id = ac.aircraft_configuration_id
                JOIN {Constants.RiskAnalyticsTablePrefix}engine_series AS es on es.name = ac.engine_series
                WHERE portfolio_id =:portfolioId
                ORDER BY Name";
        return await snowflakeRepository.Query<IdNamePairModel>(sql, parameters);
    }

    public async Task<IEnumerable<StringIdNamePairModel>> GetAssetWatchFilterCities(List<string> countryCodes)
    {
        if (countryCodes == null || countryCodes.Count == 0)
        {
            throw new ArgumentException("Country codes cannot be null or empty.");
        }

        var sql = @$"SELECT name AS Id,
                            name
                    FROM {Constants.RiskAnalyticsTablePrefix}cities
                    WHERE country_code_iata IN ({string.Join(",", countryCodes.Select((_, index) => $":countryCode{index}"))})
                    ORDER BY name";

        var parameters = countryCodes
            .Select((code, index) => new KeyValuePair<string, object>($"countryCode{index}", code))
            .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

        return await snowflakeRepository.Query<StringIdNamePairModel>(sql, parameters);
    }



    public async Task<IEnumerable<StringIdNamePairModel>> GetAssetWatchFilterAirports(List<string> countryCodes)
    {
        if (countryCodes == null || countryCodes.Count == 0)
        {
            throw new ArgumentException("Country codes cannot be null or empty.");
        }

        var sql = @$"SELECT airport_fs_internal AS Id,
                            CONCAT(' (', airport_fs_internal, ') ', name ) AS name
                    FROM {Constants.RiskAnalyticsTablePrefix}airports
                    WHERE country_code_iata IN ({string.Join(",", countryCodes.Select((_, index) => $":countryCode{index}"))})
                    ORDER BY name";

        var parameters = countryCodes
            .Select((code, index) => new KeyValuePair<string, object>($"countryCode{index}", code.Replace("'", "''")))
            .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

        return await snowflakeRepository.Query<StringIdNamePairModel>(sql, parameters);
    }


    public async Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterAircraftSerialNumbers(int portfolioId)
    {
        var parameters = new { portfolioId  = portfolioId };
        var sql =
            @$"SELECT DISTINCT CONCAT(a.aircraft_serial_number, ' (', ac.aircraft_master_series, ')') AS Name,
                a.aircraft_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_latest"" AS a on a.aircraft_id = pa.aircraft_id
                JOIN ""aircraft_all_history_latest"" aah on pa.aircraft_id = aah.aircraft_id
                JOIN ""aircraft_configurations_latest"" AS ac ON aah.aircraft_configuration_id = ac.aircraft_configuration_id
                WHERE ac.aircraft_master_series IS NOT NULL
                AND portfolio_id = :portfolioId
                ORDER BY Name";

        return await snowflakeRepository.Query<IdNamePairModel>(sql, parameters);
    }
}
