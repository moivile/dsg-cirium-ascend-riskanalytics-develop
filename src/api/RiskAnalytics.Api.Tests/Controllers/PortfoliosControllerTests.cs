using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Controllers;
using Xunit;
using MapsterMapper;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Requests;
using NSubstitute;

namespace RiskAnalytics.Api.Tests.Controllers;

public class PortfoliosControllerTests
{
    private readonly IPortfoliosService portfoliosServiceMock;
    private readonly IPortfolioValidator portfolioValidatorMock;
    private readonly IMapper mapperMock;
    private readonly PortfoliosController portfoliosController;

    public PortfoliosControllerTests()
    {
        portfoliosServiceMock = Substitute.For<IPortfoliosService>();
        portfolioValidatorMock= Substitute.For<IPortfolioValidator>();
        mapperMock = Substitute.For<IMapper>();
        portfoliosController = new PortfoliosController(portfoliosServiceMock, portfolioValidatorMock, mapperMock);
    }

    [Fact]
    public async Task Get_CalledServiceGetMethodAndReturnedOkResult()
    {
        // Arrange
        portfoliosController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = (await portfoliosController.Get(1)).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await portfoliosServiceMock.Received().Get(Arg.Any<int>(), Arg.Any<string>());
    }

    [Fact]
    public async Task GetAll_CalledServiceGetMethodAndReturnedOkResult()
    {
        // Arrange
        portfoliosController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = (await portfoliosController.GetAll()).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await portfoliosServiceMock.Received().GetAll(Arg.Any<string>());
    }

    [Fact]
    public async Task Delete_SuccessfullyDeleted_NoContent()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        portfoliosController.ControllerContext = controllerContext;

        // Act
        var result = await portfoliosController.Delete(1) as NoContentResult;

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task Create_SuccessfullyCreated_CreatedResultWithGetEndpointUrl()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        portfoliosController.ControllerContext = controllerContext;

        var createPortfolioRequest = new PortfolioRequest();

        portfoliosServiceMock.Create(Arg.Any<Portfolio>())
            .Returns(5);
        mapperMock.Map<Portfolio>(createPortfolioRequest).Returns(new Portfolio());

        var expectedLocation = "api/portfolios/5";

        // Act
        var result = await portfoliosController.Create(createPortfolioRequest) as CreatedResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedLocation, result.Location);
    }

    [Fact]
    public async Task Update_SuccessfullyUpdated_NoContentResult()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        portfoliosController.ControllerContext = controllerContext;

        var createPortfolioRequest = new PortfolioRequest();

        mapperMock.Map<Portfolio>(createPortfolioRequest).Returns(new Portfolio());

        // Act
        var result = await portfoliosController.Update(1, createPortfolioRequest) as NoContentResult;

        // Assert
        Assert.NotNull(result);
    }
}
