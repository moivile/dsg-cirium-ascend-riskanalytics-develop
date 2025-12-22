
namespace RiskAnalytics.Api.Common;

public static class CacheSettings
{
    public const string CacheUnitPrefixForAircraftSearchResults = "RiskAnalytics_AircraftSearch_Results_";

    public const string CacheUnitPrefixForAssetWatchGridResults = "RiskAnalytics_AssetWatchFlight_Results_";
    public const string CacheUnitPrefixForAssetWatchGridResultsCount = "RiskAnalytics_AssetWatchFlight_ResultCount";

    public const string CacheUnitPrefixForFlightDetailsResults = "RiskAnalytics_FlightDetails_Results_";
    public const string CacheUnitPrefixForFlightDetailsResultsCount = "RiskAnalytics_FlightDetails_ResultCount";
    public const int AircraftSearchResultCachePeriodInMinutes = 30;
    public const int AssetWatchCachePeriodInMinutes = 60;
    public const string CacheUnitPrefixForPortfolioResult = "RiskAnalytics_Portfolio_Aircraft_Results_";
    public const string CacheUnitPrefixForAssetWatchFiltersCitiesResult = "RiskAnalytics_AssetWatchFilters_Cities_Results_";
    public const string CacheUnitPrefixForAssetWatchFiltersAirportsResult = "RiskAnalytics_AssetWatchFilters_Airports_Results_";
    public const string CacheUnitPrefixForAssetWatchFiltersCountriesResult = "RiskAnalytics_AssetWatchFilters_Countries_Results_";
    public const string CacheUnitPrefixForAssetWatchSummaryFlightsResult = "RiskAnalytics_AssetWatchSummaryFlights_Results_";
    public const string CacheUnitPrefixForAssetWatchSummaryGroundEventsResult = "RiskAnalytics_AssetWatchSummaryGroundEvents_Results_";

    public const string MonthlyUtilizationGlobalBenchmarkResultsCachePrefix = "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Results";
    public const string MonthlyUtilizationGlobalBenchmarkGroupOptionsCacheKey = "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_GroupOptions";
    public const string MonthlyUtilizationGlobalBenchmarkOperatorsCacheKey = "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Operators";
    public const string MonthlyUtilizationGlobalBenchmarkLessorsCacheKey = "RiskAnalytics_MonthlyUtilization_GlobalBenchmark_Lessors";
    public const int MonthlyUtilizationCachePeriodInMinutes = 30;

    public const string MonthlyUtilizationPerAircraftCachePrefix = "RiskAnalytics_MonthlyUtilization_PerAircraft_Results_";

    public static object CacheUnitPrefixForAssetWatchMaintenanceActivities = "RiskAnalytics_AssetWatch_Activities";
}
