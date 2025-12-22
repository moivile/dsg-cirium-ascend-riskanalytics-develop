using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Requests;

namespace RiskAnalytics.Api.Controllers;

[ApiController]
[Route("api/utilization")]
public class UtilizationController : ControllerBase
{
    private readonly IUtilizationService utilizationService;
    private readonly IMonthlyUtilizationPerAircraftRequestValidator monthlyUtilizationPerAircraftRequestValidator;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationService;

    public UtilizationController(IUtilizationService utilizationService, IMonthlyUtilizationPerAircraftRequestValidator monthlyUtilizationPerAircraftRequestValidator, IPortfolioAuthorizationService portfolioAuthorizationService)
    {
        this.utilizationService = utilizationService;
        this.monthlyUtilizationPerAircraftRequestValidator = monthlyUtilizationPerAircraftRequestValidator;
        this.portfolioAuthorizationService = portfolioAuthorizationService;
    }

    [HttpGet]
    [Route("")]
    public async Task<ActionResult<IEnumerable<IEnumerable<MonthlyUtilization>>>> GetMonthlyUtilization([FromQuery] GetMonthlyUtilizationRequest request)
    {
        ValidateRequest();

        var monthlyUtilization = await utilizationService.GetMonthlyUtilization(
            request.PortfolioId,
            User,
            request.GroupBy,
            request.GroupByFilterIds,
            request.OperatorId,
            request.LessorId,
            request.IncludeBaseline,
            request.IsEmissions,
            request.IsHoursAndCycle);

        return Ok(monthlyUtilization);

        void ValidateRequest()
        {
            var errorMessages = new List<string>();

            if (request.GroupBy == null && !request.IncludeBaseline)
            {
                errorMessages.Add(ValidationMessages.GetMonthlyUtilizationRequestRequiresGroupByOrIncludeBaseLine);
            }

            if (request.GroupBy != null && request.GroupByFilterIds?.Any() != true)
            {
                errorMessages.Add(ValidationMessages.GetMonthlyUtilizationRequestRequiresGroupByFilterIds);
            }

            if (errorMessages.Any())
            {
                throw new EntityValidationException(errorMessages);
            }
        }
    }

    [HttpGet]
    [Route("aircraft/monthly")]
    public async Task<ActionResult<IEnumerable<MSNUtilizationPerAircraft>>> GetMonthlyUtilizationPerAircraft([FromQuery] MonthlyUtilizationPerAircraftRequest request)
    {

        await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(request.PortfolioId, User.Auth0Id());

        monthlyUtilizationPerAircraftRequestValidator.ValidateMonthluUtilizationPerAircraftRequest(
            request.PortfolioId,
            request.EndMonthIndex,
            request.StartMonthIndex,
            request.EndYear,
            request.StartYear,
            request.IsEmissions,
            request.OperatorId,
            request.LessorId,
            User,
            request.GroupBy,
            request.GroupByFilterIds
            );
        var monthlyUtilization = await utilizationService.GetMonthlyUtilizationPerAircraft(
            request.PortfolioId,
            request.EndMonthIndex,
            request.StartMonthIndex,
            request.EndYear,
            request.StartYear,
            request.IsEmissions,
            User,
            request.OperatorId,
            request.LessorId,
            request.GroupBy,
            request.GroupByFilterIds
            );
        return Ok(monthlyUtilization);
    }


    [Route("groups")]
    public async Task<ActionResult<UtilizationGroupOptionsModel>> GetGroupOptions(int? portfolioId, int? operatorId, int? lessorId)
    {
        var groupOptions = await utilizationService.GetGroupOptions(portfolioId, operatorId, lessorId, User.Auth0Id());
        return Ok(groupOptions);
    }

    [HttpGet]
    [Route("operators")]
    public async Task<ActionResult<IEnumerable<IdNamePairModel>>> GetOperators(
        int? portfolioId,
        MonthlyUtilizationGroup? groupBy,
        [FromQuery] IReadOnlyCollection<int>? groupByFilterIds,
        int? lessorId)
    {
        if (groupBy != null && groupByFilterIds?.Any() != true)
        {
            throw new EntityValidationException(ValidationMessages.GetMonthlyUtilizationRequestRequiresGroupByFilterIds);
        }

        var operators = await utilizationService.GetOperators(portfolioId, lessorId, groupBy, groupByFilterIds, User.Auth0Id());
        return Ok(operators);
    }

    [HttpGet]
    [Route("lessors")]
    public async Task<ActionResult<IEnumerable<IdNamePairModel>>> GetLessors(
        int? portfolioId,
        MonthlyUtilizationGroup? groupBy,
        [FromQuery] IReadOnlyCollection<int>? groupByFilterIds,
        int? operatorId)
    {
        if (groupBy != null && groupByFilterIds?.Any() != true)
        {
            throw new EntityValidationException(ValidationMessages.GetMonthlyUtilizationRequestRequiresGroupByFilterIds);
        }

        var lessors = await utilizationService.GetLessors(portfolioId, operatorId, groupBy, groupByFilterIds, User.Auth0Id());
        return Ok(lessors);
    }
}