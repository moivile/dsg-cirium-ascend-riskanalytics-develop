using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository;
public interface IGroupCountQueryRepository
{
    Task<IEnumerable<MonthlyUtilizationGroupCount>> GetGroupCounts(
        int? portfolioId,
        MonthlyUtilizationGroup? groupBy,
        IEnumerable<int>? groupByFilterIds,
        int? operatorId,
        int? lessorId,
        bool includeBaseline
        );
}
