using System.Net;

namespace RiskAnalytics.Api.Common.Exceptions;

public class NotFoundException : RiskAnalyticsCustomExceptionBase
{
    public NotFoundException() : base(HttpStatusCode.NotFound)
    {
    }
}
