using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;
using NSubstitute;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using Xunit;

namespace RiskAnalytics.Api.Tests;

public class PortfoliosExceptionMiddlewareTests
{
    private readonly ILogger<RiskAnalyticsExceptionMiddleware> loggerMock;

    public PortfoliosExceptionMiddlewareTests()
    {
        loggerMock = Substitute.For<ILogger<RiskAnalyticsExceptionMiddleware>>();
    }

    [Fact]
    public async Task InvokeAsync_ThrowsPortfoliosCustomExceptionWithMessage_SetResponseMessageAndStatusCode()
    {
        // arrange
        var entityValidationException = new EntityValidationException(ValidationMessages.PortfolioNameIsNotUnique);
        var requestDelegate = new RequestDelegate(_ => throw entityValidationException);
        var httpContext = new DefaultHttpContext { Response = { Body = new MemoryStream() } };

        var riskanalyticsExceptionMiddleware = new RiskAnalyticsExceptionMiddleware(requestDelegate, loggerMock);

        // act
        await riskanalyticsExceptionMiddleware.InvokeAsync(httpContext);

        // assert
        Assert.Equal((int)entityValidationException.HttpStatusCode, httpContext.Response.StatusCode);
        Assert.Equal("application/json", httpContext.Response.ContentType);

        var responseBody = await ReadResponseBodyAsString(httpContext);
        Assert.Equal(JsonConvert.SerializeObject(new { message = ValidationMessages.PortfolioNameIsNotUnique }), responseBody);
    }

    [Fact]
    public async Task InvokeAsync_ThrowsPortfoliosCustomExceptionWithoutMessage_SetStatusCodeAndSetResponseMessageAsBlank()
    {
        // arrange
        var notFoundException = new NotFoundException();
        var requestDelegate = new RequestDelegate(_ => throw notFoundException);
        var httpContext = new DefaultHttpContext { Response = { Body = new MemoryStream() } };

        var riskanalyticsExceptionMiddleware = new RiskAnalyticsExceptionMiddleware(requestDelegate, loggerMock);

        // act
        await riskanalyticsExceptionMiddleware.InvokeAsync(httpContext);

        // assert
        Assert.Equal((int)notFoundException.HttpStatusCode, httpContext.Response.StatusCode);
        Assert.Equal("application/json", httpContext.Response.ContentType);

        var responseBody = await ReadResponseBodyAsString(httpContext);
        Assert.Equal(JsonConvert.SerializeObject(new { message = string.Empty }), responseBody);
    }

    [Fact(Skip = "nsubstitude setup issues")]
    public async Task InvokeAsync_ThrowsPortfoliosCustomException_LogsWarning()
    {
        // arrange
        const string errorMessage = "Custom message should be logged.";
        var requestDelegate = new RequestDelegate(_ => throw new EntityValidationException(errorMessage));
        var httpContext = new DefaultHttpContext { Response = { Body = new MemoryStream() } };

        var riskanalyticsExceptionMiddleware = new RiskAnalyticsExceptionMiddleware(requestDelegate, loggerMock);

        // act
        await riskanalyticsExceptionMiddleware.InvokeAsync(httpContext);

        // assert
        loggerMock.Received().Log(
                Arg.Is<LogLevel>(logLevel => logLevel == LogLevel.Warning),
                Arg.Is<EventId>(eventId => eventId.Id == 0),
                Arg.Is<string>(message => message == errorMessage),
                Arg.Any<EntityValidationException>(),
                Arg.Any<Func<Arg.AnyType, Exception, string>>()!);
    }

    [Fact]
    public async Task InvokeAsync_ThrowsNonPortfoliosCustomException_SetStatusCodeTo500AndResponseMessageToGenericMessage()
    {
        // arrange
        var requestDelegate = new RequestDelegate(_ => throw new InvalidOperationException("Custom message should not be put into the output"));
        var httpContext = new DefaultHttpContext { Response = { Body = new MemoryStream() } };

        var riskanalyticsExceptionMiddleware = new RiskAnalyticsExceptionMiddleware(requestDelegate, loggerMock);

        // act
        await riskanalyticsExceptionMiddleware.InvokeAsync(httpContext);

        // assert
        Assert.Equal(500, httpContext.Response.StatusCode);
        Assert.Equal("application/json", httpContext.Response.ContentType);

        var responseBody = await ReadResponseBodyAsString(httpContext);
        Assert.Equal(JsonConvert.SerializeObject(new { message = ExceptionMessages.AnErrorHasOccured }), responseBody);
    }

    [Fact(Skip = "nsubstitude setup issues")]
    public async Task InvokeAsync_ThrowsNonPortfoliosCustomException_LogsError()
    {
        // arrange
        const string errorMessage = "Message should be logged.";
        var requestDelegate = new RequestDelegate(_ => throw new InvalidOperationException(errorMessage));
        var httpContext = new DefaultHttpContext { Response = { Body = new MemoryStream() } };

        var riskanalyticsExceptionMiddleware = new RiskAnalyticsExceptionMiddleware(requestDelegate, loggerMock);

        // act
        await riskanalyticsExceptionMiddleware.InvokeAsync(httpContext);

        // assert
        loggerMock.Received().Log(
                Arg.Is<LogLevel>(logLevel => logLevel == LogLevel.Error),
                Arg.Is<EventId>(eventId => eventId.Id == 0),
                Arg.Is<string>(message => message == errorMessage),
                Arg.Any<InvalidOperationException>(),
                Arg.Any<Func<Arg.AnyType, Exception, string>>()!);
    }

    private static async Task<string> ReadResponseBodyAsString(HttpContext httpContext)
    {
        using var streamReader = new StreamReader(httpContext.Response.Body);
        httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
        var responseBody = await streamReader.ReadToEndAsync();
        return responseBody;
    }
}
