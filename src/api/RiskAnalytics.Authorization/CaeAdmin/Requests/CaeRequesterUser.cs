using Newtonsoft.Json;

namespace RiskAnalytics.Authorization.CaeAdmin.Requests
{
    public class CaeRequesterUser
    {
        public CaeRequesterUser(string auth0Id)
        {
            Auth0Id = auth0Id;
        }

        [JsonProperty(PropertyName = "auth0Id")]
        public string Auth0Id { get; set; }

        [JsonProperty(PropertyName = "ip")]
        public string? Ip { get; set; }
    }
}
