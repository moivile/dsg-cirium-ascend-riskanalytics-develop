using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.Interfaces;

public interface ITrackedUtilizationRepository
{
    Task<IEnumerable<IdNameCountModel>> SummaryFlights(
        int portfolioId,
        AssetWatchSearchParameters assetWatchSearchParameters,
        AssetWatchGroupingOption assetWatchGroupingOption);
}
