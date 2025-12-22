using RiskAnalytics.Api.Repository.Entities.DataPlatform;

namespace RiskAnalytics.Api.Repository.Mappers.Interfaces;

public interface IAircraftReportedUtilizationMapper
{
    void Map(
        Aircraft? aircraft,
        AircraftReportedUtilization? aircraftReportedUtilization);
}
