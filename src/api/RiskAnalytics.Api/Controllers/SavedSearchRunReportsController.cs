using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Controllers.AsssetWatch;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Api.Responses;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Business.Services.Interfaces;

namespace RiskAnalytics.Api.Controllers;

public class SavedSearchRunReportsController: AssetWatchBaseController
{
    private readonly ISavedSearchRunReportsService savedSearchRunReportsService;
    private readonly IMapper mapper;
    private readonly ISavedSearchAuthorizationService savedSearchAuthorizationService;
    private readonly RiskAnalyticsMachineToMachineAuth0Response riskAnalyticsMachineToMachineAuth0Response;
    private readonly ISavedSearchRunReportValidator savedSearchRunReportValidator;

    public SavedSearchRunReportsController(
        ISavedSearchRunReportsService savedSearchRunReportsService,
        ISavedSearchAuthorizationService savedSearchAuthorizationService,
        RiskAnalyticsMachineToMachineAuth0Response riskAnalyticsMachineToMachineAuth0Response,
        IMapper mapper,
        ISavedSearchRunReportValidator savedSearchRunReportValidator)
    {
        this.savedSearchRunReportsService = savedSearchRunReportsService;
        this.mapper = mapper;
        this.savedSearchAuthorizationService = savedSearchAuthorizationService;
        this.riskAnalyticsMachineToMachineAuth0Response = riskAnalyticsMachineToMachineAuth0Response;
        this.savedSearchRunReportValidator = savedSearchRunReportValidator;

    }

    [HttpGet]
    [Route("api/searches/reports/last")]
    public async Task<ActionResult<IEnumerable<SavedSearchRunReportModel>>> GetLast()
    {
        savedSearchAuthorizationService.ValidateAccessToAlertingEndpointOrThrow(User.Auth0Id(), $"{riskAnalyticsMachineToMachineAuth0Response.ClientId}@clients");
        var report = await savedSearchRunReportsService.GetTheLatestRunResults();

        return Ok(mapper.Map<IEnumerable<SavedSearchRunReportModel>>(report));
    }

    [HttpPost]
    [Route("api/searches/reports")]
    public async Task<IActionResult> Save([FromBody] IEnumerable<SavedSearchRunReportModel> request)
    {
        savedSearchAuthorizationService.ValidateAccessToAlertingEndpointOrThrow(User.Auth0Id(), $"{riskAnalyticsMachineToMachineAuth0Response.ClientId}@clients");

        var reports = new List<SavedSearchRunReport>();
        foreach(var report in request)
        {
            await savedSearchRunReportValidator.IsValidOrThrow(report);
            reports.Add(mapper.Map<SavedSearchRunReport>(report));
        }

        await savedSearchRunReportsService.Save(reports);

        var getUri = new Uri($"api/searches/reports/last", UriKind.Relative);
        return Created(getUri, 0);
    }
}
