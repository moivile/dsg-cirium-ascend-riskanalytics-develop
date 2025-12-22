using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Mappers.Dependencies;

namespace RiskAnalytics.Api.Repository.Mappers.Interfaces;

public interface IAircraftsMapper
{
    Aircraft Map(
        Dictionary<int, Aircraft> existingAircrafts,
        Aircraft aircraft,
        AircraftHistoryDependencies? aircraftHistoryDependencies = null,
        AircraftReportedUtilization? aircraftReportedUtilization = null);
}
