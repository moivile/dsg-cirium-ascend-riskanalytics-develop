using NSubstitute;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;
using RiskAnalytics.Api.Repository.Portfolios;

namespace RiskAnalytics.Api.Repository.Tests;

public class PortfolioAircraftRepositoryTests
{
    private readonly ISnowflakeRepository snowflakeRepositoryMock;
    private readonly IAircraftsMapper aircraftsMapperMock;

    private readonly PortfolioAircraftRepository portfolioAircraftRepository;

    public PortfolioAircraftRepositoryTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        aircraftsMapperMock = Substitute.For<IAircraftsMapper>();

        portfolioAircraftRepository = new PortfolioAircraftRepository(
            snowflakeRepositoryMock,
            aircraftsMapperMock
        );
    }

    [Fact]
    public async Task DeleteAll_ExecutesQueryWithExpectedSql()
    {
        // act
        await portfolioAircraftRepository.DeleteAll(1);

        // assert
        var expectedSql = $"DELETE FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id=:portfolioId";

        await snowflakeRepositoryMock.Received().Execute(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<object?>());
    }
}
