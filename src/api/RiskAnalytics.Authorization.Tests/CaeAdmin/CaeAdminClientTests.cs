using System.Net;
using System.Reflection;
using Newtonsoft.Json;
using NSubstitute;
using RiskAnalytics.Authorization.Auth0MachineToMachine;
using RiskAnalytics.Authorization.CaeAdmin;
using RiskAnalytics.Authorization.CaeAdmin.Responses;
using Xunit;

namespace RiskAnalytics.Authorization.Tests.CaeAdmin
{
    public class CaeAdminClientTests
    {
        private readonly IAuth0MachineToMachineClient auth0MachineToMachineClientMock;

        private readonly CaeAdminConfiguration caeAdminConfiguration;

        public CaeAdminClientTests()
        {
            auth0MachineToMachineClientMock = Substitute.For<IAuth0MachineToMachineClient>();

            caeAdminConfiguration = new CaeAdminConfiguration
            {
                Url = "https://cae.com"
            };
        }

        [Fact(Skip = "nsubstitude setup issues")]
        public async Task GetEntitlements_ReturnsEntitlements()
        {
            //arrange
            const string productItemName = "Premium Network Briefing";

            var responseMessage = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonConvert.SerializeObject(new EntitlementsResponse
                {
                    Entitlements = new List<Entitlement>
                    {
                        new()
                        {
                            ProductItems = new List<ProductItem>
                            {
                                new()
                                {
                                    ProductItemName = productItemName
                                }
                            }
                        }
                    }
                }))
            };

            var messageHandlerMock = Substitute.For<HttpMessageHandler>();
            var handlerMock = Substitute.For<HttpClientHandler>();
            var flags = BindingFlags.NonPublic | BindingFlags.Instance;

            messageHandlerMock
                .GetType()
                .GetMethod("SendAsync", flags)
                .Invoke(handlerMock, new object[] { Arg.Any<HttpRequestMessage>(), Arg.Any<CancellationToken>() })
                .Returns(responseMessage);

            var httpClient = new HttpClient(messageHandlerMock);

            var caeAdminClient = new CaeAdminClient(httpClient, auth0MachineToMachineClientMock, caeAdminConfiguration);

            //act
            var entitlements = await caeAdminClient.GetEntitlements("");

            //assert
            Assert.Equal(productItemName, entitlements.First().ProductItems.First().ProductItemName);
        }

        [Fact(Skip = "nsubstitude setup issues")]
        public async Task GetEntitlements_IsNotSuccessStatusCode_ThrowsException()
        {
            //arrange
            const string errorMessage = "An error has occurred";

            var responseMessage = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.InternalServerError,
                Content = new StringContent(errorMessage)
            };

            var messageHandlerMock = Substitute.For<HttpMessageHandler>();
            var handlerMock = Substitute.For<HttpClientHandler>();
            var flags = BindingFlags.NonPublic | BindingFlags.Instance;

            messageHandlerMock
                .GetType()
                .GetMethod("SendAsync", flags)
                .Invoke(handlerMock, new object[] { Arg.Any<HttpRequestMessage>(), Arg.Any<CancellationToken>() })
                .Returns(responseMessage);

            var httpClient = new HttpClient(messageHandlerMock);

            var caeAdminClient = new CaeAdminClient(httpClient, auth0MachineToMachineClientMock, caeAdminConfiguration);

            //act
            var entitlementsTask = caeAdminClient.GetEntitlements("");

            //assert
            var exception = await Assert.ThrowsAsync<HttpRequestException>(async () => await entitlementsTask);
            Assert.NotNull(exception);
            Assert.Equal($"Exception: Internal Server Error. Status code: InternalServerError. Content: {errorMessage}", exception.Message);
        }
    }
}
