using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization;

namespace RiskAnalytics.Api.Repository.Tests.QueryBuilders.Utilization;

public class GetOperatorsQueryBuilderTests
{
    [Theory]
    [InlineData(MonthlyUtilizationGroup.MarketClass, "aircraft_configurations.aircraft_market_class_id")]
    [InlineData(MonthlyUtilizationGroup.AircraftFamily, "aircraft_configurations.aircraft_family_id")]
    [InlineData(MonthlyUtilizationGroup.AircraftType, "aircraft_configurations.aircraft_type_id")]
    [InlineData(MonthlyUtilizationGroup.AircraftSeries, "aircraft_configurations.aircraft_series_id")]
    [InlineData(MonthlyUtilizationGroup.AircraftSerialNumber, "aircraft.aircraft_id")]
    public void BuildQuery_GroupByIsNotNull_AddFilterForGroupByFilterIds(MonthlyUtilizationGroup monthlyUtilizationGroup, string expectedFilterColumn)
    {
        // arrange
        var queryBuilder = new GetOperatorsQueryBuilder();

        // act
        var query = queryBuilder.BuildQuery(monthlyUtilizationGroup);

        // assert
        Assert.Contains($"AND {expectedFilterColumn} IN (SELECT Number FROM filtered_ids)", query);
    }

    [Fact]
    public void BuildQuery_GroupByIsNull_DoNotAddFilterForGroupByFilterIds()
    {
        // arrange
        var queryBuilder = new GetOperatorsQueryBuilder();

        // act
        var query = queryBuilder.BuildQuery(null);

        // assert
        Assert.DoesNotContain($"IN (SELECT Number FROM filtered_ids)", query);
    }
}
