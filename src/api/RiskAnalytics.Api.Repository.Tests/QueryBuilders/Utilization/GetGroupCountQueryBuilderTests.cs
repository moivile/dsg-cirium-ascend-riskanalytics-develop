using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization;

namespace RiskAnalytics.Api.Repository.Tests.QueryBuilders.Utilization;

public class GetGroupCountQueryBuilderTests
{
    private readonly GetGroupCountQueryBuilder queryBuilder;

    public GetGroupCountQueryBuilderTests()
    {
        queryBuilder = new GetGroupCountQueryBuilder();
    }

    [Fact]
    public void BuildQuery_GroupByIsNull_GenerateExpectedQuery()
    {
        // arrange
        var expected = $@"
            WITH filtered_ids AS (
            SELECT TO_NUMBER(VALUE)::INTEGER AS Number
            FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
            )
            SELECT
                NULL AS AircraftType,'All aircraft' ""group"", NULL ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)

            GROUP BY a.year, a.month";

        // act
        var query = queryBuilder.BuildQuery(null, true);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByMarketClass_GenerateExpectedQuery()
    {
        // arrange
        var expected = $@"
            WITH filtered_ids AS (
            SELECT TO_NUMBER(VALUE)::INTEGER AS Number
            FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
            )
            SELECT
                NULL AS AircraftType,'All aircraft' ""group"", NULL ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)

            GROUP BY a.year, a.month
UNION
            SELECT
                NULL AS AircraftType,aircraft_market_class ""group"", aircraft_market_class_id ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)
                AND aircraft_market_class_id IN(SELECT Number FROM filtered_ids)
            GROUP BY aircraft_market_class, aircraft_market_class_id, a.year, a.month";

        // act
        var query = queryBuilder.BuildQuery(MonthlyUtilizationGroup.MarketClass, true);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByAircraftFamily_GenerateExpectedQuery()
    {
        // arrange
        var expected = $@"
            WITH filtered_ids AS (
            SELECT TO_NUMBER(VALUE)::INTEGER AS Number
            FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
            )
            SELECT
                NULL AS AircraftType,'All aircraft' ""group"", NULL ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)

            GROUP BY a.year, a.month
UNION

            SELECT
                NULL AS AircraftType,aircraft_family ""group"", aircraft_family_id ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)
                AND aircraft_family_id IN(SELECT Number FROM filtered_ids)
            GROUP BY aircraft_family, aircraft_family_id, a.year, a.month";

        // act
        var query = queryBuilder.BuildQuery(MonthlyUtilizationGroup.AircraftFamily, true);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByAircraftType_GenerateExpectedQuery()
    {
        // arrange
        var expected = $@"
            WITH filtered_ids AS (
            SELECT TO_NUMBER(VALUE)::INTEGER AS Number
            FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
            )
            SELECT
                NULL AS AircraftType,'All aircraft' ""group"", NULL ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)

            GROUP BY a.year, a.month
UNION
            SELECT
                NULL AS AircraftType,aircraft_type ""group"", aircraft_type_id ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)
                AND aircraft_type_id IN(SELECT Number FROM filtered_ids)
            GROUP BY aircraft_type, aircraft_type_id, a.year, a.month";

        // act
        var query = queryBuilder.BuildQuery(MonthlyUtilizationGroup.AircraftType, true);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByAircraftSeries_GenerateExpectedQuery()
    {
        // arrange
        var expected = $@"
            WITH filtered_ids AS (
            SELECT TO_NUMBER(VALUE)::INTEGER AS Number
            FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
            )
            SELECT
                NULL AS AircraftType,'All aircraft' ""group"", NULL ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)

            GROUP BY a.year, a.month
UNION
            SELECT
                NULL AS AircraftType,aircraft_series ""group"", aircraft_series_id ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)
                AND aircraft_series_id IN(SELECT Number FROM filtered_ids)
            GROUP BY aircraft_series, aircraft_series_id, a.year, a.month";

        // act
        var query = queryBuilder.BuildQuery(MonthlyUtilizationGroup.AircraftSeries, true);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }

    [Fact]
    public void BuildQuery_GroupByMarketClassAircraftSerialNumber_GenerateExpectedQuery()
    {
        // arrange
        var expected = $@"
            WITH filtered_ids AS (
            SELECT TO_NUMBER(VALUE)::INTEGER AS Number
            FROM TABLE (FLATTEN (INPUT => SPLIT(:groupByFilterIds, ',')))
            )
            SELECT
                NULL AS AircraftType,'All aircraft' ""group"", NULL ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)

            GROUP BY a.year, a.month
UNION

            SELECT
                aircraft_type AS AircraftType,aircraft_serial_number ""group"", aircraft_id ""group_id"",
                a.year,
                a.month,
                COUNT(DISTINCT a.aircraft_id) AS numberOfAircraftInGroup
		    FROM RI_HYBRID_AIRCRAFT_UTILIZATION_COMBINED a

            WHERE
                aircraft_id IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id = :portfolioId)
                AND (:operatorId IS NULL OR a.operator_organization_id = :operatorId)
                AND (:lessorId IS NULL OR a.manager_organization_id = :lessorId)
                AND aircraft_id IN(SELECT Number FROM filtered_ids)
            GROUP BY AircraftType,aircraft_serial_number, aircraft_id, a.year, a.month";

        // act
        var query = queryBuilder.BuildQuery(MonthlyUtilizationGroup.AircraftSerialNumber, true);

        // assert
        Assert.True(QueryTestHelpers.IsQueryValid(expected, query));
    }
}
