using System.Net;
using Newtonsoft.Json;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;

namespace RiskAnalytics.Api;


public class RiskAnalyticsExceptionMiddleware
{
    private readonly RequestDelegate requestDelegate;
    private readonly ILogger<RiskAnalyticsExceptionMiddleware> logger;

    public RiskAnalyticsExceptionMiddleware(
        RequestDelegate requestDelegate,
        ILogger<RiskAnalyticsExceptionMiddleware> logger)
    {
        this.requestDelegate = requestDelegate;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await requestDelegate(httpContext);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(httpContext, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext httpContext, Exception exception)
    {
        httpContext.Response.ContentType = "application/json";

        switch (exception)
        {
            case RiskAnalyticsCustomExceptionBase riskanalyticsCustomException:
                {
                    logger.LogWarning(exception, exception.Message);
                    await SetHttpContextResponse(riskanalyticsCustomException.HttpStatusCode, riskanalyticsCustomException.Message);
                    break;
                }
            default:
                {
                    logger.LogError(exception, exception.Message);
                    await SetHttpContextResponse(HttpStatusCode.InternalServerError, ExceptionMessages.AnErrorHasOccured);
                    break;
                }
        }

        async Task SetHttpContextResponse(HttpStatusCode httpStatusCode, string message)
        {
            httpContext.Response.StatusCode = (int)httpStatusCode;
            httpContext.Response.ContentType = "application/json";
            await httpContext.Response.WriteAsync(JsonConvert.SerializeObject(new { message }));
        }
    }
}

