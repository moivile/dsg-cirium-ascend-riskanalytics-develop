using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Responses;

namespace RiskAnalytics.Api.Controllers;

[ApiController]
[Route("api/riskanalytics/[controller]")]
public class ConfigurationController : ControllerBase
{
    private readonly FrontEndConfigurationResponse frontEndConfiguration;

    public ConfigurationController(FrontEndConfigurationResponse frontEndConfiguration)
    {
        this.frontEndConfiguration = frontEndConfiguration;
    }

    [HttpGet("frontend")]
    [AllowAnonymous]
    public ActionResult<FrontEndConfigurationResponse> Frontend()
    {
        return Ok(frontEndConfiguration);
    }
}
