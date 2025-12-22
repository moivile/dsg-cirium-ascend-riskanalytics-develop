using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Repository.Mappers;

namespace RiskAnalytics.Api.Repository.Tests.Mappers;

public class PortfoliosMapperTests
{
    [Fact]
    public void Map_PortfolioExists_AircraftIsNull_ReturnExistingPortfolioWithoutAircraft()
    {
        // arrange
        var mapper = new PortfoliosMapper();

        const int existingPortfolioId = 1;

        var existingPortfolio = new Portfolio { Id = existingPortfolioId };

        var existingPortfolios = new Dictionary<int, Portfolio>
        {
            { existingPortfolioId, existingPortfolio }
        };

        // act
        var mappedPortfolio = mapper.Map(existingPortfolios, new Portfolio { Id = existingPortfolioId }, null);

        // assert
        Assert.Single(existingPortfolios);
        Assert.Empty(existingPortfolio.Aircraft);
        Assert.Equal(existingPortfolio, mappedPortfolio);
    }

    [Fact]
    public void Map_PortfolioExists_AircraftIsNotNull_ReturnExistingPortfolioWithAircraft()
    {
        // arrange
        var mapper = new PortfoliosMapper();

        const int existingPortfolioId = 1;

        var existingPortfolio = new Portfolio { Id = existingPortfolioId, Aircraft = new List<PortfolioAircraft> { new() } };

        var existingPortfolios = new Dictionary<int, Portfolio>
        {
            { existingPortfolioId, existingPortfolio }
        };

        // act
        var mappedPortfolio = mapper.Map(existingPortfolios, new Portfolio { Id = existingPortfolioId }, new PortfolioAircraft());

        // assert
        Assert.Single(existingPortfolios);
        Assert.Equal(2, existingPortfolio.Aircraft.Count);
        Assert.Equal(existingPortfolio, mappedPortfolio);
    }

    [Fact]
    public void Map_PortfolioDoesNotExist_AircraftIsNull_ReturnPortfolioWithoutAircraft()
    {
        // arrange
        var mapper = new PortfoliosMapper();

        const int newPortfolioId = 1;

        var newPortfolio = new Portfolio { Id = newPortfolioId };

        var existingPortfolios = new Dictionary<int, Portfolio>();

        // act
        var mappedPortfolio = mapper.Map(existingPortfolios, newPortfolio, null);

        // assert
        Assert.Single(existingPortfolios);
        Assert.Empty(newPortfolio.Aircraft);
        Assert.Equal(newPortfolio, mappedPortfolio);
    }

    [Fact]
    public void Map_PortfolioDoesNotExist_AircraftIsNotNull_ReturnPortfolioWithAircraft()
    {
        // arrange
        var mapper = new PortfoliosMapper();

        const int newPortfolioId = 1;

        var newPortfolio = new Portfolio { Id = newPortfolioId, Aircraft = new List<PortfolioAircraft> { new(), new() } };

        var existingPortfolios = new Dictionary<int, Portfolio>();

        // act
        var mappedPortfolio = mapper.Map(existingPortfolios, newPortfolio, null);

        // assert
        Assert.Single(existingPortfolios);
        Assert.Equal(2, newPortfolio.Aircraft.Count);
        Assert.Equal(newPortfolio, mappedPortfolio);
    }
}
