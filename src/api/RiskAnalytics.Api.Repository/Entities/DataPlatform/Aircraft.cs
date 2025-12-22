namespace RiskAnalytics.Api.Repository.Entities.DataPlatform;

public class Aircraft
{
    public Aircraft()
    {
        AircraftAllHistory = new List<AircraftHistory>();
        ReportedUtilization = new List<AircraftReportedUtilization>();
    }

    public int AircraftId { get; set; }

    public double? AircraftAgeYears { get; set; }

    public string? AircraftSerialNumber { get; set; }

    public IList<AircraftHistory> AircraftAllHistory { get; set; }

    public string? AircraftUsage { get; set; }

    public IList<AircraftReportedUtilization> ReportedUtilization { get; set; }

    public AircraftHistory? CurrentAircraftHistory
    {
        get { return AircraftAllHistory.SingleOrDefault(x => x.IsCurrent); }
    }

    public AircraftReportedUtilization? CurrentReportedUtilization
    {
        get { return ReportedUtilization.SingleOrDefault(x => x.IsCurrent); }
    }
}
