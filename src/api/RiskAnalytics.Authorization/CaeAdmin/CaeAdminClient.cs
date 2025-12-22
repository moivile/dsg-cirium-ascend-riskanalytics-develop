using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using RiskAnalytics.Authorization.Auth0MachineToMachine;
using RiskAnalytics.Authorization.CaeAdmin.Requests;
using RiskAnalytics.Authorization.CaeAdmin.Responses;

namespace RiskAnalytics.Authorization.CaeAdmin
{
    public class CaeAdminClient : ICaeAdminClient
    {
        private readonly IAuth0MachineToMachineClient auth0MachineToMachineClient;
        private readonly HttpClient httpClient;
        private readonly CaeAdminConfiguration configuration;

        public CaeAdminClient(
            HttpClient httpClient,
            IAuth0MachineToMachineClient auth0MachineToMachineClient,
            CaeAdminConfiguration configuration)
        {
            this.httpClient = httpClient;
            this.auth0MachineToMachineClient = auth0MachineToMachineClient;
            this.configuration = configuration;
        }

        public async Task<IEnumerable<Entitlement>> GetEntitlements(string auth0Id)
        {
            var auth0AccessToken = await auth0MachineToMachineClient.GetAuth0AccessToken();

            var requestBody = new CaeRequestBody
            (
                GetRequester(auth0Id),
                new { auth0Id }
            );

            var request = new HttpRequestMessage(HttpMethod.Post, $"{configuration.Url}/admin/v1/user/entitlements/get")
            {
                Content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json")
            };

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", auth0AccessToken);

            var response = await httpClient.SendAsync(request);

            var responseContent = await response.Content.ReadAsStringAsync();

            ValidateIsSuccessStatusCode(response, responseContent);

            return JsonConvert.DeserializeObject<EntitlementsResponse>(responseContent)!.Entitlements;
        }


        public async Task<string?> GetUserEmailAddress(string auth0Id)
        {
            var auth0AccessToken = await auth0MachineToMachineClient.GetAuth0AccessToken();

            var requestBody = new CaeRequestBody
            (
                GetRequester(auth0Id),
                new { auth0Id }
            );

            var request = new HttpRequestMessage(HttpMethod.Post, $"{configuration.Url}/admin/v1/user/get")
            {
                Content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json")
            };

            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", auth0AccessToken);

            var response = await httpClient.SendAsync(request);

            var responseContent = await response.Content.ReadAsStringAsync();

            ValidateIsSuccessStatusCode(response, responseContent);

            if (string.IsNullOrEmpty(responseContent))
            {
                throw new HttpRequestException("The response content is empty.");
            }

            var userResponse = JsonConvert.DeserializeAnonymousType(responseContent, new { Email = string.Empty });

            if (userResponse == null || string.IsNullOrEmpty(userResponse.Email))
            {
                throw new HttpRequestException("Failed to retrieve the email from the response.");
            }

            return userResponse.Email;
        }




        private static void ValidateIsSuccessStatusCode(HttpResponseMessage response, string responseContent)
        {
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Exception: {response.ReasonPhrase}. Status code: {response.StatusCode}. Content: {responseContent}");
            }
        }

        private CaeRequester GetRequester(string auth0Id)
        {
            return new CaeRequester
            (
                new CaeRequesterApplication(configuration.RequesterApplication),
                new CaeRequesterUser(auth0Id)
            );
        }
    }
}
