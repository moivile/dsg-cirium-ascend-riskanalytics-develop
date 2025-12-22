using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Business.Authorization;
using System.Security.Claims;

namespace RiskAnalytics.Api.Controllers.AsssetWatch
{
    public class AssetWatchBaseController : ControllerBase
    {
        internal void CheckEntitlementToAssetWatch(ClaimsPrincipal user)
        {
            var hasAssetWatchEntitlement = user?.Claims.HasPortfoliosClaim(PortfoliosClaim.AssetWatchAddOn);
            if (user == null || hasAssetWatchEntitlement == false)
            {
                throw new UnauthorizedAccessException("User does not have entitlement to Asset Watch");
            }
        }
    }
}
