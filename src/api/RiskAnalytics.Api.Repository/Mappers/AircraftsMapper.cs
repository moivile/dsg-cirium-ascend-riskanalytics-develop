using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Mappers.Dependencies;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;

namespace RiskAnalytics.Api.Repository.Mappers;

public class AircraftsMapper : IAircraftsMapper
{
    private readonly IAircraftHistoryMapper aircraftHistoryMapper;
    private readonly IAircraftReportedUtilizationMapper aircraftReportedUtilizationMapper;

    public AircraftsMapper(
        IAircraftHistoryMapper aircraftHistoryMapper,
        IAircraftReportedUtilizationMapper aircraftReportedUtilizationMapper)
    {
        this.aircraftHistoryMapper = aircraftHistoryMapper;
        this.aircraftReportedUtilizationMapper = aircraftReportedUtilizationMapper;
    }

    public Aircraft Map(
        Dictionary<int, Aircraft> existingAircrafts,
        Aircraft aircraft,
        AircraftHistoryDependencies? aircraftHistoryDependencies = null,
        AircraftReportedUtilization? aircraftReportedUtilization = null)
    {
        if (existingAircrafts.TryGetValue(aircraft.AircraftId, out var existingAircraft))
        {
            MapDependents(existingAircraft);
            return existingAircraft;
        }

        MapDependents(aircraft);

        existingAircrafts.Add(aircraft.AircraftId, aircraft);
        return aircraft;

        void MapDependents(Aircraft targetAircraft)
        {
            aircraftHistoryMapper.Map(targetAircraft, aircraftHistoryDependencies);
            aircraftReportedUtilizationMapper.Map(targetAircraft, aircraftReportedUtilization);
        }
    }
}
