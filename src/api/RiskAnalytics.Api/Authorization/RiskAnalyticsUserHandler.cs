using Microsoft.AspNetCore.Authorization;
using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Api.Responses;

namespace RiskAnalytics.Api.Authorization;

public class RiskAnalyticsUserHandler : AuthorizationHandler<RiskAnalyticsUserRequirement>
{
    private readonly IRiskAnalyticsAuthorizationService riskAnalyticsAuthorizationService;
    private readonly RiskAnalyticsMachineToMachineAuth0Response riskAnalyticsMachineToMachineAuth0Response;

    public RiskAnalyticsUserHandler(
        IRiskAnalyticsAuthorizationService riskAnalyticsAuthorizationService,
    RiskAnalyticsMachineToMachineAuth0Response riskAnalyticsMachineToMachineAuth0Response)
    {
        this.riskAnalyticsAuthorizationService = riskAnalyticsAuthorizationService;
        this.riskAnalyticsMachineToMachineAuth0Response = riskAnalyticsMachineToMachineAuth0Response;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, RiskAnalyticsUserRequirement requirement)
    {
        if (!context.User.Identity!.IsAuthenticated)
        {
            context.Fail();
            return;
        }

        if (IsUserMachineToMachineClient(context))
        {
            context.Succeed(requirement);
            return;
        }

        var claims = (await riskAnalyticsAuthorizationService.GetClaims(context.User.Auth0Id())).ToList();

        if (!claims.Any())
        {
            context.Fail();
            return;
        }

        foreach (var claim in claims)
        {
            context.User.Identities.Single().AddClaim(claim);
        }

        context.Succeed(requirement);
    }

    private bool IsUserMachineToMachineClient(AuthorizationHandlerContext context)
    {
        return context.User.Auth0Id() == $"{riskAnalyticsMachineToMachineAuth0Response.ClientId}@clients";
    }
}
