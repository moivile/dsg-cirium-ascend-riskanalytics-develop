namespace RiskAnalytics.Api.Repository.Entities.DataPlatform;

public class AircraftReportedUtilization
{
    public int AircraftId { get; set; }

    public int Hours  { get; set; }

    public int Cycles  { get; set; }

    public DateTime ReportedDate { get; set; }

    public bool IsCurrent { get; set; }
}
