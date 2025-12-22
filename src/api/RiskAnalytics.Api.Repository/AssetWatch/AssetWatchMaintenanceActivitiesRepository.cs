using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Repository.AssetWatch;

public class AssetWatchMaintenanceActivitiesRepository : IAssetWatchMaintenanceActivitiesRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;
    public AssetWatchMaintenanceActivitiesRepository(ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public async Task<IEnumerable<IdNamePairModel>> GetMaintenanceActivities()
    {
        var sql =
            @$"SELECT ground_events_label_id  AS Id,
                name
                FROM {Constants.RiskAnalyticsTablePrefix}ground_event_labels
                ORDER BY name";

        return await snowflakeRepository.Query<IdNamePairModel>(sql);
    }

}
