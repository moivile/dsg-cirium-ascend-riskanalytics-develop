using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Authorization;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using MapsterMapper;
using RiskAnalytics.Api.Responses;
using RiskAnalytics.Api.Requests;

namespace RiskAnalytics.Api.Controllers;

[ApiController]
public class PortfoliosController : ControllerBase
{
    private readonly IPortfoliosService portfoliosService;
    private readonly IPortfolioValidator portfolioValidator;
    private readonly IMapper mapper;

    public PortfoliosController(
        IPortfoliosService portfoliosService,
        IPortfolioValidator portfolioValidator,
        IMapper mapper)
    {
        this.portfoliosService = portfoliosService;
        this.portfolioValidator = portfolioValidator;
        this.mapper = mapper;

    }

    [HttpGet]
    [Route("api/portfolios/{id:int}")]
    public async Task<ActionResult<PortfolioResponse>> Get(int id)
    {
        var portfolio = await portfoliosService.Get(id, User.Auth0Id());

        return Ok(mapper.Map<PortfolioResponse>(portfolio));
    }

    [HttpGet]
    [Route("api/portfolios")]
    public async Task<ActionResult<IEnumerable<PortfolioResponse>>> GetAll()
    {
        var portfolios = await portfoliosService.GetAll(User.Auth0Id());

        return Ok(mapper.Map<IEnumerable<PortfolioResponse>>(portfolios));
    }

    [HttpPost]
    [Route("api/portfolios")]
    public async Task<IActionResult> Create(PortfolioRequest request)
    {
        var portfolio = mapper.Map<Portfolio>(request);
        portfolio.UserId = User.Auth0Id();

        await portfolioValidator.IsValidOrThrow(portfolio);

        var portfolioId = await portfoliosService.Create(portfolio);

        var getUri = new Uri($"api/portfolios/{portfolioId}", UriKind.Relative);
        return Created(getUri, portfolioId);
    }

    [HttpPut]
    [Route("api/portfolios/{id:int}")]
    public async Task<IActionResult> Update(int id, PortfolioRequest request)
    {
        var portfolio = mapper.Map<Portfolio>(request);
        portfolio.Id = id;

        await portfolioValidator.IsValidOrThrow(portfolio);

        await portfoliosService.Update(portfolio, User.Auth0Id());

        return NoContent();
    }


    [HttpDelete]
    [Route("api/portfolios/{portfolioId:int}")]
    public async Task<IActionResult> Delete(int portfolioId)
    {
        await portfoliosService.Delete(portfolioId, User.Auth0Id());
        return NoContent();
    }
}
