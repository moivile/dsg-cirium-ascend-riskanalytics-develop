using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;
using NSubstitute;
using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Authorization.CaeAdmin;
using RiskAnalytics.Authorization.CaeAdmin.Responses;
using Xunit;

namespace RiskAnalytics.Business.Tests.Authorization
{
    public class RiskAnalyticsAuthorizationServiceTests
    {
        private readonly ICaeAdminClient caeAdminClientMock;
        private IMemoryCache memoryCacheMock;

        private readonly RiskAnalyticsAuthorizationService riskAnalyticsAuthorizationService;

        public RiskAnalyticsAuthorizationServiceTests()
        {
            caeAdminClientMock = Substitute.For<ICaeAdminClient>();
            memoryCacheMock = Substitute.For<IMemoryCache>();

            riskAnalyticsAuthorizationService = new RiskAnalyticsAuthorizationService(caeAdminClientMock, memoryCacheMock);
        }

        [Fact]
        public async Task GetClaims_ClaimsAreCached_GetClaimsFromCache()
        {
            //arrange
            const string auth0Id = "auth0id";
            var anyListArg = Arg.Any<List<Claim>>();
            var cacheKey = $"PortfoliosClaims_{auth0Id}";

            var cachedClaims = new List<Claim>
            {
                new(PortfoliosClaim.ClaimType, PortfoliosClaim.Standard),
                new(PortfoliosClaim.ClaimType, PortfoliosClaim.EmissionsAddOn)
            };

            memoryCacheMock.TryGetValue(cacheKey, out anyListArg).Returns(x =>
            {
                x[1] = cachedClaims;
                return true;
            });

            //act
            var claims = await riskAnalyticsAuthorizationService.GetClaims(auth0Id);

            //assert
            Assert.Equal(2, claims.Count());
            await caeAdminClientMock.DidNotReceive().GetEntitlements(auth0Id);
        }

        [Fact]
        public async Task GetClaims_ClaimsAreNotCached_GetClaimsFromCaeAdminClient()
        {
            //arrange
            const string auth0Id = "auth0id";

            object? cachedClaims;
            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedClaims).Returns(false);
            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            //act
            await riskAnalyticsAuthorizationService.GetClaims(auth0Id);

            //assert
            await caeAdminClientMock.Received().GetEntitlements(auth0Id);
        }

        [Fact]
        public async Task GetClaims_ClaimsAreNotCached_EnterIntoCache()
        {
            //arrange
            const string auth0Id = "auth0id";

            object? cachedClaims;
            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedClaims).Returns(false);
            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            //act
            await riskAnalyticsAuthorizationService.GetClaims(auth0Id);

            //assert
            memoryCacheMock.Received().CreateEntry(Arg.Any<object>());
        }

        [Fact]
        public async Task GetClaims_UserHasStandardAccess_ReturnStandard()
        {
            //arrange
            const string auth0Id = "auth0id";

            object? cachedClaims;
            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedClaims).Returns(false);
            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            caeAdminClientMock.GetEntitlements(auth0Id).Returns(new List<Entitlement>()
            {
                new()
                {
                    ProductItems = new List<ProductItem> { new() { ProductItemName = "Ascend - Risk Analytics (Standard)" } }
                }
            });

            //act
            var claims = await riskAnalyticsAuthorizationService.GetClaims(auth0Id);

            //assert
            Assert.Equal(PortfoliosClaim.Standard, claims.Single().Value);
        }

        [Fact]
        public async Task GetClaims_UserHasEmissionsAddOn_ReturnEmissionsAddOn()
        {
            //arrange
            const string auth0Id = "auth0id";

            object? cachedClaims;
            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedClaims).Returns(false);
            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            caeAdminClientMock.GetEntitlements(auth0Id).Returns(new List<Entitlement>
            {
                new()
                {
                    ProductItems = new List<ProductItem> { new() { ProductItemName = "Ascend - Risk Analytics (Emissions add-on)" } }
                }
            });

            //act
            var claims = await riskAnalyticsAuthorizationService.GetClaims(auth0Id);

            //assert
            await caeAdminClientMock.Received().GetEntitlements(auth0Id);
            Assert.Equal(PortfoliosClaim.EmissionsAddOn, claims.Single().Value);
        }

        [Fact]
        public async Task GetClaims_UserHasAssetWatchAddOn_ReturnAssetWatchAddOn()
        {
            //arrange
            const string auth0Id = "auth0id";

            object? cachedClaims;
            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedClaims).Returns(false);
            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            caeAdminClientMock.GetEntitlements(auth0Id).Returns(new List<Entitlement>
            {
                new()
                {
                    ProductItems = new List<ProductItem> { new() { ProductItemName = "Ascend Asset Watch" } }
                }
            });

            //act
            var claims = await riskAnalyticsAuthorizationService.GetClaims(auth0Id);

            //assert
            await caeAdminClientMock.Received().GetEntitlements(auth0Id);
            Assert.Equal(PortfoliosClaim.AssetWatchAddOn, claims.Single().Value);
        }

        [Fact]
        public async Task GetClaims_UserHasStandardAndEmissionsAddOn_ReturnStandardAndEmissionsAddOn()
        {
            //arrange
            const string auth0Id = "auth0id";

            object? cachedClaims;
            memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedClaims).Returns(false);
            memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

            caeAdminClientMock.GetEntitlements(auth0Id).Returns(new List<Entitlement>()
            {
                new()
                {
                    ProductItems = new List<ProductItem>
                    {
                        new() { ProductItemName = "Ascend - Risk Analytics (Standard)" },
                        new() { ProductItemName = "Ascend - Risk Analytics (Emissions add-on)" }
                    }
                }
            });

            //act
            var claims = (await riskAnalyticsAuthorizationService.GetClaims(auth0Id)).ToList();

            //assert
            await caeAdminClientMock.Received().GetEntitlements(auth0Id);
            Assert.Equal(2, claims.Count);
            Assert.Equal(PortfoliosClaim.EmissionsAddOn, claims.Single(x => x.Value == PortfoliosClaim.EmissionsAddOn).Value);
            Assert.Equal(PortfoliosClaim.Standard, claims.Single(x => x.Value == PortfoliosClaim.Standard).Value);
        }
    }
}
