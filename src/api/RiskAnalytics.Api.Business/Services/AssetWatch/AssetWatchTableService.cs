using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.AssetWatch;

public class AssetWatchTableService : IAssetWatchTableService
{
    private readonly IPortfolioAuthorizationService portfolioAuthorizationService;
    private readonly IPortfoliosRepository portfoliosRepository;
    private readonly List<IAssetWatchTableRepository> assetWatchTableRepositories;
    private readonly IMemoryCache memoryCache;
    private readonly IAssetWatchMaintenanceActivitiesService assetWatchMaintenanceActivitiesService;

    public AssetWatchTableService(
        IMemoryCache memoryCache,
        IPortfolioAuthorizationService portfolioAuthorizationService,
        IPortfoliosRepository portfoliosRepository,
        IAssetWatchMaintenanceActivitiesService assetWatchMaintenanceActivitiesService,
        IEnumerable<IAssetWatchTableRepository> assetWatchTableRepositories)
    {
        this.memoryCache = memoryCache;
        this.portfolioAuthorizationService = portfolioAuthorizationService;
        this.portfoliosRepository = portfoliosRepository;
        this.assetWatchTableRepositories = assetWatchTableRepositories.ToList();
        this.assetWatchMaintenanceActivitiesService = assetWatchMaintenanceActivitiesService;
    }
    private IAssetWatchTableRepository GetPeriodRepository(AssetWatchTableSearchParameters assetWatchTableSearchParameters)
    {
        foreach (var repository in assetWatchTableRepositories.OrderByDescending(r => r.Priority))
        {
            if (repository.CanHandle(assetWatchTableSearchParameters))
            {
                return repository;
            }
        }

        throw new NullReferenceException($"No repository found for period {assetWatchTableSearchParameters.Period}");
    }

    public async Task<AssetWatchListGridDataResponseModel> GetTableData(int portfolioId, AssetWatchTableSearchParameters filterCriteria, string userId, bool isServiceUser = false)
    {
        var portfolio = await portfoliosRepository.Get(portfolioId, isServiceUser);
        portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolio, userId);

        var repository = GetPeriodRepository(filterCriteria);
        var dateModifiedTask = await repository.GetDateModified(portfolioId);
        var portfolioDateModified = dateModifiedTask.ToString("yyyy-MM-dd HH:mm:ss.fff");

        var cacheGridKey = $"{CacheSettings.CacheUnitPrefixForAssetWatchGridResults}{Common.BuildCacheKey(portfolioId, filterCriteria, false)}_{portfolioDateModified}";

        var cachedGridData = Common.GetCachedData<IEnumerable<AssetWatchListDataGridModel>>(memoryCache, cacheGridKey);

        var result = new AssetWatchListGridDataResponseModel();

        if (cachedGridData != null)
        {
            result.AssetWatchListDataGrid = cachedGridData;
            return result;
        }

        var checkFilterCriteria = HasValuesExcludingSpecifiedParameters(filterCriteria);
        var portfolioAircraftTask = repository.GetPortfolioAircraft(portfolioId, filterCriteria, isServiceUser);
        var trackedUtilizationTask = repository.GetTrackedUtilizationData(portfolioId, filterCriteria);
        var filterValues = new AssetWatchGeographicFilterValues();
        if (checkFilterCriteria)
        {
            var filterValuesTask = repository.GetGeographicFilterValues(filterCriteria);
            await Task.WhenAll(filterValuesTask, portfolioAircraftTask, trackedUtilizationTask);
            filterValues = filterValuesTask.Result;
        }
        else
        {
            filterValues = null;
            await Task.WhenAll(portfolioAircraftTask, trackedUtilizationTask);
        }
        var portfolioAircraft = portfolioAircraftTask.Result;
        var tuArray = trackedUtilizationTask.Result;

        result.AssetWatchListDataGrid = CombineResults(filterCriteria, portfolioAircraft, tuArray, filterValues);

        if (!(filterCriteria.Period == AssetWatchSearchPeriod.Last6Months || filterCriteria.Period == AssetWatchSearchPeriod.Last12Months))
        {
            if (filterCriteria.ShowAircraftOnGround || filterCriteria.MaintenanceActivityIds?.Count > 0)
            {
                result.AssetWatchListDataGrid = result.AssetWatchListDataGrid.Where(item => tuArray.Any(otherItem => otherItem.AircraftId == item.AircraftId));
            }
        }

        result.AssetWatchListDataGrid = await ReplaceActivityIdsWithNames(result.AssetWatchListDataGrid.ToList());

        memoryCache.Set(cacheGridKey, result.AssetWatchListDataGrid, TimeSpan.FromMinutes(CacheSettings.AssetWatchCachePeriodInMinutes));

        return result;
    }

    private IEnumerable<AssetWatchListDataGridModel> CombineResults(AssetWatchTableSearchParameters filterCriteria, IEnumerable<AssetWatchListDataGridModel> portfolioAircraft, IEnumerable<AssetWatchListDataGridModel> trackedUtilization, AssetWatchGeographicFilterValues filterValues)
    {
        var aircraftIdsToRemove = Array.Empty<int>();
        foreach (var row in portfolioAircraft)
        {
            var trackedUtilizationDetails = trackedUtilization.FirstOrDefault(ge => ge.AircraftId == row.AircraftId);
            row.TotalGroundStayHours = row.CurrentGroundEventDurationMinutes.ConvertMinutesIntoHoursAndRoundOff();
            if (ShouldRemoveRowBasedOnFilterCriteria(trackedUtilizationDetails, filterCriteria, row, filterValues))
            {
                aircraftIdsToRemove = aircraftIdsToRemove.Append(row.AircraftId).ToArray();
                continue;
            }
            row.NumberOfFlights = trackedUtilizationDetails?.NumberOfFlights;
            row.TotalFlightMinutes = trackedUtilizationDetails?.TotalFlightMinutes;
            row.TotalGroundStayHours = trackedUtilizationDetails?.TotalGroundStayHours.ConvertMinutesIntoHoursAndRoundOff();
            row.TimesBetweenMinMaxIndGroundStay = (filterCriteria.MinIndividualGroundStay == 0 && filterCriteria.MaxIndividualGroundStay == 0) ? null : trackedUtilizationDetails?.TimesBetweenMinMaxIndGroundStay;
            row.MaintenanceActivity = trackedUtilizationDetails?.MaintenanceActivity;
        }
        portfolioAircraft = portfolioAircraft.Where(a =>
            !aircraftIdsToRemove.Contains(a.AircraftId)
        );
        portfolioAircraft = FilterBySteppers(portfolioAircraft, filterCriteria.MinNoOfFlights, filterCriteria.MinTotalGroundStay, filterCriteria.MinIndividualGroundStay, filterCriteria.MinCurrentGroundStay, filterCriteria.MaxCurrentGroundStay).ToList();

        return portfolioAircraft;
    }

    public bool ShouldRemoveRowBasedOnFilterCriteria(AssetWatchListDataGridModel? trackedUtilizationDetails, AssetWatchTableSearchParameters filter, AssetWatchListDataGridModel row, AssetWatchGeographicFilterValues filterValues)
    {
        var doesRowMatch = DoesRowMatchGeographicFilterCriteria(filterValues, row);
        if (!doesRowMatch && filter.ShowAircraftOnGround)
        {
            return true;
        }
        if ((trackedUtilizationDetails == null) && filterValues == null)
        {
            return false;
        }
        if ((trackedUtilizationDetails == null) && filterValues != null && !DoesRowMatchFilterCriteria(filter, row, filterValues))
        {
            return true;
        }
        return false;
    }

    public bool HasValuesExcludingSpecifiedParameters(AssetWatchTableSearchParameters filter)
    {
        var hasValue = false;
        hasValue |= filter.MaintenanceActivityIds?.Any() ?? false;
        hasValue |= filter.MinNoOfFlights != 0;
        hasValue |= filter.MinTotalGroundStay != 0;
        hasValue |= filter.MinIndividualGroundStay != 0;
        hasValue |= filter.MaxIndividualGroundStay != 0;
        hasValue |= filter.MaxCurrentGroundStay != 0;
        hasValue |= filter.MinCurrentGroundStay != 0;
        hasValue |= filter.RegionCodes?.Any() ?? false;
        hasValue |= filter.RouteCategory != null;
        hasValue |= filter.OperatorIds?.Any() ?? false;
        hasValue |= filter.LessorIds?.Any() ?? false;
        hasValue |= filter.AircraftSeriesIds?.Any() ?? false;
        hasValue |= filter.EngineSerieIds?.Any() ?? false;
        hasValue |= filter.AircraftIds?.Any() ?? false;
        hasValue |= filter.CountryCodes?.Any() ?? false;
        hasValue |= filter.Cities?.Any() ?? false;
        hasValue |= filter.AirportCodes?.Any() ?? false;
        return hasValue;
    }

    public bool DoesRowMatchFilterCriteria(AssetWatchTableSearchParameters filter, AssetWatchListDataGridModel row, AssetWatchGeographicFilterValues filterValues)
    {
        bool isMatch = true;

        if (row.CurrentGroundEventDurationMinutes == null)
        {
            return false;
        }

        if (row.NumberOfFlights < filter.MinNoOfFlights &&
            row.TotalGroundStayHours < filter.MinTotalGroundStay &&
            row.TimesBetweenMinMaxIndGroundStay < filter.MinIndividualGroundStay)
        {
            return false;
        }
        if (row.CurrentGroundEventDurationMinutes < (filter.MinCurrentGroundStay * 60))
        {
            return false;
        }

        if (filter.RouteCategory != null
            && row.RouteCategory != filter.RouteCategory.Value.ToString())
        {
            return false;
        }

        if (!DoesRowMatchGeographicFilterCriteria(filterValues, row))
        {
            return false;
        }

        return isMatch;
    }

    public bool DoesRowMatchGeographicFilterCriteria(AssetWatchGeographicFilterValues filterValues, AssetWatchListDataGridModel row)
    {
        if (
             filterValues != null && filterValues.Regions?.Count > 0
            && (row.Region == null || !filterValues.Regions.Contains(row.Region))
        )
        {
            return false;
        }
        if (
            filterValues != null && filterValues.Countries?.Count > 0
            && (row.Country == null || !filterValues.Countries.Contains(row.Country))
        )
        {
            return false;
        }
        if (
            filterValues != null && filterValues.Cities?.Count > 0
            && (row.City == null || !filterValues.Cities.Contains(row.City))
        )
        {
            return false;
        }
        if (filterValues != null && filterValues.Airports?.Count > 0 && (row.CurrentGroundEventAirportName == null || !filterValues.Airports.Contains(row.CurrentGroundEventAirportName)))
        {
            return false;
        }

        return true;
    }
    public IEnumerable<AssetWatchListDataGridModel> FilterBySteppers(IEnumerable<AssetWatchListDataGridModel> result, int minNoOfFlights, int minTotalGroundStay, int minIndividualGroundStay, int minCurrentGroundStay, int maxCurrentGroundStay)
    {
        const int minutesInAnHour = 60;

        if (minNoOfFlights == 0 && minTotalGroundStay == 0 && minIndividualGroundStay == 0 && minCurrentGroundStay == 0 && maxCurrentGroundStay == 0)
        {
            return result;
        }

        if (minCurrentGroundStay > 0 && maxCurrentGroundStay > 0)
        {
            int currentMinDuration = minCurrentGroundStay * minutesInAnHour;
            int currentMaxDuration = maxCurrentGroundStay * minutesInAnHour;
            return result.Where(item => item.CurrentGroundEventDurationMinutes >= currentMinDuration && item.CurrentGroundEventDurationMinutes <= currentMaxDuration);
        }

        if (minCurrentGroundStay > 0)
        {
            int currentMinDuration = minCurrentGroundStay * minutesInAnHour;
            return result.Where(item => item.CurrentGroundEventDurationMinutes >= currentMinDuration);
        }

        if (maxCurrentGroundStay > 0)
        {
            int currentMaxDuration = maxCurrentGroundStay * minutesInAnHour;
            return result.Where(item => item.CurrentGroundEventDurationMinutes <= currentMaxDuration);
        }

        return result.Where(item =>
            (minNoOfFlights > 0 && item.NumberOfFlights >= minNoOfFlights) ||
            (minTotalGroundStay > 0 && item.TotalGroundStayHours >= minTotalGroundStay) ||
            (minIndividualGroundStay > 0 && item.TimesBetweenMinMaxIndGroundStay > 0)
        );
    }


    private async Task<List<AssetWatchListDataGridModel>> ReplaceActivityIdsWithNames(List<AssetWatchListDataGridModel> gridRows)
    {
        var activities = await GetActivities();

        foreach (var row in gridRows)
        {
            if (row.MaintenanceActivity == null || row.MaintenanceActivity.Trim().Length < 1)
            {
                continue;
            }

            var activityIds = row.MaintenanceActivity.Replace("[", "").Replace("]", "").Split(",").Select(id => id.Trim()).Distinct().ToArray();
            var activityNames = new List<string>();

            foreach (var activityId in activityIds)
            {
                var activity = activities.FirstOrDefault(a => a.Id == int.Parse(activityId));

                if (activity != null)
                {
                    activityNames.Add(activity.Name);
                }
            }

            row.MaintenanceActivity = string.Join(",", activityNames);
        }

        return gridRows;
    }

    private async Task<IEnumerable<IdNamePairModel>> GetActivities()
    {
        var cacheKey = $"{CacheSettings.CacheUnitPrefixForAssetWatchMaintenanceActivities}";

        var activities = Common.GetCachedData<IEnumerable<IdNamePairModel>>(memoryCache, cacheKey);

        if (activities != null)
        {
            return activities;
        }

        activities = await assetWatchMaintenanceActivitiesService.GetMaintenanceActivities();

        memoryCache.Set(cacheKey, activities, TimeSpan.FromMinutes(CacheSettings.AssetWatchCachePeriodInMinutes));

        return activities;
    }
}
