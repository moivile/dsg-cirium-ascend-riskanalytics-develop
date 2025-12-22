using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;
using MapsterMapper;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.AssetWatch;

namespace RiskAnalytics.Business.Tests.Services.AssetWatch
{
    public class AssetWatchMaintenanceActivitiesServiceTests
    {
        private readonly IAssetWatchMaintenanceActivitiesRepository assetWatchMaintenanceActivitiesRepositoryMock;
        private readonly IMapper mapperMock;

        private readonly AssetWatchMaintenanceActivitiesService assetWatchMaintenanceActivitiesService;

        public AssetWatchMaintenanceActivitiesServiceTests()
        {
            assetWatchMaintenanceActivitiesRepositoryMock = Substitute.For<IAssetWatchMaintenanceActivitiesRepository>();
            mapperMock = Substitute.For<IMapper>();

            assetWatchMaintenanceActivitiesService = new AssetWatchMaintenanceActivitiesService(assetWatchMaintenanceActivitiesRepositoryMock);
        }

        [Fact]
        public async Task GetMaintenanceActivity_ReturnsData()
        {
            // arrange
            assetWatchMaintenanceActivitiesRepositoryMock.GetMaintenanceActivities()
            .Returns(new List<IdNamePairModel> { new IdNamePairModel(1, "a") });

            // act
            var stats = await assetWatchMaintenanceActivitiesService.GetMaintenanceActivities();

            // assert
            Assert.NotNull(stats);
            Assert.Equal(1, stats.First().Id);
        }
    }
}
