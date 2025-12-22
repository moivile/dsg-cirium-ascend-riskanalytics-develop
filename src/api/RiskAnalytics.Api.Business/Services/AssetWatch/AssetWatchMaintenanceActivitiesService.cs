using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.AssetWatch;

public class AssetWatchMaintenanceActivitiesService : IAssetWatchMaintenanceActivitiesService
{
    private readonly IAssetWatchMaintenanceActivitiesRepository assetWatchMaintenanceActivitiesRepositor;
    public AssetWatchMaintenanceActivitiesService(IAssetWatchMaintenanceActivitiesRepository assetWatchMaintenanceActivitiesRepositor)
    {
        this.assetWatchMaintenanceActivitiesRepositor = assetWatchMaintenanceActivitiesRepositor;
    }
    public async Task<IEnumerable<IdNamePairModel>> GetMaintenanceActivities()
    {
       return await assetWatchMaintenanceActivitiesRepositor.GetMaintenanceActivities();
    }

}
