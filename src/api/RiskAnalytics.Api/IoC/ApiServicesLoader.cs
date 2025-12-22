using Microsoft.AspNetCore.Authorization;
using RiskAnalytics.Api.Authorization;
using RiskAnalytics.Api.Responses;

namespace RiskAnalytics.Api.IoC;

public static class ApiServicesLoader
{
    public static void LoadApiServices(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        var auth0Configuration = new Auth0ConfigurationResponse();
        configuration.GetSection("Auth0").Bind(auth0Configuration);

        var generalConfiguration = new GeneralConfigurationResponse();
        configuration.GetSection("FrontEndGeneral").Bind(generalConfiguration);

        serviceCollection.AddSingleton(new FrontEndConfigurationResponse
        {
            Auth0Configuration = auth0Configuration,
            GeneralConfiguration = generalConfiguration
        });

        var riskAnalyticsMachineToMachineAuth0 = new RiskAnalyticsMachineToMachineAuth0Response();
        configuration.GetSection("Auth0MachineToMachine").Bind(riskAnalyticsMachineToMachineAuth0);

        serviceCollection.AddSingleton(riskAnalyticsMachineToMachineAuth0);
        serviceCollection.AddSingleton<IAuthorizationHandler, RiskAnalyticsUserHandler>();
    }
}
