using RiskAnalytics.Api.Model;
namespace RiskAnalytics.Api.Business.Services.Interfaces;
public interface IAssetWatchFiltersService
{
    Task<AssetWatchFilterResponseModel> GetFilters(int portfolioId, string userId);
    Task<IEnumerable<StringIdNamePairModel>> GetAssetWatchFilterCities(List<string> countryCodes);
    Task<IEnumerable<StringIdNamePairModel>> GetAssetWatchFilterAirports(List<string> countryCodes);
}
