using System.Text.Json;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

namespace RiskAnalytics.Api.Repository;

public class UtilizationRepository : IUtilizationRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;
    private readonly IGetMonthlyUtilizationQueryBuilder getMonthlyUtilizationQueryBuilder;
    private readonly IGetGroupOptionsQueryBuilder getGroupOptionsQueryBuilder;
    private readonly IGetOperatorsQueryBuilder getOperatorsQueryBuilder;
    private readonly IGetLessorsQueryBuilder getLessorsQueryBuilder;
    private const double KmToMilesRate = 1.60934;

    public UtilizationRepository(
        ISnowflakeRepository snowflakeRepository,
        IGetMonthlyUtilizationQueryBuilder getMonthlyUtilizationQueryBuilder,
        IGetGroupOptionsQueryBuilder getGroupOptionsQueryBuilder,
        IGetOperatorsQueryBuilder getOperatorsQueryBuilder,
        IGetLessorsQueryBuilder getLessorsQueryBuilder)
    {
        this.snowflakeRepository = snowflakeRepository;
        this.getMonthlyUtilizationQueryBuilder = getMonthlyUtilizationQueryBuilder;
        this.getGroupOptionsQueryBuilder = getGroupOptionsQueryBuilder;
        this.getOperatorsQueryBuilder = getOperatorsQueryBuilder;
        this.getLessorsQueryBuilder = getLessorsQueryBuilder;
    }

    public async Task<IEnumerable<IEnumerable<MonthlyUtilization>>> GetMonthlyUtilization(
        int? portfolioId,
        MonthlyUtilizationGroup? groupBy,
        IEnumerable<int>? groupByFilterIds,
        int? operatorId,
        int? lessorId,
        bool includeEmissions,
        bool includeBaseline,
        bool isEmissions,
        bool isHoursAndCycle)
    {
        var parameters = new
        {
            portfolioId = portfolioId,
            groupByFilterIds = groupByFilterIds != null ? string.Join(",", groupByFilterIds) : null,
            //groupByFilterIds = groupByFilterIds,
            operatorId = operatorId,
            lessorId = lessorId
        };

        var query = getMonthlyUtilizationQueryBuilder.BuildQuery(groupBy, includeBaseline, includeEmissions, isEmissions, isHoursAndCycle, (!portfolioId.HasValue || portfolioId == 0));

        var monthlyUtilizations = await snowflakeRepository.Query<MonthlyUtilization>(query, parameters);
        return monthlyUtilizations.GroupBy(x => x.Group);
    }

    public async Task<IEnumerable<MSNUtilizationPerAircraft>> GetMonthlyUtilizationPerAircraft(
        int portfolioId,
        int endMonthIndex,
        int startMonthIndex,
        int endYear,
        int startYear,
        bool isEmissions,
        int? operatorId,
        int? lessorId,
        MonthlyUtilizationGroup? groupBy,
        IEnumerable<int>? groupByFilterIds)
    {
        int endMonthIndexValue = endMonthIndex < 12 ? endMonthIndex + 1 : 1;
        int endYearValue = endMonthIndex < 12 ? endYear : endYear + 1;

        var parameters = new
        {
            portfolioId,
            endMonthIndexValue,
            startMonthIndex,
            endYearValue,
            startYear,
            operatorId,
            lessorId,
            groupByFilterIds = groupByFilterIds != null ? string.Join(",", groupByFilterIds) : null,
        };

        var whereQuery = @$"
    WHERE aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
    AND (:operatorId IS NULL OR operator_organization_id = :operatorId)
    AND (:lessorId IS NULL OR manager_organization_id = :lessorId)";

        if (groupBy != null)
        {
            whereQuery += groupBy switch
            {
                MonthlyUtilizationGroup.MarketClass => " AND aircraft_market_class_id IN (SELECT Number FROM filtered_ids)",
                MonthlyUtilizationGroup.AircraftFamily => " AND aircraft_family_id IN (SELECT Number FROM filtered_ids)",
                MonthlyUtilizationGroup.AircraftType => " AND aircraft_type_id IN (SELECT Number FROM filtered_ids)",
                MonthlyUtilizationGroup.AircraftSeries => " AND aircraft_series_id IN (SELECT Number FROM filtered_ids)",
                MonthlyUtilizationGroup.AircraftSerialNumber => " AND aircraft_id IN (SELECT Number FROM filtered_ids)",
                _ => throw new ArgumentOutOfRangeException(nameof(groupBy))
            };
        }

        whereQuery += @"
    AND DATE_TRUNC('MONTH', TO_DATE(year || '-' || MONTH || '-01')) >= DATE_TRUNC('MONTH', DATE_FROM_PARTS(:startYear, :startMonthIndex, 1))
    AND DATE_TRUNC('MONTH', TO_DATE(year || '-' || MONTH || '-01')) < DATE_TRUNC('MONTH', DATE_FROM_PARTS(:endYearValue, :endMonthIndexValue, 1))";

        var query = new System.Text.StringBuilder(@"
    WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
    )
    SELECT subquery.AircraftId AS AircraftId,
    subquery.Registration AS Registration,
    subquery.Series AS Series,
    subquery.SerialNumber AS SerialNumber,
    ARRAY_AGG(CONCAT(subquery.Year, '_', subquery.Month)) AS YearMonth,");

        if (isEmissions)
        {
            query.Append(@$"
        ARRAY_AGG(subquery.CO2EmissionPerKg::integer) AS CO2EmissionPerKg,
        ARRAY_AGG(subquery.AverageCo2KgPerSeat::integer) AS AverageCo2KgPerSeat,
        ARRAY_AGG(subquery.AverageCo2GPerAsk) AS AverageCo2GPerAsk,
        ARRAY_AGG(subquery.AverageCo2GPerAsm) AS AverageCo2GPerAsm
        FROM (
            SELECT
            registration AS Registration,
            aircraft_series AS Series,
            aircraft_serial_number AS SerialNumber,
            co2_emissions_kg AS CO2EmissionPerKg,
            co2_kg_per_seat AS AverageCo2KgPerSeat,
            co2_g_per_ask AS AverageCo2GPerAsk,
            ROUND(co2_g_per_ask * 1.60934, 2) AS AverageCo2GPerAsm,
            aircraft_id AS AircraftId,
            year AS Year,
            month AS Month
            FROM {Constants.RiskAnalyticsTablePrefix}hybrid_aircraft_utilization_combined " + whereQuery + @"
            GROUP BY aircraft_id, aircraft_serial_number, aircraft_series, Registration, year, month, co2_emissions_kg, co2_kg_per_seat, co2_g_per_ask, AverageCo2GPerAsm
            ORDER BY aircraft_id DESC, year DESC, month DESC) AS subquery
        GROUP BY subquery.AircraftId, subquery.Registration, subquery.Series, subquery.SerialNumber");
        }
        else
        {
            query.Append(@$"
        ARRAY_AGG(subquery.TotalHours) AS TotalHours,
        ARRAY_AGG(subquery.TotalCycles::integer) AS TotalCycles,
        ARRAY_AGG(subquery.AverageHoursPerCycle) AS AverageHoursPerCycle
        FROM (
            SELECT
            registration AS Registration,
            aircraft_series AS Series,
            aircraft_serial_number AS SerialNumber,
            hours AS TotalHours,
            cycles AS TotalCycles,
            hours_per_cycle AS AverageHoursPerCycle,
            aircraft_id AS AircraftId,
            year AS Year,
            month AS Month
            FROM {Constants.RiskAnalyticsTablePrefix}hybrid_aircraft_utilization_combined " + whereQuery + @"
            GROUP BY aircraft_id, aircraft_serial_number, aircraft_series, registration, year, month, hours, cycles, hours_per_cycle
            ORDER BY aircraft_id DESC, year DESC, month DESC) AS subquery
        GROUP BY subquery.AircraftId, subquery.Registration, subquery.Series, subquery.SerialNumber");
        }

        var results = await snowflakeRepository.Query<dynamic>(query.ToString(), parameters);
        List<MSNUtilizationPerAircraft> resultsList = new List<MSNUtilizationPerAircraft>();
        foreach (var record in results)
        {
            resultsList.Add(ToMSNUtilizationPerAircraft(record));
        }
        return resultsList;
    }


    public async Task<IEnumerable<UtilizationGroupOption>> GetGroupOptions(int? operatorId, int? portfolioId, int? lessorId)
    {
        var parameters = new
        {
            portfolioId,
            operatorId,
            lessorId
        };

        var query = getGroupOptionsQueryBuilder.BuildQuery(portfolioId);

        query = query.Replace("@portfolioId", ":portfolioId")
                     .Replace("@operatorId", ":operatorId")
                     .Replace("@lessorId", ":lessorId");

        return await snowflakeRepository.Query<UtilizationGroupOption>(query, parameters);
    }

    public async Task<IEnumerable<IdNamePairModel>> GetOperators(int? portfolioId, int? lessorId, MonthlyUtilizationGroup? groupBy, IEnumerable<int>? groupByFilterIds)
    {
        var parameters = new
        {
            portfolioId = portfolioId,
            groupByFilterIds = groupByFilterIds != null ? string.Join(",", groupByFilterIds) : null,
            lessorId = lessorId
        };

        var query = getOperatorsQueryBuilder.BuildQuery(groupBy);

        query = query.Replace("@portfolioId", ":portfolioId")
                     .Replace("@groupByFilterIds", ":groupByFilterIds")
                     .Replace("@lessorId", ":lessorId");

        return await snowflakeRepository.Query<IdNamePairModel>(query, parameters);
    }

    public async Task<IEnumerable<IdNamePairModel>> GetLessors(int? portfolioId, int? operatorId, MonthlyUtilizationGroup? groupBy, IEnumerable<int>? groupByFilterIds)
    {
        var parameters = new
        {
            portfolioId = portfolioId,
            groupByFilterIds = groupByFilterIds != null ? string.Join(",", groupByFilterIds) : null,
            operatorId = operatorId
        };

        var query = getLessorsQueryBuilder.BuildQuery(groupBy);

        query = query.Replace("@portfolioId", ":portfolioId")
                     .Replace("@groupByFilterIds", ":groupByFilterIds")
                     .Replace("@operatorId", ":operatorId");

        return await snowflakeRepository.Query<IdNamePairModel>(query, parameters);
    }

    private MSNUtilizationPerAircraft ToMSNUtilizationPerAircraft(dynamic record)
    {
        return new MSNUtilizationPerAircraft
        {
            Registration = record.REGISTRATION,
            Series = record.SERIES,
            SerialNumber = record.SERIALNUMBER != null ? (string)record.SERIALNUMBER : null,
            AircraftId = record.AIRCRAFTID != null ? Convert.ToInt32(record.AIRCRAFTID) : 0,
            YearMonth = record.YEARMONTH != null ? JsonSerializer.Deserialize<string[]>((string)record.YEARMONTH) : null,
            TotalHours = record.TOTALHOURS != null ? JsonSerializer.Deserialize<decimal[]>((string)record.TOTALHOURS) : null,
            TotalCycles = record.TOTALCYCLES != null ? JsonSerializer.Deserialize<int[]>((string)record.TOTALCYCLES) : null,
            AverageHoursPerCycle = record.AVERAGEHOURSPERCYCLE != null ? JsonSerializer.Deserialize<decimal[]>((string)record.AVERAGEHOURSPERCYCLE) : null,
            CO2EmissionPerKg = record.CO2EMISSIONPERKG != null ? JsonSerializer.Deserialize<int[]>((string)record.CO2EMISSIONPERKG) : null,
            AverageCo2KgPerSeat = record.AVERAGECO2KGPERSEAT != null ? JsonSerializer.Deserialize<int[]>((string)record.AVERAGECO2KGPERSEAT) : null,
            AverageCo2GPerAsk = record.AVERAGECO2GPERASK != null ? JsonSerializer.Deserialize<decimal[]>((string)record.AVERAGECO2GPERASK) : null,
            AverageCo2GPerAsm = record.AVERAGECO2GPERASM != null ? JsonSerializer.Deserialize<decimal[]>((string)record.AVERAGECO2GPERASM) : null
        };
    }

}
