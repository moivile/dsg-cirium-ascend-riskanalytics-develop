
using NSubstitute;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests
{
    public class PortfolioRepositoryTests
    {
        private readonly ISnowflakeRepository snowflakeRepositoryMock;
        private readonly IPortfoliosMapper portfoliosMapperMock;
        private readonly IPortfolioAircraftRepository aircraftRepositoryMock;
        private readonly PortfoliosRepository portfoliosRepository;

        public PortfolioRepositoryTests()
        {
            snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
            portfoliosMapperMock = Substitute.For<IPortfoliosMapper>();
            aircraftRepositoryMock = Substitute.For<IPortfolioAircraftRepository>();
            portfoliosRepository = new PortfoliosRepository(snowflakeRepositoryMock, portfoliosMapperMock, aircraftRepositoryMock);
        }

        [Fact]
        public async Task Update_ExecutesQueryWithExpectedSql()
        {
            // act
            await portfoliosRepository.Update(new Entities.Portfolios.Portfolio());

            // assert
            var expectedSql = $"UPDATE {Constants.RiskAnalyticsTablePrefix}portfolios as portfolios SET name=:Name,date_modified=:dateUpdated WHERE portfolios.id=:Id";

            await snowflakeRepositoryMock.Received().Execute(
                    Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                    Arg.Any<object?>());
        }

        [Fact]
        public async Task Update_CallsDeleteAllInPortfolioAircraftRepository()
        {
            // act
            await portfoliosRepository.Update(new Entities.Portfolios.Portfolio());

            // assert
            await aircraftRepositoryMock.Received().DeleteAll(Arg.Any<int>());
        }

        [Fact]
        public async Task Update_PortfolioContainsOneAircraft_CallsInsertInPortfolioAircraftRepository()
        {
            // act
            await portfoliosRepository.Update(new Entities.Portfolios.Portfolio
            {
                Aircraft= new List<Entities.Portfolios.PortfolioAircraft>
                {
                    new Entities.Portfolios.PortfolioAircraft()
                }
            });

            // assert
            await aircraftRepositoryMock.Received().Insert(Arg.Any<int>(), Arg.Any<IEnumerable<Aircraft>>());
        }

        [Fact]
        public async Task Update_PortfolioContainsNoAircraft_DoesNotCallInsertInPortfolioAircraftRepository()
        {
            // act
            await portfoliosRepository.Update(new Entities.Portfolios.Portfolio
            {
                Aircraft = new List<Entities.Portfolios.PortfolioAircraft>()
            });

            // assert
            await aircraftRepositoryMock.DidNotReceive().Insert(Arg.Any<int>(), Arg.Any<IEnumerable<Aircraft>>());
        }
    }
}
