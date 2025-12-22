namespace RiskAnalytics.Api.Responses
{
    public class Auth0ConfigurationResponse
    {
        public string ClientId { get; set; } = null!;
        public string Domain { get; set; } = null!;
        public string Audience { get; set; } = null!;
    }
}
