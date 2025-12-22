using System.Net.Http.Headers;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace RiskAnalytics.Authorization.Auth0MachineToMachine
{
    public class Auth0MachineToMachineClient : IAuth0MachineToMachineClient
    {
        private readonly Auth0MachineToMachineConfiguration configuration;
        private readonly IMemoryCache memoryCache;
        private readonly HttpClient httpClient;
        private readonly ILogger<Auth0MachineToMachineClient> logger;

        public Auth0MachineToMachineClient(
            IMemoryCache memoryCache,
            Auth0MachineToMachineConfiguration configuration,
            HttpClient httpClient,
            ILogger<Auth0MachineToMachineClient> logger)
        {
            this.memoryCache = memoryCache;
            this.configuration = configuration;
            this.httpClient = httpClient;
            this.logger = logger;
        }

        public async Task<string> GetAuth0AccessToken()
        {
            var accessTokenCacheKey = $"{configuration.Audience}_access_token";

            if (memoryCache.TryGetValue(accessTokenCacheKey, out string? accessToken))
            {
                if (accessToken != null)
                {
                    return accessToken;
                }
            }

            var requestBody = new Dictionary<string, string>
            {
                {"grant_type", "client_credentials"},
                {"client_id", configuration.ClientId},
                {"client_secret", configuration.ClientSecret},
                {"audience", configuration.Audience}
            };

            var request = new HttpRequestMessage(HttpMethod.Post, $"{configuration.Url}/oauth/token")
            {
                Content = new FormUrlEncodedContent(requestBody)
            };

            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/x-www-form-urlencoded"));

            var response = await httpClient.SendAsync(request);

            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Exception: {response.ReasonPhrase}. Status code: {response.StatusCode}. Content: {responseContent}");
            }

            var auth0TokenResponse = JsonConvert.DeserializeObject<Auth0TokenResponse>(responseContent);

            if (auth0TokenResponse == null)
            {
                throw new InvalidOperationException("auth0TokenResponse cannot be null.");
            }

            var cacheTimeOutSeconds = auth0TokenResponse.ExpiresIn - 300;

            if (cacheTimeOutSeconds > 0)
            {
                memoryCache.Set(accessTokenCacheKey, auth0TokenResponse.AccessToken, TimeSpan.FromSeconds(cacheTimeOutSeconds));
            }
            else
            {
                logger.LogWarning("Access token should not be expiring so quickly. Auth0 default is 24 hours.");
            }

            return auth0TokenResponse.AccessToken;
        }
    }
}
