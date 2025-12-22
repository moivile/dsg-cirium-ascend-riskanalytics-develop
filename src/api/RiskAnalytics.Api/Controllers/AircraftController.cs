using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Requests;
using RiskAnalytics.Api.Responses;

namespace RiskAnalytics.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AircraftController : ControllerBase
{
    private readonly IAircraftService aircraftService;
    private readonly IMapper mapper;

    public AircraftController(
        IAircraftService aircraftService,
        IMapper mapper)
    {
        this.aircraftService = aircraftService;
        this.mapper = mapper;
    }

    [HttpGet]
    [Route("")]
    public async Task<ActionResult<AircraftSearchResponse>> Search([FromQuery] SearchAircraftRequest searchRequest)
    {
        var parameters = mapper.Map<SearchAircraftParameters>(searchRequest);
        var result = await aircraftService.Search(parameters);

        return Ok(mapper.Map<AircraftSearchResponse>(result));
    }        
}    
