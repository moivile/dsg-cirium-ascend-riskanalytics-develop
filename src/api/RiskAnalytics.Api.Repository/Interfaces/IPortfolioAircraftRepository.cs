using RiskAnalytics.Api.Repository.Entities.DataPlatform;

namespace RiskAnalytics.Api.Repository.Interfaces;
public interface IPortfolioAircraftRepository
{
    Task<IEnumerable<Aircraft>> GetAll(int portfolioId);

    Task Insert(int portfolioId, IEnumerable<Aircraft> portfolioAircraft);

    Task DeleteAll(int portfolioId);
}
