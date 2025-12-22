using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Mappers.Dependencies;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;

namespace RiskAnalytics.Api.Repository.Mappers;

public class AircraftHistoryMapper : IAircraftHistoryMapper
{
    public void Map(
        Aircraft? aircraft,
        AircraftHistoryDependencies? aircraftHistoryDependencies)
    {
        if (aircraft == null || aircraftHistoryDependencies?.AircraftHistory == null)
        {
            return;
        }

        var existingAircraftHistory = aircraft.AircraftAllHistory.SingleOrDefault(x => x.AircraftHistoryId == aircraftHistoryDependencies.AircraftHistory.AircraftHistoryId);

        if (existingAircraftHistory != null)
        {
            PopulateAircraftHistory(existingAircraftHistory);
        }
        else
        {
            PopulateAircraftHistory(aircraftHistoryDependencies.AircraftHistory);
            aircraft.AircraftAllHistory.Add(aircraftHistoryDependencies.AircraftHistory);
        }

        void PopulateAircraftHistory(AircraftHistory targetAircraftHistory)
        {
            targetAircraftHistory.AircraftId = aircraft.AircraftId;
            targetAircraftHistory.AircraftConfiguration = aircraftHistoryDependencies.AircraftConfiguration;
            targetAircraftHistory.AircraftStatusHistory = aircraftHistoryDependencies.AircraftStatusHistory;
        }
    }
}
