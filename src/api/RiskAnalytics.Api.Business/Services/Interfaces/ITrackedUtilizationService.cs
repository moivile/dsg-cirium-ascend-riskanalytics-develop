using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface ITrackedUtilizationService
{
    Task<IEnumerable<IdNameCountModel>> SummaryFlights(string userId, int portfolioId, AssetWatchSearchParameters assetWatchSearchParameters, AssetWatchGroupingOption assetWatchGroupingOption);
}
