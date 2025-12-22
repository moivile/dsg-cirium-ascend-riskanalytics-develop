using MapsterMapper;
using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository;

namespace RiskAnalytics.Api.Business.Services;

public class AircraftService : IAircraftService
{
    private readonly Repository.Dataplatform.Interfaces.IAircraftRepository aircraftRepository;
    private readonly IMapper mapper;
    private readonly IMemoryCache memoryCache;
    public AircraftService(
        Repository.Dataplatform.Interfaces.IAircraftRepository aircraftRepository,
        IMapper mapper,
        IMemoryCache memoryCache)
    {
        this.aircraftRepository = aircraftRepository;
        this.mapper = mapper;
        this.memoryCache = memoryCache;
    }

    public async Task<AircraftSearchModel> Search(SearchAircraftParameters searchAircraftRequest)
    {
        var result = new AircraftSearchModel();
        var cacheKey = $"{CacheSettings.CacheUnitPrefixForAircraftSearchResults}{BuildCacheKey(searchAircraftRequest)}";

        var cachedData = GetCachedData(cacheKey, searchAircraftRequest);

        if (cachedData != null)
        {
            return cachedData;
        }

        var aircraft = (await aircraftRepository.Search(searchAircraftRequest)).ToList();

        result = await PopulateFiltersAndTotalCount(searchAircraftRequest, result);

        result.Take = searchAircraftRequest.Take;
        result.Skip = searchAircraftRequest.Skip;

        result.AircraftList = mapper.Map<List<AircraftModel>>(aircraft.Take(searchAircraftRequest.Take));

        if (searchAircraftRequest.Keyword == null)
        {
            memoryCache.Set(cacheKey, result, TimeSpan.FromMinutes(CacheSettings.AircraftSearchResultCachePeriodInMinutes));
        }

        return result;
    }

    private AircraftSearchModel? GetCachedData(string cacheKey, SearchAircraftParameters searchAircraftRequest)
    {
        if (searchAircraftRequest.Keyword != null)
        {
            return null;
        }

        if (memoryCache.TryGetValue(cacheKey, out AircraftSearchModel? result))
        {
            return result;
        }

        return null;
    }

    private string BuildCacheKey(SearchAircraftParameters searchAircraftRequest)
    {
        var keyParts = new List<string>();

        if (searchAircraftRequest.ManufacturerIds?.Count>0)
        {
            keyParts.Add("m" + string.Join("_", searchAircraftRequest.ManufacturerIds.Order()));
        }

        if (searchAircraftRequest.AircraftMasterSeriesIds?.Count > 0)
        {
            keyParts.Add("s" + string.Join("_", searchAircraftRequest.AircraftMasterSeriesIds.Order()));
        }

        if (searchAircraftRequest.AircraftTypeIds?.Count > 0)
        {
            keyParts.Add("t" + string.Join("_", searchAircraftRequest.AircraftTypeIds.Order()));
        }

        if (searchAircraftRequest.OperatorCountryIds?.Count > 0)
        {
            keyParts.Add("c" + string.Join("_", searchAircraftRequest.OperatorCountryIds.Order()));
        }

        if (searchAircraftRequest.AircraftOperatorIds?.Count > 0)
        {
            keyParts.Add("o" + string.Join("_", searchAircraftRequest.AircraftOperatorIds.Order()));
        }

        if (searchAircraftRequest.LessorIds?.Count > 0)
        {
            keyParts.Add("l" + string.Join("_", searchAircraftRequest.LessorIds.Order()));
        }
        
        if (searchAircraftRequest.CompanyTypeIds?.Count > 0)
        {
            keyParts.Add("i" + string.Join("_", searchAircraftRequest.CompanyTypeIds.Order()));
        }

        if (searchAircraftRequest.StatusIds?.Count > 0)
        {
            keyParts.Add("as" + string.Join("_", searchAircraftRequest.StatusIds.Order()));
        }

        keyParts.Add("skip" + searchAircraftRequest.Skip);
        keyParts.Add("take" + searchAircraftRequest.Take);

        return string.Join('_', keyParts);
    }

    private async Task<AircraftSearchModel> PopulateFiltersAndTotalCount(SearchAircraftParameters searchAircraftRequest, AircraftSearchModel result)
    {
        var filterOptions = (await aircraftRepository.GetSearchFilterOptions(searchAircraftRequest)).ToList();

        result.Manufacturers = filterOptions.Where(i => i.Type == AircraftSearchFilterOptionType.Manufacturer).Select(i => new IdNamePairModel(i.Id, i.Name));
        result.AircraftTypes = filterOptions.Where(i => i.Type == AircraftSearchFilterOptionType.Type).Select(i => new IdNamePairModel(i.Id, i.Name));
        result.AircraftMasterSeries = filterOptions.Where(i => i.Type == AircraftSearchFilterOptionType.MasterSeries).Select(i => new IdNamePairModel(i.Id, i.Name));
        result.AircraftOperators = filterOptions.Where(i => i.Type == AircraftSearchFilterOptionType.Operator).Select(i => new IdNamePairModel(i.Id, i.Name));
        result.OperatorCountries = filterOptions.Where(i => i.Type == AircraftSearchFilterOptionType.OperatorCountry).Select(i => new IdNamePairModel(i.Id, i.Name));
        result.Lessors = filterOptions.Where(i => i.Type == AircraftSearchFilterOptionType.Lessor).Select(i => new IdNamePairModel(i.Id, i.Name));
        result.Statuses = filterOptions.Where(i => i.Type == AircraftSearchFilterOptionType.Status).Select(i => new IdNamePairModel(i.Id, i.Name));
        result.CompanyTypes = filterOptions.Where(i => i.Type == AircraftSearchFilterOptionType.CompanyType).Select(i => new IdNamePairModel(i.Id, i.Name));

        if (filterOptions.Any(i => i.Type == AircraftSearchFilterOptionType.TotalCount)
            && int.TryParse(filterOptions.First(i => i.Type == AircraftSearchFilterOptionType.TotalCount).Name, out _))
        {
            result.TotalCount = int.Parse(filterOptions.First(i => i.Type == AircraftSearchFilterOptionType.TotalCount).Name);
        }

        return result;
    }
}
