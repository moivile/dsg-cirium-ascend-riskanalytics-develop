using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Business.Services;

public class TrackedUtilizationService : ITrackedUtilizationService
{
    private readonly ITrackedUtilizationRepository trackedUtilizationRepository;
    private readonly IPortfoliosRepository portfoliosRepository;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationService;
    private readonly IMemoryCache memoryCache;

    public TrackedUtilizationService(
        ITrackedUtilizationRepository trackedUtilizationRepository,
        IPortfolioAuthorizationService portfolioAuthorizationService,
        IPortfoliosRepository portfoliosRepository,
        IMemoryCache memoryCache)
    {
        this.trackedUtilizationRepository = trackedUtilizationRepository;
        this.portfolioAuthorizationService = portfolioAuthorizationService;
        this.portfoliosRepository = portfoliosRepository;
        this.memoryCache = memoryCache;
    }

    public async Task<IEnumerable<IdNameCountModel>> SummaryFlights(
        string userId,
        int portfolioId,
        AssetWatchSearchParameters assetWatchSearchParameters,
        AssetWatchGroupingOption assetWatchGroupingOption)
    {
        var portfolio = await portfoliosRepository.Get(portfolioId);

        portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolio, userId);

        var cacheKey = $"{CacheSettings.CacheUnitPrefixForAssetWatchSummaryFlightsResult}{BuildCacheKey(portfolioId, assetWatchSearchParameters, assetWatchGroupingOption)}";

        var data = GetCachedData<IEnumerable<IdNameCountModel>>(cacheKey);

        if (data != null)
        {
            return data;
        }

        data = await trackedUtilizationRepository.SummaryFlights(portfolioId, assetWatchSearchParameters, assetWatchGroupingOption);

        memoryCache.Set(cacheKey, data, TimeSpan.FromMinutes(CacheSettings.AssetWatchCachePeriodInMinutes));

        return data;
    }

    private T? GetCachedData<T>(string cacheKey)
    {
        if (memoryCache.TryGetValue(cacheKey, out object? result))
        {
            if (result is T)
            {
                return (T)result;
            }
        }

        return default;
    }

    private string BuildCacheKey(int portfolioId, AssetWatchSearchParameters filterCriteria, AssetWatchGroupingOption assetWatchGroupingOption)
    {
        var keyParts = new List<string>
        {
            "p" + string.Join("_", portfolioId.ToString()),
            "grp_" + Enum.GetName(typeof(AssetWatchGroupingOption), assetWatchGroupingOption)
        };

        if (filterCriteria.DateFrom.HasValue)
        {
            keyParts.Add("sd" + string.Join("_", filterCriteria.DateFrom.Value.DayOfYear.ToString(), "_", filterCriteria.DateFrom.Value.Year.ToString()));
        }

        if (filterCriteria.DateTo.HasValue)
        {
            keyParts.Add("ed" + string.Join("_", filterCriteria.DateTo.Value.DayOfYear.ToString(), "_", filterCriteria.DateTo.Value.Year.ToString()));
        }

        if (filterCriteria.CountryCodes?.Count() > 0)
        {
            keyParts.Add("cy" + string.Join("_", String.Concat(filterCriteria.CountryCodes).Replace(" ", string.Empty)));
        }

        if (filterCriteria.Cities?.Count() > 0)
        {
            keyParts.Add("ct" + string.Join("_", String.Concat(filterCriteria.Cities).Replace(" ", string.Empty)));
        }

        if (filterCriteria.AirportCodes?.Count() > 0)
        {
            keyParts.Add("ap" + string.Join("_", String.Concat(filterCriteria.AirportCodes).Replace(" ", string.Empty)));
        }
        if (filterCriteria.RegionCodes?.Count() > 0)
        {
            keyParts.Add("g" + string.Join("_", String.Concat(filterCriteria.RegionCodes).Replace(" ", string.Empty)));

        }
        if (filterCriteria.OperatorIds?.Count > 0)
        {
            keyParts.Add("o" + string.Join("_", string.Concat(filterCriteria.OperatorIds).Replace(" ", string.Empty)));

        }
        if (filterCriteria.LessorIds?.Count > 0)
        {
            keyParts.Add("l" + string.Join("_", String.Concat(filterCriteria.LessorIds).Replace(" ", string.Empty)));

        }
        if (filterCriteria.AircraftSeriesIds?.Count > 0)
        {
            keyParts.Add("a" + string.Join("_", String.Concat(filterCriteria.AircraftSeriesIds).Replace(" ", string.Empty)));

        }
        if (filterCriteria.EngineSerieIds?.Count > 0)
        {
            keyParts.Add("e" + string.Join("_", String.Concat(filterCriteria.EngineSerieIds).Replace(" ", string.Empty)));

        }
        if (filterCriteria.AircraftIds?.Count > 0)
        {
            keyParts.Add("s" + string.Join("_", String.Concat(filterCriteria.AircraftIds).Replace(" ", string.Empty)));

        }
        keyParts.Add("rC" + string.Join("_", filterCriteria.RouteCategory.ToString()));

        return string.Join('_', keyParts);
    }
}
