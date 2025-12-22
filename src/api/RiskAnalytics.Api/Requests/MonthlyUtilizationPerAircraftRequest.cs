using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Requests;

public class MonthlyUtilizationPerAircraftRequest
{

    public int PortfolioId { get; set; }
    public MonthlyUtilizationGroup? GroupBy { get; set; }
    public IReadOnlyCollection<int>? GroupByFilterIds { get; set; }
    public int? OperatorId { get; set; }
    public int? LessorId { get; set; }
    public int EndMonthIndex { get; set; }
    public int StartMonthIndex { get; set; }
    public int EndYear { get; set; }
    public int StartYear { get; set; }
    public bool IsEmissions { get; set; }
}
