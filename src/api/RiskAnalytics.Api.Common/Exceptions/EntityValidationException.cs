using System.Net;

namespace RiskAnalytics.Api.Common.Exceptions;

public class EntityValidationException : RiskAnalyticsCustomExceptionBase
{
    public EntityValidationException(string message) : base(HttpStatusCode.UnprocessableEntity, message)
    {
    }

    public EntityValidationException(IEnumerable<string> messages) : base(HttpStatusCode.UnprocessableEntity, string.Join(' ', messages))
    {
    }
}
