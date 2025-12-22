using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.AssetWatch;

public class AssetWatchFiltersService : IAssetWatchFiltersService
{
    private readonly IAssetWatchFlightDetailsRepository assetWatchRepository;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationService;
    private readonly IPortfoliosRepository portfoliosRepository;
    private readonly IAssetWatchFiltersRepository assetWatchFiltersRepository;
    private readonly IMemoryCache memoryCache;
    private readonly ICacheKeyBuilder cacheKeyBuilder;
    public AssetWatchFiltersService(IAssetWatchFlightDetailsRepository assetWatchRepository,
        IMemoryCache memoryCache,
        IPortfolioAuthorizationService portfolioAuthorizationService,
        IPortfoliosRepository portfoliosRepository,
        IAssetWatchFiltersRepository assetWatchFiltersRepository,
        ICacheKeyBuilder cacheKeyBuilder)
    {
        this.assetWatchRepository = assetWatchRepository;
        this.memoryCache = memoryCache;
        this.portfolioAuthorizationService = portfolioAuthorizationService;
        this.portfoliosRepository = portfoliosRepository;
        this.assetWatchFiltersRepository = assetWatchFiltersRepository;
        this.cacheKeyBuilder = cacheKeyBuilder;
    }
    public async Task<AssetWatchFilterResponseModel> GetFilters(int portfolioId, string userId)
    {
        var portfolio = await portfoliosRepository.Get(portfolioId);

        portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolio, userId);

        var cacheKey = cacheKeyBuilder.BuildPortfolioCacheKey(portfolioId);

        var assetWatchFiltersData = Common.GetCachedData<AssetWatchFilterResponseModel>(memoryCache, cacheKey);

        if (assetWatchFiltersData != null)
        {
            return assetWatchFiltersData;
        }

        var countriesTask = assetWatchFiltersRepository.GetCountriesAndRegions();
        var regionsTask = assetWatchFiltersRepository.GetRegions();
        var operatorsTask = assetWatchFiltersRepository.GetAssetWatchFilterOperators(portfolioId);
        var engineSeriesTask = assetWatchFiltersRepository.GetAssetWatchFilterEngineSeries(portfolioId);
        var aircraftSeriesTask = assetWatchFiltersRepository.GetAssetWatchFilterAircraftSeries(portfolioId);
        var aircraftSerialNumbersTask = assetWatchFiltersRepository.GetAssetWatchFilterAircraftSerialNumbers(portfolioId);
        var lessorsTask = assetWatchFiltersRepository.GetAssetWatchFilterLessors(portfolioId);

        await Task.WhenAll(operatorsTask, engineSeriesTask, aircraftSeriesTask, aircraftSerialNumbersTask, lessorsTask);

        assetWatchFiltersData = new AssetWatchFilterResponseModel
        {
            Countries = await countriesTask,
            Regions = await regionsTask,
            Operators = await operatorsTask,
            EngineSeries = await engineSeriesTask,
            AircraftSeries = await aircraftSeriesTask,
            AircraftSerialNumbers = await aircraftSerialNumbersTask,
            Lessors = await lessorsTask
        };

        memoryCache.Set(cacheKey, assetWatchFiltersData, TimeSpan.FromMinutes(CacheSettings.AssetWatchCachePeriodInMinutes));

        return assetWatchFiltersData;
    }

    public async Task<IEnumerable<StringIdNamePairModel>> GetAssetWatchFilterCities(List<string> countryCodes)
    {
        var cacheKey = CacheSettings.CacheUnitPrefixForAssetWatchFiltersCitiesResult + "ct" + string.Join("_", String.Concat(countryCodes).Replace(" ", string.Empty));
        var assetWatchCitiesData = Common.GetCachedData<IEnumerable<StringIdNamePairModel>>(memoryCache, cacheKey);
        if (assetWatchCitiesData != null)
        {
            return assetWatchCitiesData;
        }
        var citiesFilterData = await assetWatchFiltersRepository.GetAssetWatchFilterCities(countryCodes);
        return citiesFilterData;
    }
    public async Task<IEnumerable<StringIdNamePairModel>> GetAssetWatchFilterAirports(List<string> countryCodes)
    {
        var cacheKey = CacheSettings.CacheUnitPrefixForAssetWatchFiltersAirportsResult + "ap" + string.Join("_", String.Concat(countryCodes).Replace(" ", string.Empty));
        var assetWatchAirportsData = Common.GetCachedData<IEnumerable<StringIdNamePairModel>>(memoryCache, cacheKey);
        if (assetWatchAirportsData != null)
        {
            return assetWatchAirportsData;
        }
        var airportsFilterData = await assetWatchFiltersRepository.GetAssetWatchFilterAirports(countryCodes);
        return airportsFilterData;
    }
}
