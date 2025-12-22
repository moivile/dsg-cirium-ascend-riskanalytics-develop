using RiskAnalytics.Api.Repository.Models;
using System.Security.Claims;

namespace RiskAnalytics.Api.Business.Validators.Interfaces
{
    public interface IMonthlyUtilizationPerAircraftRequestValidator
    {
        Exception ValidateMonthluUtilizationPerAircraftRequest(
        int portfolioId,
        int endMonthIndex,
        int startMonthIndex,
        int endYear,
        int startYear,
        bool isEmissions,
        int? operatorId,
        int? lessorId,
        ClaimsPrincipal user,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds);
    }

}