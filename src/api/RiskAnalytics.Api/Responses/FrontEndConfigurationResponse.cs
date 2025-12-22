namespace RiskAnalytics.Api.Responses;
public class FrontEndConfigurationResponse
{
    public Auth0ConfigurationResponse Auth0Configuration { get; set; } = null!;
    public GeneralConfigurationResponse GeneralConfiguration { get; set; } = null!;
}
