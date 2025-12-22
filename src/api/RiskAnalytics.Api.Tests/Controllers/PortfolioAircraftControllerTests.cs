using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Controllers;
using System.Security.Claims;
using Xunit;
using MapsterMapper;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Responses;
using NSubstitute;

namespace RiskAnalytics.Api.Tests.Controllers;

public class PortfolioAircraftControllerTests
{
    private readonly IPortfolioAircraftService portfolioAircraftServiceMock;
    private readonly IMapper mapperMock;

    private readonly PortfolioAircraftController portfolioAircraftController;

    public PortfolioAircraftControllerTests()
    {
        portfolioAircraftServiceMock = Substitute.For<IPortfolioAircraftService>();
        mapperMock = Substitute.For<IMapper>();

        portfolioAircraftController = new PortfolioAircraftController(
            portfolioAircraftServiceMock,
            mapperMock);
    }

    [Fact]
    public async Task GetAll_Should_Return_OkResult()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, "user1") });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        portfolioAircraftController.ControllerContext = controllerContext;

        var portfolioAircraft = new List<AircraftModel>
        {
            new()
            {
                AircraftId = 123
            }
        };

        portfolioAircraftServiceMock.GetAll(1, "user1").Returns(portfolioAircraft);

        mapperMock.Map<List<AircraftResponse>>(portfolioAircraft).Returns(new List<AircraftResponse>());

        // Act
        var result = (await portfolioAircraftController.GetAll(1)).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await portfolioAircraftServiceMock.Received().GetAll(1, "user1");
        mapperMock.Received().Map<List<AircraftResponse>>(portfolioAircraft);
    }
}
