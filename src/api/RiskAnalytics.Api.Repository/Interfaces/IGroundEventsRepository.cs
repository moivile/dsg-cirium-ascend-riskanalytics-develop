using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.Interfaces
{
    public interface IGroundEventsRepository
    {
        Task<IEnumerable<SummaryGroundEventsModel>> SummaryGroundEvents(int portfolioId,
            AssetWatchSearchParameters assetWatchSearchParameters,
            AssetWatchGroupingOption assetWatchGroupingOption);
    }
}
