using System.Net;
using System.Reflection;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NSubstitute;
using RiskAnalytics.Authorization.Auth0MachineToMachine;
using Xunit;

namespace RiskAnalytics.Authorization.Tests.Auth0MachineToMachine
{
    public class Auth0MachineToMachineClientTests
    {
        private readonly IMemoryCache memoryCacheMock;
        private readonly ILogger<Auth0MachineToMachineClient> loggerMock;

        private readonly Auth0MachineToMachineConfiguration auth0MachineToMachineConfiguration;

        public Auth0MachineToMachineClientTests()
        {
            memoryCacheMock = Substitute.For<IMemoryCache>();
            loggerMock = Substitute.For<ILogger<Auth0MachineToMachineClient>>();

            auth0MachineToMachineConfiguration = new Auth0MachineToMachineConfiguration
            {
                Url = "https://cirium.com"
            };
        }

        [Fact(Skip = "nsubstitude setup issues")]
        public async Task GetAuth0AccessToken_WhenTokenExistsInCache_GetFromCache()
        {
            //arrange
            object? cachedAccessToken = "cachedAccessToken";
            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedAccessToken).Returns(true);

            var auth0Client = new Auth0MachineToMachineClient(memoryCacheMock, auth0MachineToMachineConfiguration, new HttpClient(), loggerMock);

            //act
            var auth0AccessToken = await auth0Client.GetAuth0AccessToken();

            //assert
            Assert.Equal(cachedAccessToken, auth0AccessToken);
        }

        [Fact(Skip = "nsubstitude setup issues")]
        public async Task GetAuth0AccessToken_WhenTokenDoesNotExistsInCache_GetFromAuth0()
        {
            //arrange
            object? cachedAccessToken = null;
            const string auth0ClientAccessToken = "auth0ClientAccessToken";

            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedAccessToken).Returns(false);

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            var responseMessage = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonConvert.SerializeObject(new Auth0TokenResponse(auth0ClientAccessToken, 1000)))
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

            var auth0Client = new Auth0MachineToMachineClient(memoryCacheMock, auth0MachineToMachineConfiguration, httpClient, loggerMock);

            //act
            var auth0AccessToken = await auth0Client.GetAuth0AccessToken();

            //assert
            Assert.Equal(auth0AccessToken, auth0AccessToken);
        }

        [Fact(Skip = "nsubstitude setup issues")]
        public async Task GetAuth0AccessToken_WhenTokenDoesNotExistsInCache_EnterIntoCache()
        {
            //arrange
            object? cachedAccessToken = null;
            const string auth0AccessToken = "auth0AccessToken";

            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedAccessToken).Returns(false);

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            var responseMessage = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonConvert.SerializeObject(new Auth0TokenResponse(auth0AccessToken, 1000))),
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

            var auth0Client = new Auth0MachineToMachineClient(memoryCacheMock, auth0MachineToMachineConfiguration, httpClient, loggerMock);

            //act
            await auth0Client.GetAuth0AccessToken();

            //assert
            memoryCacheMock.Received().CreateEntry(Arg.Any<object>());
        }

        [Fact(Skip = "nsubstitude setup issues")]
        public async Task GetAuth0AccessToken_WhenTokenExpiryIs5MinutesOrLess_DoNotEnterIntoCache()
        {
            //arrange
            object? cachedAccessToken = null;
            const string auth0AccessToken = "auth0AccessToken";

            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedAccessToken).Returns(false);

            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            var responseMessage = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonConvert.SerializeObject(new Auth0TokenResponse(auth0AccessToken, 300)))
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

            var auth0Client = new Auth0MachineToMachineClient(memoryCacheMock, auth0MachineToMachineConfiguration, httpClient, loggerMock);

            //act
            await auth0Client.GetAuth0AccessToken();

            //assert
            memoryCacheMock.DidNotReceive().CreateEntry(Arg.Any<object>());
        }

        [Fact(Skip = "nsubstitude setup issues")]
        public async Task GetAuth0AccessToken_WhenNotIsSuccessStatusCode_ThrowException()
        {
            //arrange
            const string errorMessage = "An error has occurred.";

            object? cachedAccessToken = null;
            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedAccessToken).Returns(false);

            var responseMessage = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.InternalServerError,
                Content = new StringContent(errorMessage),
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

            var auth0Client = new Auth0MachineToMachineClient(memoryCacheMock, auth0MachineToMachineConfiguration, httpClient, loggerMock);

            //act
            var getAuth0AccessTokenTask = auth0Client.GetAuth0AccessToken();

            //assert
            var exception = await Assert.ThrowsAsync<HttpRequestException>(async () => await getAuth0AccessTokenTask);
            Assert.NotNull(exception);
            Assert.Equal($"Exception: Internal Server Error. Status code: InternalServerError. Content: {errorMessage}", exception.Message);
        }
    }
}
