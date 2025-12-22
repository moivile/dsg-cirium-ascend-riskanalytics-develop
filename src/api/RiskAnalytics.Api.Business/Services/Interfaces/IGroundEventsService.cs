using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface IGroundEventsService
{
    Task<IEnumerable<SummaryGroundEventsModel>> SummaryGroundEvents(string userId, int portfolioId, AssetWatchSearchParameters assetWatchSearchParameters, AssetWatchGroupingOption assetWatchGroupingOption);
}

