using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.AssetWatch;

public static class Common
{
    public static T? GetCachedData<T>(IMemoryCache memoryCache, string cacheKey)
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

    public static string BuildCacheKey(int portfolioId, AssetWatchTableSearchParameters filterCriteria, bool IsGridCount)
    {
        var keyParts = new List<string>
            {
                "p" + string.Join("_", portfolioId.ToString())
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
        if (filterCriteria.ShowAircraftOnGround)
        {
            keyParts.Add("ShowAircraftOnGround" + string.Join("_", filterCriteria.ShowAircraftOnGround));
        }
        else
        {
            if (filterCriteria.MinNoOfFlights > 0)
            {
                keyParts.Add("minF" + string.Join("_", filterCriteria.MinNoOfFlights));
            }
            if (filterCriteria.MinTotalGroundStay > 0)
            {
                keyParts.Add("minT" + string.Join("_", filterCriteria.MinTotalGroundStay));
            }
            if (filterCriteria.MaintenanceActivityIds?.Count > 0)
            {
                keyParts.Add("mAct" + string.Join("_", String.Concat(filterCriteria.MaintenanceActivityIds).Replace(" ", string.Empty)));
            }
        }
        if (filterCriteria.MinIndividualGroundStay > 0)
        {
            keyParts.Add("minI" + string.Join("_", filterCriteria.MinIndividualGroundStay));
        }
        if (filterCriteria.MinCurrentGroundStay > 0)
        {
            keyParts.Add("minG" + string.Join("_", filterCriteria.MinCurrentGroundStay));
        }
        if (filterCriteria.MaxIndividualGroundStay > 0)
        {
            keyParts.Add("maxI" + string.Join("_", filterCriteria.MaxIndividualGroundStay));
        }
        if (filterCriteria.MaxCurrentGroundStay > 0)
        {
            keyParts.Add("maxCG" + string.Join("_", filterCriteria.MaxCurrentGroundStay));
        }
        if (filterCriteria.RouteCategory != null)
        {
            keyParts.Add("rC" + string.Join("_", filterCriteria.RouteCategory.ToString()));
        }

        if (!IsGridCount)
        {
            if (filterCriteria.SortColumn?.Trim().Length > 0)
            {
                keyParts.Add("sortCol" + string.Join("_", filterCriteria.SortColumn));
            }
            if (filterCriteria.SortOrder?.Trim().Length > 0)
            {
                keyParts.Add("sortOrd" + string.Join("_", filterCriteria.SortOrder));
            }
            keyParts.Add("skip" + filterCriteria.Skip);
            keyParts.Add("take" + filterCriteria.Take);
        }

        return string.Join('_', keyParts);
    }
}
