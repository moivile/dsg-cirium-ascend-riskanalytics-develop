using NSubstitute;
using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests;

public class AircraftRepositoryTests
{
    private readonly ISnowflakeRepository snowflakeRepositoryMock;
    private readonly AircraftRepository aircraftRepository;
    public AircraftRepositoryTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        aircraftRepository = new AircraftRepository(snowflakeRepositoryMock);
    }

    [Fact]
    public async Task Get_ExecutesQueryWithExpectedSql()
    {
        // arrange
        var expectedSql = $"SELECT * FROM {Constants.RiskAnalyticsTablePrefix}aircraft WHERE aircraft_id=:id";
        string calledQuery = string.Empty;
        snowflakeRepositoryMock
            .When(t => t.Query<Aircraft>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

        //act
        await aircraftRepository.Get(1);

        // assert

        Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
    }
}
