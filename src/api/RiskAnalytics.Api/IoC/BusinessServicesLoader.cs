using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Api.Business.Mappers;
using RiskAnalytics.Api.Business.Mappers.Interfaces;
using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Business.Services.AssetWatch;
using RiskAnalytics.Api.Business.Services.AssetWatchSavedSearches;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Business.Validators;
using RiskAnalytics.Api.Business.Validators.Interfaces;

namespace RiskAnalytics.Api.IoC;

public static class BusinessServicesLoader
{
    public static void LoadBusinessServices(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddTransient<IRiskAnalyticsAuthorizationService, RiskAnalyticsAuthorizationService>();
        serviceCollection.AddTransient<ISavedSearchAuthorizationService, SavedSearchAuthorizationService>();

        serviceCollection.AddTransient<ICacheKeyBuilder, CacheKeyBuilder>();
        serviceCollection.AddTransient<IPortfoliosService, PortfoliosService>();
        serviceCollection.AddTransient<IPortfolioAircraftService, PortfolioAircraftService>();
        serviceCollection.AddTransient<IPortfolioValidator, PortfolioValidator>();
        serviceCollection.AddTransient<ISavedSearchValidator, SavedSearchValidator>();
        serviceCollection.AddTransient<ISavedSearchRunReportValidator, SavedSearchRunReportValidator>();
        serviceCollection.AddTransient<IPortfolioAuthorizationService, PortfolioAuthorizationService>();
        serviceCollection.AddTransient<IAircraftService, AircraftService>();
        serviceCollection.AddTransient<IUtilizationService, UtilizationService>();
        serviceCollection.AddTransient<IMonthlyUtilizationMapper, MonthlyUtilizationMapper>();
        serviceCollection.AddTransient<ITrackedUtilizationService, TrackedUtilizationService>();
        serviceCollection.AddTransient<IGroundEventsService, GroundEventsService>();
        serviceCollection.AddTransient<ISavedSearchService, SavedSearchService>();
        serviceCollection.AddTransient<ISavedSearchConfigurationValidator, SavedSearchConfigurationValidator>();
        serviceCollection.AddTransient<ISavedSearchValidator, SavedSearchValidator>();
        serviceCollection.AddTransient<ISavedSearchAuthorizationService, SavedSearchAuthorizationService>();
        serviceCollection.AddTransient<IAssetWatchFiltersService, AssetWatchFiltersService>();
        serviceCollection.AddTransient<IAssetWatchMaintenanceActivitiesService, AssetWatchMaintenanceActivitiesService>();
        serviceCollection.AddTransient<IAssetWatchFlightDetailsService, AssetWatchFlightDetailsService>();
        serviceCollection.AddTransient<IAssetWatchTableService, AssetWatchTableService>();
        serviceCollection.AddTransient<IMonthlyUtilizationPerAircraftRequestValidator, MonthlyUtilizationPerAircraftRequestValidator>();
        serviceCollection.AddTransient<ISavedSearchRunReportsService, SavedSearchRunReportsService>();

    }
}
