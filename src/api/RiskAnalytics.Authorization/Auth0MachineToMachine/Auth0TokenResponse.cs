using Newtonsoft.Json;

namespace RiskAnalytics.Authorization.Auth0MachineToMachine
{
    public class Auth0TokenResponse
    {
        public Auth0TokenResponse(string accessToken, int expiresIn)
        {
            AccessToken = accessToken;
            ExpiresIn = expiresIn;
        }

        [JsonProperty(PropertyName = "access_token")]
        public string AccessToken { get; set; }

        [JsonProperty(PropertyName = "expires_in")]
        public int ExpiresIn { get; set; }
    }
}
