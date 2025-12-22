using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Repository.Interfaces;

public interface IAssetWatchFiltersRepository
{
    Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterAircraftSerialNumbers(int portfolioId);
    Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterAircraftSeries(int portfolioId);
    Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterEngineSeries(int portfolioId);
    Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterLessors(int portfolioId);
    Task<IEnumerable<IdNamePairModel>> GetAssetWatchFilterOperators(int portfolioId);
    Task<IEnumerable<CountriesRegionsModel>> GetCountriesAndRegions();
    Task<IEnumerable<StringIdNamePairModel>> GetRegions();
    Task<IEnumerable<StringIdNamePairModel>> GetAssetWatchFilterCities(List<string> countryCodes);
    Task<IEnumerable<StringIdNamePairModel>> GetAssetWatchFilterAirports(List<string> countryCodes);
}
