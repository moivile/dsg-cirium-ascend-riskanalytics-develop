using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Controllers.AsssetWatch;
using Xunit;

namespace RiskAnalytics.Api.Tests.Controllers.AssetWatch;

public class AssetWatchMaintenanceActivitiesControllerTests
{
    private readonly IAssetWatchMaintenanceActivitiesService assetWatchMaintenanceActivitiesServiceMock;
    private readonly AssetWatchMaintenanceActivitiesController assetWatchhMaintenanceActivitiesController;
    private readonly IMapper mapper;

    public AssetWatchMaintenanceActivitiesControllerTests()
    {
        mapper = new Mapper();
        assetWatchMaintenanceActivitiesServiceMock = Substitute.For<IAssetWatchMaintenanceActivitiesService>();
        assetWatchhMaintenanceActivitiesController = new AssetWatchMaintenanceActivitiesController(assetWatchMaintenanceActivitiesServiceMock, mapper);
    }

    [Fact]
    public async Task GetMaintenanceActivities_ReturnsExpectedResult()
    {
        // Arrange                     
        assetWatchhMaintenanceActivitiesController.ControllerContext = new TestControllerContextBuilder()
            .WithAssetWatchClaim()
            .GetContext();

        // Act
        var result = (await assetWatchhMaintenanceActivitiesController.GetMaintenanceActivities()).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await assetWatchMaintenanceActivitiesServiceMock.Received().GetMaintenanceActivities();
    }

    [Fact]
    public async Task GetMaintenanceActivities_UserIsNull_ThrowUnauthorizedAccessException()
    {
        // Arrange 
        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchhMaintenanceActivitiesController.GetMaintenanceActivities());

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

    [Fact]
    public async Task GetMaintenanceActivities_UserDoesNotHaveAssetWatchEntitlement_ThrowUnauthorizedAccessException()
    {
        // Arrange
        assetWatchhMaintenanceActivitiesController.ControllerContext = new TestControllerContextBuilder()
            .WithStandardUserWithNoEntitlements()
            .GetContext();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchhMaintenanceActivitiesController.GetMaintenanceActivities());

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

}
