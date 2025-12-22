using System.Net;

namespace RiskAnalytics.Api.Common.Exceptions;

public abstract class RiskAnalyticsCustomExceptionBase : Exception
{
    public HttpStatusCode HttpStatusCode { get; }

    protected RiskAnalyticsCustomExceptionBase(HttpStatusCode httpStatusCode, string? message = "") : base(message)
    {
        HttpStatusCode = httpStatusCode;
    }
}
