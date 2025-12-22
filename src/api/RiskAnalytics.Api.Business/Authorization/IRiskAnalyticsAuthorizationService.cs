using System.Security.Claims;

namespace RiskAnalytics.Api.Business.Authorization;

public interface IRiskAnalyticsAuthorizationService
{
    Task<IEnumerable<Claim>> GetClaims(string auth0Id);
}