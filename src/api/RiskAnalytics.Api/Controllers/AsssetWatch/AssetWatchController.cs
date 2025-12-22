using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Responses;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Business.Services.AssetWatch;

namespace RiskAnalytics.Api.Controllers.AsssetWatch;
[ApiController]
public class AssetWatchController : AssetWatchBaseController
{
    private readonly IAssetWatchFiltersService assetWatchFiltersService;
    private readonly IAssetWatchTableService assetWatchTableService;
    private readonly IAssetWatchFlightDetailsService assetWatchFlightDetailsService;

    private readonly IMapper mapper;
    public AssetWatchController(IAssetWatchFiltersService assetWatchService,
        IAssetWatchTableService assetWatchTableService,
        IAssetWatchFlightDetailsService assetWatchFlightDetailsService,
        IMapper mapper)
    {
        this.assetWatchFiltersService = assetWatchService;
        this.assetWatchFlightDetailsService = assetWatchFlightDetailsService;
        this.assetWatchTableService = assetWatchTableService;
        this.mapper = mapper;
    }

    [HttpGet]
    [Route("api/portfolios/{portfolioId:int}/assetwatch/filterdata")]
    public async Task<ActionResult<IEnumerable<AssetWatchFilterOptions>>> GetFiltersData(int portfolioId)
    {
        CheckEntitlementToAssetWatch(User);

        var assetWatchFilterData = await assetWatchFiltersService.GetFilters(portfolioId, User.Auth0Id());
        var response = mapper.Map<AssetWatchFilterOptions>(assetWatchFilterData);
        return Ok(response);
    }

    [HttpGet]
    [Route("api/assetwatch/filterdata/cities")]
    public async Task<ActionResult<IEnumerable<StringIdNamePairModel>>> GetAssetWatchFilterCities([FromQuery] List<string> countryIds)
    {
        CheckEntitlementToAssetWatch(User);

        var assetWatchFilterCitiesData = await assetWatchFiltersService.GetAssetWatchFilterCities(countryIds);
        return Ok(assetWatchFilterCitiesData);
    }

    [HttpGet]
    [Route("api/assetwatch/filterdata/airports")]
    public async Task<ActionResult<IEnumerable<StringIdNamePairModel>>> GetAssetWatchFilterAirports([FromQuery] List<string> countryIds)
    {
        CheckEntitlementToAssetWatch(User);

        var assetWatchFilterAirportsData = await assetWatchFiltersService.GetAssetWatchFilterAirports(countryIds);
        return Ok(assetWatchFilterAirportsData);
    }

    [HttpGet]
    [Route("api/portfolios/{portfolioId:int}/assetwatch/flights")]
    public async Task<ActionResult<AssetWatchListDataGridResponse>> GetTableData(int portfolioId, [FromQuery] AssetWatchTableSearchParameters assetWatchSearchParameters)
    {
        CheckEntitlementToAssetWatch(User);

        var assetWatchFlights = await assetWatchTableService.GetTableData(portfolioId, assetWatchSearchParameters, User.Auth0Id());
        var response = mapper.Map<AssetWatchListDataGridResponse>(assetWatchFlights);
        return Ok(response);
    }

    [HttpGet]
    [Route("api/portfolios/{portfolioId:int}/assetwatch/flightdetails")]
    public async Task<ActionResult<FlightDetailsResponse>> GetFlightDetailsData(int aircraftId, [FromQuery] AssetWatchTableSearchParameters assetWatchSearchParameters)
    {
        CheckEntitlementToAssetWatch(User);

        var flightDetailsData = await assetWatchFlightDetailsService.GetFlightDetails(aircraftId, assetWatchSearchParameters);
        var response = mapper.Map<FlightDetailsResponse>(flightDetailsData);
        return Ok(response);
    }
}
