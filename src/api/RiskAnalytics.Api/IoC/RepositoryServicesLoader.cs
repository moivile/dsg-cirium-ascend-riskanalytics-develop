using Dapper;
using RiskAnalytics.Api.Repository;
using RiskAnalytics.Api.Repository.AssetWatch;
using RiskAnalytics.Api.Repository.AssetWatchSavedSearches;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Mappers;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;
using RiskAnalytics.Api.Repository.Portfolios;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

namespace RiskAnalytics.Api.IoC;

public static class RepositoryServicesLoader
{
    public static void LoadRepositoryServices(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        ConfigureDapper();

        var repositoryConfiguration = new RepositoryConfiguration();
        configuration.GetSection("SnowflakeRepository").Bind(repositoryConfiguration);
        serviceCollection.AddSingleton(repositoryConfiguration);

        // repositories
        serviceCollection.AddTransient<ISnowflakeRepository, SnowflakeRepository>();

        serviceCollection.AddTransient<IPortfoliosRepository, PortfoliosRepository>();
        serviceCollection.AddTransient<IAssetWatchFlightDetailsRepository, AssetWatchFlightDetailsRepository>();
        serviceCollection.AddTransient<IAssetWatchMaintenanceActivitiesRepository, AssetWatchMaintenanceActivitiesRepository>();
        serviceCollection.AddTransient<IAssetWatchFiltersRepository, AssetWatchFiltersRepository>();

        serviceCollection.AddTransient<IAssetWatchTableRepository, AssetWatchTableRepository>();
        serviceCollection.AddTransient<IAssetWatchTableRepository, AssetWatchTablePrecalculatedRepository>();

        serviceCollection.AddTransient<IPortfolioAircraftRepository, PortfolioAircraftRepository>();
        serviceCollection.AddTransient<IAircraftRepository, AircraftRepository>();
        serviceCollection.AddTransient<Repository.Dataplatform.Interfaces.IAircraftRepository, Repository.Dataplatform.AircraftRepository>();
        serviceCollection.AddTransient<IUtilizationRepository, UtilizationRepository>();
        serviceCollection.AddTransient<ITrackedUtilizationRepository, TrackedUtilizationRepository>();
        serviceCollection.AddTransient<IGroundEventsRepository, GroundEventsRepository>();
        serviceCollection.AddTransient<ISavedSearchesRepository, SavedSearchesRepository>();
        serviceCollection.AddTransient<ISavedSearchRunReportsRepository, SavedSearchRunReportsRepository>();
        serviceCollection.AddTransient<IGroupCountQueryRepository, GroupCountQueryRepository>();

        // mappers
        serviceCollection.AddTransient<IPortfoliosMapper, PortfoliosMapper>();
        serviceCollection.AddTransient<IAircraftsMapper, AircraftsMapper>();
        serviceCollection.AddTransient<IAircraftHistoryMapper, AircraftHistoryMapper>();
        serviceCollection.AddTransient<IAircraftReportedUtilizationMapper, AircraftReportedUtilizationMapper>();

        //query builders
        serviceCollection.AddTransient<IGetMonthlyUtilizationQueryBuilder, GetMonthlyUtilizationQueryBuilder>();
        serviceCollection.AddTransient<IGetGroupOptionsQueryBuilder, GetGroupOptionsQueryBuilder>();
        serviceCollection.AddTransient<IGetOperatorsQueryBuilder, GetOperatorsQueryBuilder>();
        serviceCollection.AddTransient<IGetLessorsQueryBuilder, GetLessorsQueryBuilder>();
        serviceCollection.AddTransient<IGetGroupCountQueryBuilder, GetGroupCountQueryBuilder>();
    }

    private static void ConfigureDapper()
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
    }
}
