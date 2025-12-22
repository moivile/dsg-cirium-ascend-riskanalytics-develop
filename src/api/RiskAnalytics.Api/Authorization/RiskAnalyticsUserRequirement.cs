using Microsoft.AspNetCore.Authorization;

namespace RiskAnalytics.Api.Authorization;

// this is required to wire up custom AuthorizationHandler PortfoliosUserHandler
// see PortfoliosUserHandler.cs and Program.cs "new AuthorizationPolicyBuilder().AddRequirements(new PortfoliosUserRequirement()).Build()"
public class RiskAnalyticsUserRequirement: IAuthorizationRequirement
{
}
