namespace RiskAnalytics.Authorization.Auth0MachineToMachine;

public class Auth0MachineToMachineConfiguration
{
    public string Url { get; set; } = null!;

    public string ClientId { get; set; } = null!;

    public string ClientSecret { get; set; } = null!;

    public string Audience { get; set; } = null!;
}
