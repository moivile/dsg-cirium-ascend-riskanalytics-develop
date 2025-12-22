using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface IPortfolioAircraftService
{
    Task<IEnumerable<AircraftModel>> GetAll(int portfolioId, string userId, bool isServiceUser = false);
}
