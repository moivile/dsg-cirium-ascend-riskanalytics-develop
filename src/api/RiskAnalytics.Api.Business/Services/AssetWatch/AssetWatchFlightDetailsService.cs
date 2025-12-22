using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Business.Services.AssetWatch;

public class AssetWatchFlightDetailsService : IAssetWatchFlightDetailsService
{
    private readonly IAssetWatchFlightDetailsRepository assetWatchRepository;
    private readonly IAircraftRepository aircraftRepository;

    private readonly IMemoryCache memoryCache;
    public AssetWatchFlightDetailsService(
        IAssetWatchFlightDetailsRepository assetWatchRepository,
        IMemoryCache memoryCache,
        IAircraftRepository aircraftRepository)
    {
        this.assetWatchRepository = assetWatchRepository;
        this.memoryCache = memoryCache;
        this.aircraftRepository = aircraftRepository;
    }

    public async Task<FlightsDetails> GetFlightDetails(int aircraftId, AssetWatchTableSearchParameters filterCriteria)
    {
        var cacheGridKey = $"{CacheSettings.CacheUnitPrefixForFlightDetailsResults}{Common.BuildCacheKey(aircraftId, filterCriteria, false)}";
        var cacheTotalResultCountKey = $"{CacheSettings.CacheUnitPrefixForFlightDetailsResultsCount}{Common.BuildCacheKey(aircraftId, filterCriteria, true)}";

        var cachedGridData = Common.GetCachedData<IEnumerable<FlightDetailsModel>>(memoryCache, cacheGridKey);
        var cachedTotalResultCount = Common.GetCachedData<int?>(memoryCache, cacheTotalResultCountKey);

        var result = new FlightsDetails();

        if (cachedGridData != null && cachedTotalResultCount != null)
        {
            result.FlightDetails = cachedGridData;
            result.TotalResultCount = cachedTotalResultCount.Value;
            return result;
        }

        var countTask = assetWatchRepository.AircraftFlightsCount(aircraftId, filterCriteria);
        var dataTask = assetWatchRepository.ListAircraftFlightDetails(aircraftId, filterCriteria);

        await Task.WhenAll(countTask, dataTask);

        result.TotalResultCount = await countTask;
        result.FlightDetails = await dataTask;

        result.FlightDetails = await ReplaceLastFlightOnGroundHours(aircraftId, result.FlightDetails);

        memoryCache.Set(cacheGridKey, result.FlightDetails, TimeSpan.FromMinutes(CacheSettings.AssetWatchCachePeriodInMinutes));
        memoryCache.Set(cacheTotalResultCountKey, result.TotalResultCount, TimeSpan.FromMinutes(CacheSettings.AssetWatchCachePeriodInMinutes));

        return result;
    }

    public async Task<IEnumerable<FlightDetailsModel>> ReplaceLastFlightOnGroundHours(int aircraftId, IEnumerable<FlightDetailsModel> flights)
    {
        var aircraftAogDetails = await aircraftRepository.Get(aircraftId);
        var lastFlight = flights.Where(flight => flight.NextDestinationAirport == null).FirstOrDefault();

        if(aircraftAogDetails == null  || aircraftAogDetails.Current_ground_event_duration_minutes == 0 || lastFlight == null)
        {
            return flights;
        }

        lastFlight.GroundEventTime = aircraftAogDetails.Current_ground_event_duration_minutes;

        return flights;
    }
}
