namespace RiskAnalytics.Api.Model;

public class SummaryGroundEventsModel
{
    public string? Name { get; set; }
    public int VeryShortStayCount { get; set; }
    public int ShortStayCount { get; set; }
    public int MediumStayCount { get; set; }
    public int LongStayCount { get; set; }
}
