using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RiskAnalytics.Api.Controllers;

[Route("api/riskanalytics/[controller]")]
[ApiController]
public class HealthCheckController : ControllerBase
{
    [HttpGet("loadbalancer")]
    [AllowAnonymous]
    public IActionResult LoadBalancer()
    {
        return Ok();
    }
}
