using RiskAnalytics.Api.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Controllers.AsssetWatch;

[ApiController]
public class PortfolioAssetWatchSummaryController : AssetWatchBaseController
{
    private readonly ITrackedUtilizationService trackedUtilizationService;
    private readonly IGroundEventsService groundEventsService;

    public PortfolioAssetWatchSummaryController(ITrackedUtilizationService trackedUtilizationService, IGroundEventsService groundEventsService)
    {
        this.trackedUtilizationService = trackedUtilizationService;
        this.groundEventsService = groundEventsService;
    }

    [HttpGet]
    [Route("api/portfolios/{portfolioId:int}/assetwatch/summary/flights")]
    public async Task<ActionResult<IEnumerable<IdNameCountModel>>> SummaryFlights(int portfolioId,
        [FromQuery] AssetWatchSearchParameters assetWatchSearchParameters,
        [FromQuery] AssetWatchGroupingOption assetWatchGroupingOption)
    {
        CheckEntitlementToAssetWatch(User);

        var stats = await trackedUtilizationService.SummaryFlights(User.Auth0Id(), portfolioId, assetWatchSearchParameters, assetWatchGroupingOption);
        return Ok(stats);
    }

    [HttpGet]
    [Route("api/portfolios/{portfolioId:int}/assetwatch/summary/groundevents")]
    public async Task<ActionResult<IEnumerable<SummaryGroundEventsModel>>> SummaryGroundEvents(int portfolioId,
        [FromQuery] AssetWatchSearchParameters assetWatchSearchParameters,
        [FromQuery] AssetWatchGroupingOption assetWatchGroupingOption)
    {
        CheckEntitlementToAssetWatch(User);

        var stats = await groundEventsService.SummaryGroundEvents(User.Auth0Id(), portfolioId, assetWatchSearchParameters, assetWatchGroupingOption);
        return Ok(stats);
    }
}
