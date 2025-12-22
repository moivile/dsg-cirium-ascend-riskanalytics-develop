using System.Security.Claims;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface IUtilizationService
{
    Task<IEnumerable<IEnumerable<MonthlyUtilization>>> GetMonthlyUtilization(
        int? portfolioId,
        ClaimsPrincipal user,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds,
        int? operatorId,
        int? lessorId,
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
        ClaimsPrincipal user,
        int? operatorId,
        int? lessorId,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds);

    Task<UtilizationGroupOptionsModel> GetGroupOptions(int? portfolioId, int? operatorId, int? lessorId, string userId);

    Task<IEnumerable<IdNamePairModel>> GetOperators(int? portfolioId, int? lessorId, MonthlyUtilizationGroup? groupBy, IReadOnlyCollection<int>? groupByFilterIds, string userId);

    Task<IEnumerable<IdNamePairModel>> GetLessors(int? portfolioId, int? operatorId, MonthlyUtilizationGroup? groupBy, IReadOnlyCollection<int>? groupByFilterIds, string userId);


    Task<IList<IEnumerable<MonthlyUtilization>>> GetGroupCounts(
            int? portfolioId,
            MonthlyUtilizationGroup? groupBy,
            IReadOnlyCollection<int>? groupByFilterIds,
            int? operatorId,
            int? lessorId,
            IList<IEnumerable<MonthlyUtilization>> monthlyUtilizations,
            bool includeBaseline);
}
