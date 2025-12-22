using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Repository.Interfaces;

public interface IAssetWatchTableRepository
{
    int Priority { get; }

    bool CanHandle(AssetWatchTableSearchParameters assetWatchTableSearchParameters);
    Task<IEnumerable<AssetWatchListDataGridModel>> GetTrackedUtilizationData(int portfolioId, AssetWatchTableSearchParameters filterCriteria, bool isServiceUser = false);

    Task<IEnumerable<AssetWatchListDataGridModel>> GetPortfolioAircraft(int portfolioId, AssetWatchTableSearchParameters filterCriteria, bool isServiceUser = false);
    Task<AssetWatchGeographicFilterValues> GetGeographicFilterValues(AssetWatchTableSearchParameters filterCriteria);

    Task<DateTime> GetDateModified(int portfolioId);
}
