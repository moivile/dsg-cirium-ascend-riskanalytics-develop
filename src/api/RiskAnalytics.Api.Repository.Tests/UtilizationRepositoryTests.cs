
using Newtonsoft.Json;
using NSubstitute;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests;

public class UtilizationRepositoryTests
{
    private readonly ISnowflakeRepository snowflakeRepositoryMock;
    private readonly IGetMonthlyUtilizationQueryBuilder getMonthlyUtilizationQueryBuilderMock;
    private readonly IGetGroupOptionsQueryBuilder getGroupOptionsQueryBuilderMock;
    private readonly IGetOperatorsQueryBuilder getOperatorsQueryBuilderMock;
    public readonly IGetLessorsQueryBuilder getLessorsQueryBuilderMock;

    private readonly UtilizationRepository utilizationRepository;

    public UtilizationRepositoryTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        getMonthlyUtilizationQueryBuilderMock = Substitute.For<IGetMonthlyUtilizationQueryBuilder>();
        getGroupOptionsQueryBuilderMock = Substitute.For<IGetGroupOptionsQueryBuilder>();
        getOperatorsQueryBuilderMock = Substitute.For<IGetOperatorsQueryBuilder>();
        getLessorsQueryBuilderMock = Substitute.For<IGetLessorsQueryBuilder>();

        utilizationRepository = new UtilizationRepository(
            snowflakeRepositoryMock,
            getMonthlyUtilizationQueryBuilderMock,
            getGroupOptionsQueryBuilderMock,
            getOperatorsQueryBuilderMock,
            getLessorsQueryBuilderMock
        );
    }

    [Fact]
    public async Task GetMonthlyUtilization_BuildsAndExecutesQuery()
    {
        // arrange
        const int portfolioId = 1;
        const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
        var groupByFilterIds = new[] { 1, 2, 3 };
        string groupByFilterIdsList = string.Join(",", groupByFilterIds);
        const int operatorId = 2;
        const int lessorId = 1;
        const bool includeEmissions = true;
        const bool includeBaseline = true;
        const bool isEmissions = true;
        const bool isHoursAndCycle = true;
        const string sqlQuery = "an sql query";

        getMonthlyUtilizationQueryBuilderMock
            .BuildQuery(groupBy, includeBaseline, includeEmissions, isEmissions, isHoursAndCycle).Returns(sqlQuery);

        // act
        await utilizationRepository.GetMonthlyUtilization(
            portfolioId,
            groupBy,
            groupByFilterIds,
            operatorId,
            lessorId,
            includeEmissions,
            includeBaseline,
            isEmissions,
            isHoursAndCycle
        );

        // assert
        getMonthlyUtilizationQueryBuilderMock.Received()
            .BuildQuery(groupBy, includeBaseline, includeEmissions, isEmissions, isHoursAndCycle);

        var expectedParameters = new
        {
            portfolioId,
            groupByFilterIds = groupByFilterIdsList,
            operatorId,
            lessorId
        };

        await snowflakeRepositoryMock.Received().Query<MonthlyUtilization>(
            sqlQuery,
            Arg.Is<object?>(y => JsonConvert.SerializeObject(y) == JsonConvert.SerializeObject(expectedParameters))
        );
    }

    [Theory]
    [InlineData(1, 3, 2, 2024, 2023, true, 1, 1, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, false, 1, 1, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, true, 1, 1, null, null)]
    [InlineData(1, 3, 2, 2024, 2023, true, 1, 1, MonthlyUtilizationGroup.AircraftFamily, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, true, 1, 1, MonthlyUtilizationGroup.AircraftType, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, false, null, 1, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 })]
    [InlineData(1, 3, 2, 2024, 2023, false, 1, null, MonthlyUtilizationGroup.MarketClass, new[] { 1, 2, 3 })]
    public async Task GetMonthlyUtilizationPerAircraft_BuildsAndExecutesQuery(
        int portfolioId,
        int endMonthIndex,
        int startMonthIndex,
        int endYear,
        int startYear,
        bool isEmissions,
        int? operatorId,
        int? lessorId,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds)
    {
        var whereQuery = @$"
    WHERE aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
    AND (:operatorId IS NULL OR operator_organization_id = :operatorId)
    AND (:lessorId IS NULL OR manager_organization_id = :lessorId)";
        if (groupBy != null)
        {
            whereQuery += groupBy switch
            {
                MonthlyUtilizationGroup.MarketClass =>
                    " AND aircraft_market_class_id IN (SELECT Number FROM filtered_ids)",

                MonthlyUtilizationGroup.AircraftFamily =>
                    " AND aircraft_family_id IN (SELECT Number FROM filtered_ids)",

                MonthlyUtilizationGroup.AircraftType =>
                    " AND aircraft_type_id IN (SELECT Number FROM filtered_ids)",

                MonthlyUtilizationGroup.AircraftSeries =>
                    " AND aircraft_series_id IN (SELECT Number FROM filtered_ids)",

                MonthlyUtilizationGroup.AircraftSerialNumber =>
                    " AND aircraft_id IN (SELECT Number FROM filtered_ids)",

                _ => throw new ArgumentOutOfRangeException(nameof(groupBy))
            };
        }

        whereQuery +=
            $@" AND DATE_TRUNC('month', TO_DATE(year || '-' || month || '-01')) >= DATE_TRUNC('month', DATE_FROM_PARTS(:startYear, :startMonthIndex, 1))
			AND DATE_TRUNC('month', TO_DATE(year || '-' || month || '-01')) < DATE_TRUNC('month', DATE_FROM_PARTS(:endYearValue, :endMonthIndexValue, 1))";
        var expectedSql = $@"
WITH filtered_ids AS (
        SELECT TO_NUMBER(VALUE)::INTEGER AS Number
        FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
    )
SELECT subquery.AircraftId AS AircraftId,
        subquery.Registration AS Registration,
        subquery.Series AS Series,
        subquery.SerialNumber AS SerialNumber,
        ARRAY_AGG(CONCAT(subquery.Year, '_', subquery.Month)) AS YearMonth,";
        if (isEmissions)
        {
            expectedSql += $@"ARRAY_AGG(subquery.CO2EmissionPerKg::integer) AS CO2EmissionPerKg,
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
                month AS Month ";
            expectedSql += $@"
            FROM {Constants.RiskAnalyticsTablePrefix}hybrid_aircraft_utilization_combined
            " + whereQuery + $@"
            GROUP BY aircraft_id, aircraft_serial_number, aircraft_series, Registration, year, month, co2_emissions_kg, co2_kg_per_seat, co2_g_per_ask, AverageCo2GPerAsm
            ORDER BY aircraft_id DESC, year DESC, month DESC) AS subquery
            GROUP BY subquery.AircraftId,subquery.Registration,subquery.Series,subquery.SerialNumber";
        }
        else
        {
            expectedSql += $@"ARRAY_AGG(subquery.TotalHours) AS TotalHours,
            ARRAY_AGG(subquery.TotalCycles::integer) AS TotalCycles,
            ARRAY_AGG(subquery.AverageHoursPerCycle) AS AverageHoursPerCycle
            FROM (
                SELECT
                registration AS Registration,
                aircraft_series AS Series,
                aircraft_serial_number AS SerialNumber,
	            hours As TotalHours,
                cycles As TotalCycles,
                hours_per_cycle As AverageHoursPerCycle,";
            expectedSql += $@"aircraft_id As AircraftId,
            year As Year,
            month As Month
            FROM {Constants.RiskAnalyticsTablePrefix}hybrid_aircraft_utilization_combined
            " + whereQuery + $@"
            GROUP BY aircraft_id, aircraft_serial_number, aircraft_series, Registration, year, month, hours, cycles, hours_per_cycle
            ORDER BY aircraft_id DESC, year DESC, month DESC) AS subquery
            GROUP BY subquery.AircraftId,subquery.Registration,subquery.Series,subquery.SerialNumber";
        }

        string calledQuery = string.Empty;

        snowflakeRepositoryMock.When(t => t.Query<dynamic>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p => calledQuery = p.Args().First() as string);
        int endMonthIndexValue = 0;
        int endYearValue = 0;
        endMonthIndexValue = (int)(endMonthIndex < 12 ? endMonthIndex + 1 : 1);
        endYearValue = (int)(endMonthIndex < 12 ? endYear : endYear + 1);
        // act
        await utilizationRepository.GetMonthlyUtilizationPerAircraft(
            portfolioId,
            endMonthIndexValue,
            startMonthIndex,
            endYearValue,
            startYear,
            isEmissions,
            operatorId,
            lessorId,
            groupBy,
            groupByFilterIds
        );
        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }

    [Fact]
    public async Task GetMonthlyUtilizationPerAircraft_Returns_Expected_Results()
    {
        // Arrange
        int portfolioId = 1;
        int endMonthIndex = 3;
        int startMonthIndex = 2;
        int endYear = 2024;
        int startYear = 2023;
        bool isEmissions = true;
        int? operatorId = 1;
        int? lessorId = 1;
        MonthlyUtilizationGroup? groupBy = MonthlyUtilizationGroup.MarketClass;
        IEnumerable<int> groupByFilterIds = new[] { 1, 2, 3 };

        dynamic mockRecord = new System.Dynamic.ExpandoObject();
        mockRecord.REGISTRATION = "ABC123";
        mockRecord.SERIES = "SeriesX";
        mockRecord.SERIALNUMBER = "SN001";
        mockRecord.AIRCRAFTID = 456;
        mockRecord.YEARMONTH = "[\"2024_2\"]";
        mockRecord.TOTALHOURS = "[100]";
        mockRecord.TOTALCYCLES = "[50]"; // Ensure the test data matches
        mockRecord.AVERAGEHOURSPERCYCLE = "[2.0]";
        mockRecord.CO2EMISSIONPERKG = "[1000]";
        mockRecord.AVERAGECO2KGPERSEAT = "[500]";
        mockRecord.AVERAGECO2GPERASK = "[2.5]";
        mockRecord.AVERAGECO2GPERASM = "[3.2]";

        IEnumerable<dynamic> mockResults = new List<dynamic> { mockRecord };

        snowflakeRepositoryMock
            .Query<dynamic>(Arg.Any<string>(), Arg.Any<object>())
            .Returns(mockResults);
        // Act
        var results = await utilizationRepository.GetMonthlyUtilizationPerAircraft(
            portfolioId,
            endMonthIndex,
            startMonthIndex,
            endYear,
            startYear,
            isEmissions,
            operatorId,
            lessorId,
            groupBy,
            groupByFilterIds
        );

        // Assert
        var listResults = results.ToList();
        Assert.Single(listResults);

        var result = listResults[0];
        Assert.Equal("ABC123", result.Registration);
        Assert.Equal("SeriesX", result.Series);
        Assert.Equal("SN001", result.SerialNumber);
        Assert.Equal(456, result.AircraftId);
        Assert.Equal(new[] { "2024_2" }, result.YearMonth);
    }
}
