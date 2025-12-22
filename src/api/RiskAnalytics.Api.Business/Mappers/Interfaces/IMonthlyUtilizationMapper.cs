using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Business.Mappers.Interfaces;

public interface IMonthlyUtilizationMapper
{
    IList<IEnumerable<MonthlyUtilization>> Map(
        IList<IEnumerable<MonthlyUtilization>> monthlyUtilizations);
}
