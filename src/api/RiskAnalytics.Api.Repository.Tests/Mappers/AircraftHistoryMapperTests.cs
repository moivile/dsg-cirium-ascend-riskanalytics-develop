using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Mappers;
using RiskAnalytics.Api.Repository.Mappers.Dependencies;

namespace RiskAnalytics.Api.Repository.Tests.Mappers;

public class AircraftHistoryMapperTests
{
    [Fact]
    public void Map_AircraftHistoryIsNull_Return()
    {
        // arrange
        var mapper = new AircraftHistoryMapper();

        // act
        var exception = Record.Exception(() => mapper.Map(new Aircraft(), null));

        // assert
        Assert.Null(exception);
    }

    [Fact]
    public void Map_AircraftHistoryExists_MapToExistingAircraftHistory()
    {
        // arrange
        var mapper = new AircraftHistoryMapper();

        const int existingAircraftHistoryId = 1;

        var existingAircraftHistory = new AircraftHistory { AircraftHistoryId = existingAircraftHistoryId };

        var aircraft = new Aircraft
        {
            AircraftAllHistory = new List<AircraftHistory> { existingAircraftHistory }
        };

        var aircraftHistory = new AircraftHistory { AircraftHistoryId = existingAircraftHistoryId };
        var aircraftStatusHistory = new AircraftStatusHistory();
        var aircraftConfiguration = new AircraftConfiguration();

        // act
        mapper.Map(aircraft, new AircraftHistoryDependencies(aircraftHistory, aircraftStatusHistory, aircraftConfiguration));

        // assert
        Assert.Single(aircraft.AircraftAllHistory);
        Assert.Equal(existingAircraftHistory, aircraft.AircraftAllHistory.Single());
        Assert.Equal(aircraftConfiguration, aircraft.AircraftAllHistory.Single().AircraftConfiguration);
        Assert.Equal(aircraftStatusHistory, aircraft.AircraftAllHistory.Single().AircraftStatusHistory);
    }

    [Fact]
    public void Map_AircraftHistoryDoesNotExist_AddToAircraftHistories()
    {
        // arrange
        var mapper = new AircraftHistoryMapper();

        const int existingAircraftHistoryId = 1;
        const int newAircraftHistoryId = 2;

        var existingAircraftHistory = new AircraftHistory { AircraftHistoryId = existingAircraftHistoryId };

        var aircraft = new Aircraft
        {
            AircraftAllHistory = new List<AircraftHistory> { existingAircraftHistory }
        };

        var aircraftHistory = new AircraftHistory { AircraftHistoryId = newAircraftHistoryId };
        var aircraftStatusHistory = new AircraftStatusHistory();
        var aircraftConfiguration = new AircraftConfiguration();

        // act
        mapper.Map(aircraft, new AircraftHistoryDependencies(aircraftHistory, aircraftStatusHistory, aircraftConfiguration));

        // assert
        Assert.Equal(2, aircraft.AircraftAllHistory.Count);
        Assert.Equal(existingAircraftHistory, aircraft.AircraftAllHistory.First());
        Assert.Equal(aircraftHistory, aircraft.AircraftAllHistory.Last());
        Assert.Equal(aircraftStatusHistory, aircraft.AircraftAllHistory.Last().AircraftStatusHistory);
        Assert.Equal(aircraftConfiguration, aircraft.AircraftAllHistory.Last().AircraftConfiguration);
    }

    [Fact]
    public void Map_DependenciesAreNull_HandleNulls()
    {
        // arrange
        var mapper = new AircraftHistoryMapper();

        var aircraft = new Aircraft();

        // act
        mapper.Map(aircraft, new AircraftHistoryDependencies(new AircraftHistory()));

        // assert
        Assert.Single(aircraft.AircraftAllHistory);
        Assert.Null(aircraft.AircraftAllHistory.Single().AircraftStatusHistory);
        Assert.Null(aircraft.AircraftAllHistory.Single().AircraftConfiguration);
    }
}
