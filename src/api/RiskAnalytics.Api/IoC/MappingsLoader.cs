using Mapster;
using MapsterMapper;
using RiskAnalytics.Api.Business.Mappers;
using System.Reflection;

namespace RiskAnalytics.Api.IoC;

public static class MappingsLoader
{
    public static IServiceCollection LoadMappings(this IServiceCollection services)
    {
        var config = TypeAdapterConfig.GlobalSettings;
        config.Scan(Assembly.GetExecutingAssembly());

        // register external mappers
        var entityAircraftToModelMappingConfig = new EntityAircraftToModelMappingConfig();
        entityAircraftToModelMappingConfig.Register(config);

        var savedSearchModelToEmailAlertsUserSavedSearchEntityMapper = new SavedSearchEntityToEmailAlertsUserSavedSearchModelMapper();
        savedSearchModelToEmailAlertsUserSavedSearchEntityMapper.Register(config);

        var savedSearchModelToSavedSearchEntityMapper = new SavedSearchModelToSavedSearchEntityMapper();
        savedSearchModelToSavedSearchEntityMapper.Register(config);

        var savedSearchEntityToSavedSearchModelMapper = new SavedSearchEntityToSavedSearchModelMapper();
        savedSearchEntityToSavedSearchModelMapper.Register(config);

        var emailAlertsUserSavedSearchModelToAssetWatchTableSearchParametersMapper = new EmailAlertsUserSavedSearchModelToAssetWatchTableSearchParametersMapper();
        emailAlertsUserSavedSearchModelToAssetWatchTableSearchParametersMapper.Register(config);

        services.AddSingleton(config);
        services.AddScoped<IMapper, ServiceMapper>();

        return services;
    }
}
