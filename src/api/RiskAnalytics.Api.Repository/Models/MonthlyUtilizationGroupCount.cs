namespace RiskAnalytics.Api.Repository.Models;

public class MonthlyUtilizationGroupCount
{
    public string? Group { get; set; } = null!;
    public int? GroupId { get; set; }
    public int NumberOfAircraftInGroup { get; set; }
    public string? AircraftType { get; set; }

    public int Year { get; set; }
    public int Month { get; set; }
}
