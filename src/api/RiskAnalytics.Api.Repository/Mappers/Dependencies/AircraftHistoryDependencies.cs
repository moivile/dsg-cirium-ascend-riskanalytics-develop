using RiskAnalytics.Api.Repository.Entities.DataPlatform;

namespace RiskAnalytics.Api.Repository.Mappers.Dependencies;

public class AircraftHistoryDependencies
{
    public AircraftHistoryDependencies(
        AircraftHistory aircraftHistory,
        AircraftStatusHistory? aircraftStatusHistory = null,
        AircraftConfiguration? aircraftConfiguration = null
        )
    {
        AircraftHistory = aircraftHistory;
        AircraftStatusHistory = aircraftStatusHistory;
        AircraftConfiguration = aircraftConfiguration;
    }

    public AircraftHistory AircraftHistory { get; }

    public AircraftStatusHistory? AircraftStatusHistory { get; }

    public AircraftConfiguration? AircraftConfiguration { get; }
}
