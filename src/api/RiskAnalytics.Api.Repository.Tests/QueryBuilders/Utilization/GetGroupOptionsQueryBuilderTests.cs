using RiskAnalytics.Api.Repository.QueryBuilders.Utilization;

namespace RiskAnalytics.Api.Repository.Tests.QueryBuilders.Utilization;

public class GetGroupOptionsQueryBuilderTests
{
    [Fact]
    public void BuildQuery_PortfolioIdIsNotNull_IncludeSerialNumberGroupOptions()
    {
        // arrange
        var queryBuilder = new GetGroupOptionsQueryBuilder();

        // act
        var query = queryBuilder.BuildQuery(1);

        // assert
        Assert.Contains("SELECT DISTINCT aircraft_id, aircraft_serial_number, 'AircraftSerialNumber'", query);
    }

    [Fact]
    public void BuildQuery_PortfolioIdIsNull_DoNotIncludeSerialNumberGroupOptions()
    {
        // arrange
        var queryBuilder = new GetGroupOptionsQueryBuilder();

        // act
        var query = queryBuilder.BuildQuery(null);

        // assert
        Assert.DoesNotContain("SELECT DISTINCT aircraft_id, aircraft_serial_number, 'AircraftSerialNumber'", query);
    }
}
