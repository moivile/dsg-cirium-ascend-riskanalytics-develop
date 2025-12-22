
using RiskAnalytics.Api.Repository.Entities.Portfolios;

namespace RiskAnalytics.Api.Business.Validators.Interfaces
{
    public interface IPortfolioValidator
    {
        Task IsValidOrThrow(Portfolio portfolio);
    }
}
