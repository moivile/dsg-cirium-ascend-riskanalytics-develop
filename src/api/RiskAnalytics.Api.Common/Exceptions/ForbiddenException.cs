using System.Net;

namespace RiskAnalytics.Api.Common.Exceptions;

public class ForbiddenException : RiskAnalyticsCustomExceptionBase
{
    public ForbiddenException() : base(HttpStatusCode.Forbidden)
    {
    }
}
