using NSubstitute;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.AssetWatch;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests.AssetWatch;
public class AssetWatchMaintenanceActivititesTests
{
    private readonly IAssetWatchMaintenanceActivitiesRepository assetWatchMaintenanceActivitiesRepository;
    private readonly ISnowflakeRepository snowflakeRepositoryMock;

    public AssetWatchMaintenanceActivititesTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        assetWatchMaintenanceActivitiesRepository = new AssetWatchMaintenanceActivitiesRepository(snowflakeRepositoryMock);
    }

    [Fact]
    public async Task GetMaintenanceActivity_CallDbWithExpectedQuery()
    {
        // arrange
        const string expectedSql = $@"SELECT ground_events_label_id  AS Id,
                name
                FROM {Constants.RiskAnalyticsTablePrefix}ground_event_labels
                ORDER BY name";

        // act
        await assetWatchMaintenanceActivitiesRepository.GetMaintenanceActivities();

        //assert
        await snowflakeRepositoryMock.Received().Query<IdNamePairModel>(expectedSql, Arg.Any<object>());
    }
}

