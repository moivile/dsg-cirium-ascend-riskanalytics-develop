using RiskAnalytics.Api.Mappers;
using RiskAnalytics.Api.Responses;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using Xunit;

namespace RiskAnalytics.Api.Tests.Mappers;

public class PortfolioAircraftResponseMapperTests
{
    [Fact]
    public void Map_MapsFromAircraft()
    {
        // arrange
        var mapper = MapsterForUnitTests.GetMapper<PortfolioAircraftMappingConfig>();

        // act
        var response = mapper.Map<List<AircraftResponse>>(new List<Aircraft> { new() { AircraftId = 1, AircraftAgeYears = 23.2 } });

        // assert
        var AircraftResponse = response.SingleOrDefault();
        Assert.NotNull(AircraftResponse);
        Assert.Equal(1, AircraftResponse.AircraftId);
    }

    [Fact]
    public void Map_MapsFromCurrentAircraftHistory()
    {
        // arrange
        const string manager = "manager";
        const string @operator = "operator";
        const string aircraftRegistrationNumber = "aircraft registration";

        var mapper = MapsterForUnitTests.GetMapper<PortfolioAircraftMappingConfig>();

        // act
        var response = mapper.Map<List<AircraftResponse>>(new List<Aircraft>
        {
            new()
            {
                AircraftAllHistory = new List<AircraftHistory>
                {
                    new() { IsCurrent = true, Manager = manager, Operator = @operator, AircraftRegistrationNumber = aircraftRegistrationNumber },
                    new() { IsCurrent = false }
                }
            }
        });

        // assert
        var portfolioAircraftResponse = response.SingleOrDefault();
        Assert.NotNull(portfolioAircraftResponse);
        Assert.Equal(manager, portfolioAircraftResponse.Manager);
        Assert.Equal(@operator, portfolioAircraftResponse.Operator);
        Assert.Equal(aircraftRegistrationNumber, portfolioAircraftResponse.AircraftRegistrationNumber);
    }

    [Fact]
    public void Map_MapsFromCurrentAircraftHistoryAircraftConfiguration()
    {
        // arrange
        const string aircraftSeries = "aircraft series";
        const string engineSeries = "engine series";

        var mapper = MapsterForUnitTests.GetMapper<PortfolioAircraftMappingConfig>();

        // act
        var response = mapper.Map<List<AircraftResponse>>(new List<Aircraft>
        {
            new()
            {
                AircraftAllHistory = new List<AircraftHistory>
                {
                    new()
                    {
                        IsCurrent = true, AircraftConfiguration = new AircraftConfiguration
                        {
                            AircraftSeries = aircraftSeries,
                            EngineSeries = engineSeries
                        }
                    },
                    new() { IsCurrent = false }
                }
            }
        });

        // assert
        var portfolioAircraftResponse = response.SingleOrDefault();
        Assert.NotNull(portfolioAircraftResponse);
        Assert.Equal(aircraftSeries, portfolioAircraftResponse.AircraftSeries);
        Assert.Equal(@engineSeries, portfolioAircraftResponse.EngineSeries);
    }

    [Fact]
    public void Map_MapsFromCurrentAircraftHistoryAircraftStatusHistory()
    {
        // arrange
        const string status = "In Service";

        var mapper = MapsterForUnitTests.GetMapper<PortfolioAircraftMappingConfig>();

        // act
        var response = mapper.Map<List<AircraftResponse>>(new List<Aircraft>
        {
            new()
            {
                AircraftAllHistory = new List<AircraftHistory>
                {
                    new()
                    {
                        IsCurrent = true, AircraftStatusHistory = new AircraftStatusHistory
                        {
                            Status = status
                        }
                    },
                    new() { IsCurrent = false }
                }
            }
        });

        // assert
        var portfolioAircraftResponse = response.SingleOrDefault();
        Assert.NotNull(portfolioAircraftResponse);
        Assert.Equal(status, portfolioAircraftResponse.Status);
    }

    [Fact]
    public void Map_CurrentAircraftHistoryIsNull_MapAircraft()
    {
        // arrange
        const int aircraftId = 123;

        var mapper = MapsterForUnitTests.GetMapper<PortfolioAircraftMappingConfig>();

        // act
        var response = mapper.Map<List<AircraftResponse>>(new List<Aircraft>
        {
            new() { AircraftId = aircraftId, AircraftAllHistory = new List<AircraftHistory>() }
        });

        // assert
        var portfolioAircraftResponse = response.SingleOrDefault();
        Assert.NotNull(portfolioAircraftResponse);
        Assert.Equal(aircraftId, portfolioAircraftResponse.AircraftId);
    }

    [Fact]
    public void Map_AircraftStatusHistoryAndAircraftConfigurationAreNull_MapCurrentAircraftHistory()
    {
        // arrange
        const string manager = "manager";

        var mapper = MapsterForUnitTests.GetMapper<PortfolioAircraftMappingConfig>();

        // act
        var response = mapper.Map<List<AircraftResponse>>(new List<Aircraft>
        {
            new()
            {
                AircraftId = 123, AircraftAllHistory = new List<AircraftHistory>
                {
                    new() { IsCurrent = true, Manager = manager, AircraftConfiguration = null, AircraftStatusHistory = null }
                }
            }
        });

        // assert
        var portfolioAircraftResponse = response.SingleOrDefault();
        Assert.NotNull(portfolioAircraftResponse);
        Assert.Equal(manager, portfolioAircraftResponse.Manager);
    }
}
