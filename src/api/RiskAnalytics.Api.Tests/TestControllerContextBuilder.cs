using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using RiskAnalytics.Api.Business.Authorization;
using System.Security.Claims;

namespace RiskAnalytics.Api.Tests
{
    public class TestControllerContextBuilder
    {
        private ClaimsPrincipal claimsPrincipal;

        public TestControllerContextBuilder()
        {
            var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
            claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        }

        public TestControllerContextBuilder WithClaimsPrincipal(ClaimsPrincipal claimsPrincipal)
        {
            this.claimsPrincipal = claimsPrincipal;
            return this;
        }

        public TestControllerContextBuilder WithAssetWatchClaim()
        {
            var claimsIdentity = new ClaimsIdentity(
                new Claim[] { new(PortfoliosClaim.ClaimType, PortfoliosClaim.AssetWatchAddOn),
                    new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            this.claimsPrincipal = claimsPrincipal;
            return this;
        }

        public TestControllerContextBuilder WithStandardUserWithNoEntitlements()
        {
            var claimsIdentity = new ClaimsIdentity(
                new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            this.claimsPrincipal = claimsPrincipal;
            return this;
        }

        public ControllerContext GetContextWithQuery(Dictionary<string, StringValues> parameters)
        {
            var queryCollection = new QueryCollection(parameters);
            var query = new QueryFeature(queryCollection);
            var features = new FeatureCollection();
            features.Set<IQueryFeature>(query);

            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext(features)
                {
                    User = claimsPrincipal
                }
            };
        }

        public ControllerContext GetContext()
        {
            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = claimsPrincipal
                }
            };
        }
    }
}
