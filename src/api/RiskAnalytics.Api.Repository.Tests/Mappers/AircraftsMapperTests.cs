
using NSubstitute;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Mappers;
using RiskAnalytics.Api.Repository.Mappers.Dependencies;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests.Mappers;

public class AircraftsMapperTests
{
    private readonly IAircraftHistoryMapper aircraftHistoryMapperMock;
    private readonly IAircraftReportedUtilizationMapper aircraftReportedUtilizationMapperMock;

    private readonly AircraftsMapper aircraftsMapper;

    public AircraftsMapperTests()
    {
        aircraftHistoryMapperMock = Substitute.For<IAircraftHistoryMapper>();
        aircraftReportedUtilizationMapperMock = Substitute.For<IAircraftReportedUtilizationMapper>();

        aircraftsMapper = new AircraftsMapper(aircraftHistoryMapperMock, aircraftReportedUtilizationMapperMock);
    }

    [Fact]
    public void Map_AircraftExists_ReturnExistingAircraft()
    {
        //arrange
        const int existingAircraftId = 1;

        var existingAircrafts = new Dictionary<int, Aircraft>
        {
            { existingAircraftId, new Aircraft { AircraftId = existingAircraftId } }
        };

        //act
        var mappedAircraft = aircraftsMapper.Map(existingAircrafts, new Aircraft { AircraftId = existingAircraftId });

        //assert
        Assert.Single(existingAircrafts);
        Assert.Equal(existingAircrafts.Single().Value, mappedAircraft);
    }

    [Fact]
    public void Map_AircraftExists_MapAircraftHistoryToExistingAircraft()
    {
        //arrange
        const int existingAircraftId = 1;

        var existingAircrafts = new Dictionary<int, Aircraft>
        {
            { existingAircraftId, new Aircraft { AircraftId = existingAircraftId } }
        };

        var aircraftHistory = new AircraftHistory();
        var aircraftHistoryDependencies = new AircraftHistoryDependencies(aircraftHistory);

        //act
        var mappedAircraft = aircraftsMapper.Map(existingAircrafts, new Aircraft { AircraftId = existingAircraftId }, aircraftHistoryDependencies);

        //assert
        aircraftHistoryMapperMock.Received().Map(existingAircrafts.Single().Value, aircraftHistoryDependencies);
        Assert.Equal(existingAircrafts.Single().Value, mappedAircraft);
    }

    [Fact]
    public void Map_AircraftExists_MapReportedUtilizationToExistingAircraft()
    {
        //arrange
        const int existingAircraftId = 1;

        var existingAircrafts = new Dictionary<int, Aircraft>
        {
            { existingAircraftId, new Aircraft { AircraftId = existingAircraftId } }
        };

        var aircraftReportedUtilization = new AircraftReportedUtilization();

        //act
        var mappedAircraft = aircraftsMapper.Map(existingAircrafts, new Aircraft { AircraftId = existingAircraftId }, null, aircraftReportedUtilization);

        //assert
        aircraftReportedUtilizationMapperMock.Received().Map(existingAircrafts.Single().Value, aircraftReportedUtilization);
        Assert.Equal(existingAircrafts.Single().Value, mappedAircraft);
    }

    [Fact]
    public void Map_AircraftDoesNotExist_AddNewAircraftToExistingAircraftsAndReturnAircraft()
    {
        //arrange
        const int existingAircraftId = 1;
        const int newAircraftId = 2;

        var existingAircraft = new Aircraft { AircraftId = existingAircraftId };

        var existingAircrafts = new Dictionary<int, Aircraft>
        {
            { existingAircraftId, existingAircraft }
        };

        var newAircraft = new Aircraft { AircraftId = newAircraftId };

        //act
        var mappedAircraft = aircraftsMapper.Map(existingAircrafts, newAircraft);

        //assert
        Assert.Equal(2, existingAircrafts.Count);
        Assert.Equal(existingAircrafts.First().Value, existingAircraft);
        Assert.Equal(existingAircrafts.Last().Value, newAircraft);
        Assert.Equal(newAircraft, mappedAircraft);
    }

    [Fact]
    public void Map_AircraftDoesNotExist_MapAircraftHistoryToNewAircraft()
    {
        //arrange
        const int existingAircraftId = 1;
        const int newAircraftId = 2;

        var existingAircraft = new Aircraft { AircraftId = existingAircraftId };

        var existingAircrafts = new Dictionary<int, Aircraft>
        {
            { existingAircraftId, existingAircraft }
        };

        var newAircraft = new Aircraft { AircraftId = newAircraftId };
        var aircraftHistory = new AircraftHistory();
        var aircraftHistoryDependencies = new AircraftHistoryDependencies(aircraftHistory);

        //act
        var mappedAircraft = aircraftsMapper.Map(existingAircrafts, newAircraft, aircraftHistoryDependencies);

        //assert
        aircraftHistoryMapperMock.Received().Map(newAircraft, aircraftHistoryDependencies);
        Assert.Equal(newAircraft, mappedAircraft);
    }

    [Fact]
    public void Map_AircraftDoesNotExist_MapAircraftReportedUtilizationToNewAircraft()
    {
        //arrange
        const int existingAircraftId = 1;
        const int newAircraftId = 2;

        var existingAircrafts = new Dictionary<int, Aircraft>
        {
            { existingAircraftId, new Aircraft { AircraftId = existingAircraftId } }
        };

        var newAircraft = new Aircraft { AircraftId = newAircraftId };
        var aircraftReportedUtilization = new AircraftReportedUtilization();

        //act
        var mappedAircraft = aircraftsMapper.Map(existingAircrafts, newAircraft, null, aircraftReportedUtilization);

        //assert
        aircraftReportedUtilizationMapperMock.Received().Map(newAircraft, aircraftReportedUtilization);
        Assert.Equal(newAircraft, mappedAircraft);
    }
}
