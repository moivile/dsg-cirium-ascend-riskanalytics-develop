using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Authorization.CaeAdmin;

namespace RiskAnalytics.Api.Business.Authorization;

public class RiskAnalyticsAuthorizationService : IRiskAnalyticsAuthorizationService
{
    private const string StandardProductItemName = "Ascend - Risk Analytics (Standard)";
    private const string EmissionsAddOnProductItemName = "Ascend - Risk Analytics (Emissions add-on)";
    private const string AssetWatch = "Ascend Asset Watch";

    private readonly ICaeAdminClient caeAdminClient;
    private readonly IMemoryCache memoryCache;

    public RiskAnalyticsAuthorizationService(ICaeAdminClient caeAdminClient, IMemoryCache memoryCache)
    {
        this.caeAdminClient = caeAdminClient;
        this.memoryCache = memoryCache;
    }

    public async Task<IEnumerable<Claim>> GetClaims(string auth0Id)
    {
        var cacheKey = $"PortfoliosClaims_{auth0Id}";
        if (memoryCache.TryGetValue(cacheKey, out IEnumerable<Claim>? cachedClaims))
        {
            if (cachedClaims != null)
            {
                return cachedClaims;
            }
        }

        var entitlements = await caeAdminClient.GetEntitlements(auth0Id);
        var productItemsNames = entitlements.SelectMany(entitlement => entitlement.ProductItems.Select(x => x.ProductItemName)).ToList();

        var claims = new List<Claim>();

        var hasStandardAccess = productItemsNames.Any(productItemName => productItemName == StandardProductItemName);
        if (hasStandardAccess)
        {
            claims.Add(new Claim(PortfoliosClaim.ClaimType, PortfoliosClaim.Standard));
        }

        var hasEmissionsAddOn = productItemsNames.Any(productItemName => productItemName == EmissionsAddOnProductItemName);
        if (hasEmissionsAddOn)
        {
            claims.Add(new Claim(PortfoliosClaim.ClaimType, PortfoliosClaim.EmissionsAddOn));
        }

        var hasAssetWatchAddOn = productItemsNames.Any(productItemName => productItemName == AssetWatch);
        if (hasAssetWatchAddOn)
        {
            claims.Add(new Claim(PortfoliosClaim.ClaimType, PortfoliosClaim.AssetWatchAddOn));
        }

        memoryCache.Set(cacheKey, claims, TimeSpan.FromMinutes(30));
        return claims;
    }
}
