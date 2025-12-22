using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Controllers.AsssetWatch;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Requests;
using Xunit;

namespace RiskAnalytics.Api.Tests.Controllers.AssetWatch
{
    public class PortfolioAssetWatchControllerTests
    {
        private readonly ITrackedUtilizationService trackedUtilizationServiceMock;
        private readonly IGroundEventsService groundEventsServiceMock;

        private readonly PortfolioAssetWatchSummaryController portfolioAssetWatchController;

        public PortfolioAssetWatchControllerTests()
        {
            trackedUtilizationServiceMock = Substitute.For<ITrackedUtilizationService>();
            groundEventsServiceMock = Substitute.For<IGroundEventsService>();
            portfolioAssetWatchController = new PortfolioAssetWatchSummaryController(trackedUtilizationServiceMock, groundEventsServiceMock);
        }

        [Fact]
        public async Task SummaryFlights_NoParams_ReturnsExpectedResult()
        {
            // Arrange
            var searchAircraftRequest = new SearchAircraftRequest();

            portfolioAssetWatchController.ControllerContext = new TestControllerContextBuilder()
                .WithAssetWatchClaim()
                .GetContext();

            // Act
            var result = (await portfolioAssetWatchController.SummaryFlights(5, new AssetWatchSearchParameters(), AssetWatchGroupingOption.Region)).Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            await trackedUtilizationServiceMock.Received().SummaryFlights(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<AssetWatchSearchParameters>(), Arg.Any<AssetWatchGroupingOption>());
        }

        [Fact]
        public async Task SummaryFlights_UserDoesNotHaveAssetWatchEntitlement_ThrowUnauthorizedAccessException()
        {
            // Arrange
            var searchAircraftRequest = new SearchAircraftRequest();

            portfolioAssetWatchController.ControllerContext = new TestControllerContextBuilder()
                .WithStandardUserWithNoEntitlements()
                .GetContext();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await portfolioAssetWatchController.SummaryFlights(5, new AssetWatchSearchParameters(), AssetWatchGroupingOption.Region));

            Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
        }

        [Fact]
        public async Task SummaryGroundEvents_NoParams_ReturnsExpectedResult()
        {
            // Arrange
            var searchAircraftRequest = new SearchAircraftRequest();

            portfolioAssetWatchController.ControllerContext = new TestControllerContextBuilder()
                .WithAssetWatchClaim()
                .GetContext();

            // Act
            var result = (await portfolioAssetWatchController.SummaryGroundEvents(5, new AssetWatchSearchParameters(), AssetWatchGroupingOption.Region)).Result as OkObjectResult;

            // Assert
            await groundEventsServiceMock.Received().SummaryGroundEvents(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<AssetWatchSearchParameters>(), Arg.Any<AssetWatchGroupingOption>());
        }

        [Fact]
        public async Task SummaryGroundEvents_UserDoesNotHaveAssetWatchEntitlement_ThrowUnauthorizedAccessException()
        {
            // Arrange
            var searchAircraftRequest = new SearchAircraftRequest();

            portfolioAssetWatchController.ControllerContext = new TestControllerContextBuilder()
                .WithStandardUserWithNoEntitlements()
                .GetContext();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await portfolioAssetWatchController.SummaryGroundEvents(5, new AssetWatchSearchParameters(), AssetWatchGroupingOption.Region));

            Assert.Equal(ValidationMessages.UserDoesNotHaveEntitlementToAssetWatch, exception.Message);
        }

    }
}
