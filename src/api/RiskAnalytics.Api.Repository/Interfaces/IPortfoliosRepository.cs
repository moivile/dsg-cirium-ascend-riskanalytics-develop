using RiskAnalytics.Api.Repository.Entities.Portfolios;

namespace RiskAnalytics.Api.Repository.Interfaces;

public interface IPortfoliosRepository
{
    Task<IEnumerable<Portfolio>> GetAll(string userId);

    Task<Portfolio?> Get(int id, bool isServiceUser = false);

    Task<int> Create(Portfolio portfolio);
    Task Update(Portfolio portfolio);

    Task Delete(int id, string userId);

    Task<bool> IsNameUnique(string name, string userId);
}
