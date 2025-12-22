using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.Interfaces;
public interface IAssetWatchMaintenanceActivitiesService
{
    Task<IEnumerable<IdNamePairModel>>GetMaintenanceActivities();
}
