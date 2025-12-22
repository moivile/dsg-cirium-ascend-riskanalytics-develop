using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Authorization.CaeAdmin;

namespace RiskAnalytics.Api.Controllers;

[ApiController]
[Route("api/portfolios/[controller]")]
public class UserController : ControllerBase
{
    private readonly ICaeAdminClient caeAdminClient;

    public UserController(ICaeAdminClient caeAdminClient)
    {
        this.caeAdminClient = caeAdminClient;
    }
    [HttpGet("details")]
    public async Task<IActionResult> Get()
    {
        var userEmailAddress = await caeAdminClient.GetUserEmailAddress(User.Auth0Id());

        return Ok(new
        {
            claims = User.Claims.Where(x => x.Type == PortfoliosClaim.ClaimType).Select(x => x.Value),
            userEmailAddress
        });
    }
}
