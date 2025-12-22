using MapsterMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Controllers;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Responses;
using System.Security.Claims;
using Xunit;

namespace RiskAnalytics.Api.Tests.Controllers;

public class SavedSearchRunReportsControllerTests
{
    private readonly IMapper mapperMock;
    private readonly SavedSearchRunReportsController controller;
    private readonly ISavedSearchAuthorizationService authorizationServiceMock;
    private readonly ISavedSearchRunReportsService savedSearchRunReportsServiceMock;
    private readonly ISavedSearchRunReportValidator savedSearchRunReportValidatorMock;

    public SavedSearchRunReportsControllerTests()
    {
        mapperMock = Substitute.For<IMapper>();
        authorizationServiceMock = Substitute.For<ISavedSearchAuthorizationService>();
        savedSearchRunReportsServiceMock = Substitute.For<ISavedSearchRunReportsService>();
        savedSearchRunReportValidatorMock = Substitute.For<ISavedSearchRunReportValidator>();

        controller = new SavedSearchRunReportsController(savedSearchRunReportsServiceMock,
            authorizationServiceMock,
            new RiskAnalyticsMachineToMachineAuth0Response(),
            mapperMock,
            savedSearchRunReportValidatorMock);
    }

    [Fact]
    public async Task GetLast_CalledServiceGetMethodAndReturnedOkResult()
    {
        // Arrange
        controller.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = (await controller.GetLast()).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await savedSearchRunReportsServiceMock.Received().GetTheLatestRunResults();
    }

    [Fact]
    public async Task GetLast_CalledValidateAccessToAlertingEndpointOrThrowOkResult()
    {
        // Arrange
        controller.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        await controller.GetLast();

        // Assert
        authorizationServiceMock.Received().ValidateAccessToAlertingEndpointOrThrow(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task Create_CalledValidator()
    {
        // Arrange
        controller.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        await controller.Save(new List<SavedSearchRunReportModel>
        {
            new SavedSearchRunReportModel()
        });

        // Assert
        await savedSearchRunReportValidatorMock.Received().IsValidOrThrow(Arg.Any<SavedSearchRunReportModel>());
    }

    [Fact]
    public async Task Create_CalledValidateAccessToAlertingEndpointOrThrowOkResult()
    {
        // Arrange
        controller.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        await controller.Save(new List<SavedSearchRunReportModel>
        {
            new SavedSearchRunReportModel()
        });

        // Assert
        authorizationServiceMock.Received().ValidateAccessToAlertingEndpointOrThrow(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task Create_SuccessfullyCreated_CreatedResultWithGetEndpointUrl()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        controller.ControllerContext = controllerContext;

        var createPortfolioRequest = new List<SavedSearchRunReportModel> {
            new SavedSearchRunReportModel()
        };

        await savedSearchRunReportsServiceMock.Save(Arg.Any<IEnumerable<SavedSearchRunReport>>());

        var expectedLocation = "api/searches/reports/last";

        // Act
        var result = await controller.Save(createPortfolioRequest) as CreatedResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedLocation, result.Location);
    }
}
