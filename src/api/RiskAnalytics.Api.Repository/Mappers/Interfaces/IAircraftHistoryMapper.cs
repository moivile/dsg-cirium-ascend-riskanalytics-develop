using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Mappers.Dependencies;

namespace RiskAnalytics.Api.Repository.Mappers.Interfaces;

public interface IAircraftHistoryMapper
{
    void Map(
        Aircraft aircraft,
        AircraftHistoryDependencies? aircraftHistoryDependencies);
}
