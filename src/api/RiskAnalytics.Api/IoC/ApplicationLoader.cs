namespace RiskAnalytics.Api.IoC;

public static class ApplicationLoader
{
    public static void LoadApplicationServices(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        serviceCollection.LoadApiServices(configuration);
        serviceCollection.LoadBusinessServices();
        serviceCollection.LoadAuthorizationServices(configuration);
        serviceCollection.LoadRepositoryServices(configuration);
        serviceCollection.LoadMappings();
    }
}
