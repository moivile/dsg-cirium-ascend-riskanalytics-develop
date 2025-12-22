using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Requests;

public class GetMonthlyUtilizationRequest
{
    public int? PortfolioId { get; set; }

    public MonthlyUtilizationGroup? GroupBy { get; set; }

    public IReadOnlyCollection<int>? GroupByFilterIds { get; set; }

    public int? OperatorId { get; set; }
    public int? LessorId { get; set; }
    public bool IncludeBaseline { get; set; }

    public bool IsEmissions { get; set; }
    public bool IsHoursAndCycle { get; set; }
}
