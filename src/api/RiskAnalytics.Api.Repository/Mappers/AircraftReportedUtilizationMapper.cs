using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;

namespace RiskAnalytics.Api.Repository.Mappers;

public class AircraftReportedUtilizationMapper : IAircraftReportedUtilizationMapper
{
    public void Map(
        Aircraft? aircraft,
        AircraftReportedUtilization? aircraftReportedUtilization)
    {
        if (aircraft == null || aircraftReportedUtilization == null)
        {
            return;
        }

        var existingReportedUtilization = aircraft.ReportedUtilization.SingleOrDefault(x =>
            x.AircraftId == aircraftReportedUtilization.AircraftId
            && x.ReportedDate == aircraftReportedUtilization.ReportedDate);

        if (existingReportedUtilization == null)
        {
            aircraft.ReportedUtilization.Add(aircraftReportedUtilization);
        }
    }
}
