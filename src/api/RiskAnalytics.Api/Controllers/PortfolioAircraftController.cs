using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Authorization;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Responses;

namespace RiskAnalytics.Api.Controllers;

[ApiController]
[Route("api/portfolios/{portfolioId:int}/aircraft")]
public class PortfolioAircraftController : ControllerBase
{
    private readonly IPortfolioAircraftService portfolioAircraftService;
    private readonly IMapper mapper;

    public PortfolioAircraftController(
        IPortfolioAircraftService portfolioAircraftService,
        IMapper mapper)
    {
        this.portfolioAircraftService = portfolioAircraftService;
        this.mapper = mapper;
    }

    [HttpGet]
    [Route("")]
    public async Task<ActionResult<IEnumerable<AircraftResponse>>> GetAll(int portfolioId)
    {
        var portfolioAircraft = await portfolioAircraftService.GetAll(portfolioId, User.Auth0Id());
        var response = mapper.Map<List<AircraftResponse>>(portfolioAircraft);
        return Ok(response);
    }
}
