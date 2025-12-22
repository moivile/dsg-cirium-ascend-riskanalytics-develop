using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Mappers;

namespace RiskAnalytics.Api.Repository.Tests.Mappers;

public class AircraftReportedUtilizationMapperTests
{
    [Fact]
    public void Map_AircraftIsNull_DoNotThrow()
    {
        // act
        new AircraftReportedUtilizationMapper().Map(null, new AircraftReportedUtilization());
    }

    [Fact]
    public void Map_AircraftIsNotNullAndReportedUtilizationIsNull_DoNotMapReportedUtilization()
    {
        // arrange
        var aircraft = new Aircraft();

        // act
        new AircraftReportedUtilizationMapper().Map(aircraft, null);

        // assert
        Assert.Empty(aircraft.ReportedUtilization);
    }

    [Fact]
    public void Map_AircraftIsNotNullAndReportedUtilizationIsNotNull_MapReportedUtilization()
    {
        // arrange
        var aircraft = new Aircraft();

        // act
        new AircraftReportedUtilizationMapper().Map(aircraft, new AircraftReportedUtilization());

        // assert
        Assert.Single(aircraft.ReportedUtilization);
    }

    [Fact]
    public void Map_AircraftIsNotNullAndReportedUtilizationAlreadyExistsOnAircraft_DoNotMapReportedUtilization()
    {
        // arrange
        var now = DateTime.UtcNow;

        var existingReportedUtilization = new AircraftReportedUtilization
        {
            AircraftId = 1,
            ReportedDate = now
        };

        var newReportedUtilization = new AircraftReportedUtilization
        {
            AircraftId = existingReportedUtilization.AircraftId,
            ReportedDate = existingReportedUtilization.ReportedDate
        };

        var aircraft = new Aircraft
        {
            ReportedUtilization = new List<AircraftReportedUtilization> { existingReportedUtilization }
        };

        // act
        new AircraftReportedUtilizationMapper().Map(aircraft, newReportedUtilization);

        // assert
        Assert.Single(aircraft.ReportedUtilization);
    }
}
