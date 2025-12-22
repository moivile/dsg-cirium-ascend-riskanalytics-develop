using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Repository.Interfaces
{
    public interface IAssetWatchMaintenanceActivitiesRepository
    {
        Task<IEnumerable<IdNamePairModel>> GetMaintenanceActivities();
    }
}
