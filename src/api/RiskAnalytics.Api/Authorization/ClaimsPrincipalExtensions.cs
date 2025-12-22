using System.Security.Claims;

namespace RiskAnalytics.Api.Authorization;

public static class ClaimsPrincipalExtensions
{
    public static string Auth0Id(this ClaimsPrincipal claimsPrincipal)
    {
        return claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)!.Value;
    }
}