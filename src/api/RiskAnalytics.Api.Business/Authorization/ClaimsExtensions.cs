using System.Security.Claims;

namespace RiskAnalytics.Api.Business.Authorization;

public static class ClaimsExtensions
{
    public static bool HasPortfoliosClaim(this IEnumerable<Claim> claims, string claim)
    {
        return claims.Any(x => x.Type == PortfoliosClaim.ClaimType && x.Value == claim);
    }
}
