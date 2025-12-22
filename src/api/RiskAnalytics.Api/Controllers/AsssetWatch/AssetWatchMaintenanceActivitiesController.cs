using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Controllers.AsssetWatch;
[ApiController]
public class AssetWatchMaintenanceActivitiesController : AssetWatchBaseController
{
    private readonly IAssetWatchMaintenanceActivitiesService assetWatchMaintenanceActivitiesService;

    private readonly IMapper mapper;
    public AssetWatchMaintenanceActivitiesController(IAssetWatchMaintenanceActivitiesService assetWatchMaintenanceActivitiesService, IMapper mapper)
    {
        this.assetWatchMaintenanceActivitiesService = assetWatchMaintenanceActivitiesService;
        this.mapper = mapper;
    }

    [HttpGet]
    [Route("api/assetwatch/maintenanceactivities")]
    public async Task<ActionResult<IEnumerable<IdNamePairModel>>> GetMaintenanceActivities()
    {
        CheckEntitlementToAssetWatch(User);
        var maintennaceActivityData = await assetWatchMaintenanceActivitiesService.GetMaintenanceActivities();
        return Ok(maintennaceActivityData);
    }

}
