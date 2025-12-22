using RiskAnalytics.Authorization.Auth0MachineToMachine;
using RiskAnalytics.Authorization.CaeAdmin;

namespace RiskAnalytics.Api.IoC;

public static class AuthorizationServicesLoader
{
    public static void LoadAuthorizationServices(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        // Auth0MachineToMachine
        var auth0MachineToMachineConfig = new Auth0MachineToMachineConfiguration();
        configuration.GetSection("Auth0MachineToMachine").Bind(auth0MachineToMachineConfig);
        serviceCollection.AddSingleton(auth0MachineToMachineConfig);

        serviceCollection.AddHttpClient<IAuth0MachineToMachineClient, Auth0MachineToMachineClient>();

        // CaeAdmin
        var caeAdminConfiguration = new CaeAdminConfiguration();
        configuration.GetSection("CaeAdmin").Bind(caeAdminConfiguration);
        serviceCollection.AddSingleton(caeAdminConfiguration);

        serviceCollection.AddHttpClient<ICaeAdminClient, CaeAdminClient>();
    }
}
