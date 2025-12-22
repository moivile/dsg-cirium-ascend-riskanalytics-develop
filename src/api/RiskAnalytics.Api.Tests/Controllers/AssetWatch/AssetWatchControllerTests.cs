using MapsterMapper;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.AssetWatch;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Controllers.AsssetWatch;
using RiskAnalytics.Api.Model;
using Xunit;

namespace RiskAnalytics.Api.Tests.Controllers.AssetWatch;

public class AssetWatchControllerTests
{
    private readonly IAssetWatchFiltersService assetWatchServiceMock;
    private readonly IAssetWatchFlightDetailsService assetWatchFlightDetailsServiceMock;
    private readonly IAssetWatchTableService assetWatchTableServiceMock;

    private readonly AssetWatchController assetWatchController;
    private readonly IMapper mapper;

    public AssetWatchControllerTests()
    {
        mapper = new Mapper();
        assetWatchServiceMock = Substitute.For<IAssetWatchFiltersService>();
        assetWatchFlightDetailsServiceMock = Substitute.For<IAssetWatchFlightDetailsService>();
        assetWatchTableServiceMock = Substitute.For<IAssetWatchTableService>();

        assetWatchController = new AssetWatchController(assetWatchServiceMock,
            assetWatchTableServiceMock,
            assetWatchFlightDetailsServiceMock,
            mapper);
    }

    [Fact]
    public async Task GetFiltersData_NoParams_ReturnsExpectedResult()
    {
        // Arrange
        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithAssetWatchClaim()
            .GetContext();

        // Act
        var result = (await assetWatchController.GetFiltersData(5)).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await assetWatchServiceMock.Received().GetFilters(5, Arg.Any<string>());
    }

    [Fact]
    public async Task GetFiltersData_UserIsNull_ThrowUnauthorizedAccessException()
    {
        // Arrange
        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchController.GetFiltersData(5));

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

    [Fact]
    public async Task GetFiltersData_UserDoesNotHaveAssetWatchEntitlement_ThrowUnauthorizedAccessException()
    {
        // Arrange
        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithStandardUserWithNoEntitlements()
            .GetContext();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchController.GetFiltersData(5));

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

    [Fact]
    public async Task GetTableData_NoParams_ReturnsExpectedResult()
    {
        // Arrange
        var portfolioId = 5;
        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithAssetWatchClaim()
            .GetContext();

        var filterCriteria = new AssetWatchTableSearchParameters();

        // Act
        var result = (await assetWatchController.GetTableData(portfolioId, filterCriteria)).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await assetWatchTableServiceMock.Received().GetTableData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>(), Arg.Any<string>());
    }

    [Fact]
    public async Task GetTableData_UserIsNull_ThrowUnauthorizedAccessException()
    {
        // Arrange
        var filterCriteria = new AssetWatchTableSearchParameters();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchController.GetTableData(5, filterCriteria));

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

    [Fact]
    public async Task GetTableData_UserDoesNotHaveAssetWatchEntitlement_ThrowUnauthorizedAccessException()
    {
        // Arrange
        var filterCriteria = new AssetWatchTableSearchParameters();

        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithStandardUserWithNoEntitlements()
            .GetContext();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchController.GetTableData(5, filterCriteria));

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

    [Fact]
    public async Task GetFlightDetailsData_NoParams_ReturnsExpectedResult()
    {
        // Arrange
        var aircraftId = 5;
        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithAssetWatchClaim()
            .GetContext();

        var filterCriteria = new AssetWatchTableSearchParameters();

        // Act
        var result = (await assetWatchController.GetFlightDetailsData(aircraftId, filterCriteria)).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await assetWatchFlightDetailsServiceMock.Received().GetFlightDetails(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>());
    }

    [Fact]
    public async Task GetAssetWatchFilterCities_NoParams_ReturnsExpectedResult()
    {
        // Arrange
        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithAssetWatchClaim()
            .GetContext();
        var countryIds = new List<string> { "1", "2", "3" };

        // Act
        var result = (await assetWatchController.GetAssetWatchFilterCities(countryIds)).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await assetWatchServiceMock.Received().GetAssetWatchFilterCities(countryIds);
    }

    [Fact]
    public async Task GetAssetWatchFilterCities_UserIsNull_ThrowUnauthorizedAccessException()
    {
        // Arrange
        var countryIds = new List<string> { "1", "2", "3" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchController.GetAssetWatchFilterCities(countryIds));

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

    [Fact]
    public async Task GetAssetWatchFilterCities_UserDoesNotHaveAssetWatchEntitlement_ThrowUnauthorizedAccessException()
    {
        // Arrange
        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithStandardUserWithNoEntitlements()
            .GetContext();
        var countryIds = new List<string> { "1", "2", "3" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchController.GetAssetWatchFilterCities(countryIds));

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

    [Fact]
    public async Task GetAssetWatchFilterAirports_NoParams_ReturnsExpectedResult()
    {
        // Arrange
        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithAssetWatchClaim()
            .GetContext();
        var countryIds = new List<string> { "1", "2", "3" };

        // Act
        var result = (await assetWatchController.GetAssetWatchFilterAirports(countryIds)).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await assetWatchServiceMock.Received().GetAssetWatchFilterAirports(countryIds);
    }

    [Fact]
    public async Task GetAssetWatchFilterAirports_UserIsNull_ThrowUnauthorizedAccessException()
    {
        // Arrange
        var countryIds = new List<string> { "1", "2", "3" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchController.GetAssetWatchFilterAirports(countryIds));

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }

    [Fact]
    public async Task GetAssetWatchFilterAirports_UserDoesNotHaveAssetWatchEntitlement_ThrowUnauthorizedAccessException()
    {
        // Arrange
        assetWatchController.ControllerContext = new TestControllerContextBuilder()
            .WithStandardUserWithNoEntitlements()
            .GetContext();
        var countryIds = new List<string> { "1", "2", "3" };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await assetWatchController.GetAssetWatchFilterAirports(countryIds));

        Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
    }
}
