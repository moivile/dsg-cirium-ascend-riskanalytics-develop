using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.Interfaces
{
    public interface IUtilizationRepository
    {
        Task<IEnumerable<IEnumerable<MonthlyUtilization>>> GetMonthlyUtilization(
            int? portfolioId,
            MonthlyUtilizationGroup? groupBy,
            IEnumerable<int>? groupByFilterIds,
            int? operatorId,
            int? lessorId,
            bool includeEmissions,
            bool includeBaseline,
            bool isEmissions,
            bool isHoursAndCycle);


        Task<IEnumerable<MSNUtilizationPerAircraft>> GetMonthlyUtilizationPerAircraft(
        int portfolioId,
        int endMonthIndex,
        int startMonthIndex,
        int endYear,
        int startYear,
        bool isEmissions,
        int? operatorId,
        int? lessorId,
        MonthlyUtilizationGroup? groupBy,
        IEnumerable<int>? groupByFilterIds);

        Task<IEnumerable<UtilizationGroupOption>> GetGroupOptions(int? operatorId, int? portfolioId, int? lessorId);

        Task<IEnumerable<IdNamePairModel>> GetOperators(int? portfolioId, int? lessorId, MonthlyUtilizationGroup? groupBy, IEnumerable<int>? groupByFilterIds);

        Task<IEnumerable<IdNamePairModel>> GetLessors(int? portfolioId, int? operatorId, MonthlyUtilizationGroup? groupBy, IEnumerable<int>? groupByFilterIds);
    }
}
