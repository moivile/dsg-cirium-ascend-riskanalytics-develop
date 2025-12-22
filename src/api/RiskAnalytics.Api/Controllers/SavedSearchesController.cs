using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Authorization;
using RiskAnalytics.Api.Business.Services.AssetWatchSavedSearches;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Requests;
using RiskAnalytics.Api.Responses;

namespace RiskAnalytics.Api.Controllers;

[ApiController]
public class SavedSearchesController : ControllerBase
{
    private readonly ISavedSearchService savedSearchService;
    private readonly ISavedSearchValidator savedSearchValidator;
    private readonly ISavedSearchAuthorizationService savedSearchAuthorizationService;
    private readonly IMapper mapper;
    private readonly RiskAnalyticsMachineToMachineAuth0Response riskAnalyticsMachineToMachineAuth0Response;
    private readonly ISavedSearchConfigurationValidator savedSearchConfigurationValidator;

    public SavedSearchesController(
        ISavedSearchService savedSearchService,
        ISavedSearchValidator savedSearchValidator,
        ISavedSearchAuthorizationService savedSearchAuthorizationService,
        IMapper mapper,
        RiskAnalyticsMachineToMachineAuth0Response riskAnalyticsMachineToMachineAuth0Response,
        ISavedSearchConfigurationValidator savedSearchConfigurationValidator)
    {
        this.savedSearchService = savedSearchService;
        this.savedSearchValidator = savedSearchValidator;
        this.savedSearchAuthorizationService = savedSearchAuthorizationService;
        this.mapper = mapper;
        this.riskAnalyticsMachineToMachineAuth0Response = riskAnalyticsMachineToMachineAuth0Response;
        this.savedSearchConfigurationValidator = savedSearchConfigurationValidator;
    }

    [HttpGet]
    [Route("api/searches/{id:int}")]
    public async Task<ActionResult<SavedSearchModel>> Get(int id)
    {
        await savedSearchAuthorizationService.ValidateAccessToSearchOrThrow(id, User.Auth0Id());

        var search = await savedSearchService.Get(id);

        return Ok(mapper.Map<SavedSearchModel>(search!));
    }

    [HttpGet]
    [Route("api/searches")]
    public async Task<ActionResult<IEnumerable<SavedSearchModel>>> GetAllForUser()
    {
        var searches = await savedSearchService.GetAll(User.Auth0Id());

        return Ok(mapper.Map<IEnumerable<SavedSearchModel>>(searches));
    }

    [HttpGet]
    [Route("api/searches/duplicate/{savedSearchName}")]
    public async Task<IActionResult> ValidateName(string savedSearchName)
    {
        var isDuplicate = !(await savedSearchValidator.IsNameUnique(savedSearchName, User.Auth0Id()));

        return Ok(isDuplicate);
    }

    [HttpGet]
    [Route("api/searches/all")]
    public async Task<ActionResult<IEnumerable<UserSavedSearchModel>>> GetAll()
    {
        savedSearchAuthorizationService.ValidateAccessToAlertingEndpointOrThrow(User.Auth0Id(), $"{riskAnalyticsMachineToMachineAuth0Response.ClientId}@clients");
        var searches = await savedSearchService.GetAllUserSavedSearches();

        return Ok(mapper.Map<IEnumerable<UserSavedSearchModel>>(searches));
    }

    [HttpPost]
    [Route("api/searches")]
    public async Task<IActionResult> Create(SavedSearchRequest request)
    {
        var search = mapper.Map<SavedSearchModel>(request);

        await savedSearchValidator.IsValidOrThrow(search);

        var searchId = await savedSearchService.Create(search, User.Auth0Id());

        var getUri = new Uri($"api/searches/{searchId}", UriKind.Relative);
        return Created(getUri, searchId);
    }

    [HttpPut]
    [Route("api/searches/{searchId:int}")]
    public async Task<IActionResult> Update(int searchId, SavedSearchRequest request)
    {
        await savedSearchAuthorizationService.ValidateAccessToSearchOrThrow(searchId, User.Auth0Id());

        var search = mapper.Map<SavedSearchModel>(request);
        search.Id = searchId;
        search.UserId = User.Auth0Id();

        await savedSearchService.Update(search);

        return NoContent();
    }

    [HttpPut]
    [Route("api/searches/{id:int}/is-active")]
    public async Task<IActionResult> UpdateIsActive(int id, [FromBody] bool isActive)
    {
        await savedSearchAuthorizationService.ValidateAccessToSearchOrThrow(id, User.Auth0Id());

        await savedSearchService.UpdateIsActive(id, isActive);

        return NoContent();
    }

    [HttpPut]
    [Route("api/searches/{id:int}/name-description")]
    public async Task<IActionResult> UpdateNameAndDescription(int id, [FromBody] UpdateNameAndDescriptionRequest request)
    {
        await savedSearchAuthorizationService.ValidateAccessToSearchOrThrow(id, User.Auth0Id());

        await savedSearchService.UpdateNameAndDescription(id, request.Name, request.Description);

        return NoContent();
    }

    [HttpDelete]
    [Route("api/searches/{searchId:int}")]
    public async Task<IActionResult> Delete(int searchId)
    {
        await savedSearchAuthorizationService.ValidateAccessToSearchOrThrow(searchId, User.Auth0Id());
        await savedSearchService.Delete(searchId, User.Auth0Id());
        return NoContent();
    }

    [HttpPost]
    [Route("api/searches/process")]
    public async Task<ActionResult<AssetWatchListGridDataResponseModel>> ProcessSavedSearch([FromBody] EmailAlertsUserSavedSearchModel userSavedSearch)
    {
        savedSearchAuthorizationService.ValidateAccessToAlertingEndpointOrThrow(User.Auth0Id(), $"{riskAnalyticsMachineToMachineAuth0Response.ClientId}@clients");
        var userProcessedSavedSearch = await savedSearchService.ProcessUserSavedSearch(userSavedSearch, User.Auth0Id());

        return Ok(mapper.Map<AssetWatchListGridDataResponseModel>(userProcessedSavedSearch));
    }

    [HttpPost]
    [Route("api/searches/{id:int}/sent")]
    public async Task<IActionResult> TrackProcessedAlertForUser(int id, string processedTimeSlot)
    {
        savedSearchAuthorizationService.ValidateAccessToAlertingEndpointOrThrow(User.Auth0Id(), $"{riskAnalyticsMachineToMachineAuth0Response.ClientId}@clients");

        var dateTimeSent = DateTime.Parse(processedTimeSlot);
        await savedSearchService.TrackProcessedAlertForUser(id, dateTimeSent);

        return NoContent();
    }

    [HttpGet]
    [Route("api/searches/frequency")]
    public async Task<IActionResult> GetFrequency()
    {
        var frequency = await savedSearchService.GetFrequency(User.Auth0Id());
        var response = frequency == SavedSearchFrequency.Daily ? "Daily" : "AlertsOnly";

        return Ok(response);
    }

    [HttpPut]
    [Route("api/searches/frequency")]
    public async Task<IActionResult> UpdateFrequency(SavedSearchFrequencyRequest request)
    {
        savedSearchConfigurationValidator.IsValidOrThrow(request.Frequency);

        var frequency = request.Frequency.Equals("daily", StringComparison.InvariantCultureIgnoreCase) ? SavedSearchFrequency.Daily : SavedSearchFrequency.AlertsOnly;
        await savedSearchService.SetFrequency(User.Auth0Id(), frequency);

        return NoContent();
    }
}
