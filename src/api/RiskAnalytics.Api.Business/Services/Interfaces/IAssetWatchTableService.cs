using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.AssetWatch;

public interface IAssetWatchTableService
{
    Task<AssetWatchListGridDataResponseModel> GetTableData(int portfolioId, AssetWatchTableSearchParameters filterCriteria, string userId, bool isServiceUser = false);
}
