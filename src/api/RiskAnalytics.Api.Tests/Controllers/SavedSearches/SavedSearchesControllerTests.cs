using MapsterMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.AssetWatchSavedSearches;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Controllers;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Requests;
using RiskAnalytics.Api.Responses;
using System.Security.Claims;
using Xunit;

namespace RiskAnalytics.Api.Tests.Controllers.SavedSearches;

public class SavedSearchesControllerTests
{
    private readonly ISavedSearchService savedSearchServiceMock;
    private readonly ISavedSearchValidator savedSearchValidatorMock;
    private readonly ISavedSearchConfigurationValidator savedSearchConfigurationValidatorMock;
    private readonly ISavedSearchAuthorizationService savedSearchAuthorizationServiceMock;
    private readonly IMapper mapperMock;
    private readonly SavedSearchesController savedSearchesController;

    public SavedSearchesControllerTests()
    {
        savedSearchServiceMock = Substitute.For<ISavedSearchService>();
        savedSearchValidatorMock = Substitute.For<ISavedSearchValidator>();
        savedSearchAuthorizationServiceMock = Substitute.For<ISavedSearchAuthorizationService>();
        mapperMock = Substitute.For<IMapper>();
        savedSearchConfigurationValidatorMock = Substitute.For<ISavedSearchConfigurationValidator>();

        savedSearchesController = new SavedSearchesController(savedSearchServiceMock,
            savedSearchValidatorMock,
            savedSearchAuthorizationServiceMock,
            mapperMock,
            new RiskAnalyticsMachineToMachineAuth0Response(),
            savedSearchConfigurationValidatorMock);
    }

    [Fact]
    public async Task Get_CalledServiceGetMethodAndReturnedOkResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = (await savedSearchesController.Get(1)).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await savedSearchServiceMock.Received().Get(Arg.Any<int>());
    }

    [Fact]
    public async Task Get_SearchDoesNotExist_ThrowNotFound()
    {
        // arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;
        savedSearchServiceMock
            .When(x => x.Get(Arg.Any<int>()))
            .Do(x => { throw new NotFoundException(); });

        // act & assert
        await Assert.ThrowsAsync<NotFoundException>(async () => await savedSearchesController.Get(1));
    }

    [Fact]
    public async Task Get_UserDoesNotOwnSearch_ThrowForbidden()
    {
        // arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;

        savedSearchAuthorizationServiceMock
            .When(x => x.ValidateAccessToSearchOrThrow(Arg.Any<int>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

        // act & assert
        await Assert.ThrowsAsync<ForbiddenException>(async () => await savedSearchesController.Get(1));
    }

    [Fact]
    public async Task GetAll_CalledServiceGetMethodAndReturnedOkResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = (await savedSearchesController.GetAllForUser()).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await savedSearchServiceMock.Received().GetAll(Arg.Any<string>());
    }

    [Fact]
    public async Task GetAllUserSavedSearches_CalledServiceGetMethodAndReturnedOkResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = (await savedSearchesController.GetAll()).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await savedSearchServiceMock.Received().GetAllUserSavedSearches();
    }

    [Fact]
    public async Task Delete_SuccessfullyDeleted_NoContent()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;

        // Act
        var result = await savedSearchesController.Delete(1) as NoContentResult;

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task Delete_SearchDoesNotExist_ThrowNotFound()
    {
        // arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;

        savedSearchAuthorizationServiceMock
            .When(x => x.ValidateAccessToSearchOrThrow(Arg.Any<int>(), Arg.Any<string>()))
            .Do(x => { throw new NotFoundException(); });

        // act & assert
        await Assert.ThrowsAsync<NotFoundException>(async () => await savedSearchesController.Delete(1));
        await savedSearchServiceMock.DidNotReceive().Delete(Arg.Any<int>(), Arg.Any<string>());
    }

    [Fact]
    public async Task Delete_UserDoesNotOwnSearch_ThrowForbidden()
    {
        // arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;
        savedSearchAuthorizationServiceMock
             .When(x => x.ValidateAccessToSearchOrThrow(Arg.Any<int>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

        // act & assert
        await Assert.ThrowsAsync<ForbiddenException>(async () => await savedSearchesController.Delete(1));
        await savedSearchServiceMock.DidNotReceive().Delete(Arg.Any<int>(), Arg.Any<string>());
    }

    [Fact]
    public async Task Delete_SearchExistsAndOwnedByUser_DeleteSearch()
    {
        // arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;

        savedSearchServiceMock.Get(Arg.Any<int>()).Returns(new SavedSearchModel { UserId = SharedTestConsts.User });

        // act
        await savedSearchesController.Delete(1);

        // assert
        await savedSearchServiceMock.Received().Delete(1, SharedTestConsts.User);
    }

    [Fact]
    public async Task Create_SuccessfullyCreated_CreatedResultWithGetEndpointUrl()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;

        var createRequest = new SavedSearchRequest();
        mapperMock.Map<SavedSearchModel>(createRequest).Returns(new SavedSearchModel());
        savedSearchServiceMock.Create(Arg.Any<SavedSearchModel>(), Arg.Any<string>())
            .Returns(5);

        var expectedLocation = "api/searches/5";

        // Act
        var result = await savedSearchesController.Create(createRequest) as CreatedResult;

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
        savedSearchesController.ControllerContext = controllerContext;
        var createSearchRequest = new SavedSearchRequest();

        mapperMock.Map<SavedSearchModel>(createSearchRequest).Returns(new SavedSearchModel());

        // Act
        var result = await savedSearchesController.Update(1, createSearchRequest) as NoContentResult;

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task Update_CallsValidateAccessToPortfolioOrThrow()
    {
        var id = 1;
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;
        var createSearchRequest = new SavedSearchRequest();

        mapperMock.Map<SavedSearchModel>(createSearchRequest).Returns(new SavedSearchModel());
        // act
        await savedSearchesController.Update(id, createSearchRequest);

        // assert
        await savedSearchAuthorizationServiceMock.Received().ValidateAccessToSearchOrThrow(id, SharedTestConsts.User);
    }

    [Fact]
    public async Task GetAll_CalledServiceGetAllUserSavedSearchesMethodAndReturnedOkResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = (await savedSearchesController.GetAll()).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await savedSearchServiceMock.Received().GetAllUserSavedSearches();
    }

    [Fact]
    public async Task ProcessSavedSearch_CalledServiceProcessUserSavedSearchMethodAndReturnedOkResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = (await savedSearchesController.ProcessSavedSearch(new EmailAlertsUserSavedSearchModel())).Result as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await savedSearchServiceMock.Received().ProcessUserSavedSearch(Arg.Any<EmailAlertsUserSavedSearchModel>(), Arg.Any<string>());
    }

    [Fact]
    public async Task TrackProcessedAlertForUser_CalledServiceTrackProcessedAlertForUserMethodAndReturnedOkResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        await savedSearchesController.TrackProcessedAlertForUser(1, "2024-04-12T05:00:00");

        // Assert
        await savedSearchServiceMock.Received().TrackProcessedAlertForUser(Arg.Any<int>(), Arg.Any<DateTime>());
    }

    public async Task GetAll_CalledServiceSetFrequencyMethodAndReturnedOkResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();
        var request = new SavedSearchFrequencyRequest();

        // Act
        var result = await savedSearchesController.UpdateFrequency(request) as NoContentResult;

        // Assert
        Assert.NotNull(result);
        savedSearchConfigurationValidatorMock.Received().IsValidOrThrow(Arg.Any<string>());
        await savedSearchServiceMock.Received().SetFrequency(Arg.Any<string>(), Arg.Any<SavedSearchFrequency>());
    }

    [Fact]
    public async Task GetFrequency_CalledServiceGetMethodAndReturnedOkResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = await savedSearchesController.GetFrequency() as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        await savedSearchServiceMock.Received().GetFrequency(Arg.Any<string>());
    }

    [Fact]
    public async Task ValidateName_WhenNameIsNotUnique_ReturnsTrue()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;

        savedSearchValidatorMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
            .Returns(false);

        // Act
        var result = await savedSearchesController.ValidateName("duplicate saved search name") as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.True((bool)result.Value);
    }

    [Fact]
    public async Task ValidateName_WhenNameIsUnique_ReturnsFalse()
    {
        // Arrange
        var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
        var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claimsPrincipal } };
        savedSearchesController.ControllerContext = controllerContext;

        savedSearchValidatorMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
            .Returns(true);

        // Act
        var result = await savedSearchesController.ValidateName("unique saved search name") as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.False((bool)result.Value);
    }
    public async Task UpdateIsActive_SuccessfullyUpdated_NoContentResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = await savedSearchesController.UpdateIsActive(1, true) as NoContentResult;

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateIsActive_CallsValidateAccessToSearchOrThrow()
    {
        var id = 1;
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // act
        await savedSearchesController.UpdateIsActive(id, true);

        // assert
        await savedSearchAuthorizationServiceMock.Received().ValidateAccessToSearchOrThrow(id, SharedTestConsts.User);
    }

    [Fact]
    public async Task UpdateIsActive_CallsUpdateIsActive()
    {
        var id = 1;
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // act
        await savedSearchesController.UpdateIsActive(id, true);

        // assert
        await savedSearchServiceMock.Received().UpdateIsActive(id, true);
    }

    public async Task UpdateNameAndDescription_SuccessfullyUpdated_NoContentResult()
    {
        // Arrange
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // Act
        var result = await savedSearchesController.UpdateNameAndDescription(1, new UpdateNameAndDescriptionRequest
        {
            Name = "name",
            Description = "description"
        }) as NoContentResult;

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateNameAndDescription_CallsValidateAccessToSearchOrThrow()
    {


        var id = 1;

        var request = new UpdateNameAndDescriptionRequest
        {
            Name = "name",
            Description = "description"
        };

        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();



        // act
        await savedSearchesController.UpdateNameAndDescription(id, request);

        // assert
        await savedSearchAuthorizationServiceMock.Received().ValidateAccessToSearchOrThrow(id, SharedTestConsts.User);
    }

    [Fact]
    public async Task UpdateNameAndDescription_CallsNameAndDescription()
    {
        var id = 1;
        var request = new UpdateNameAndDescriptionRequest
        {
            Name = "name",
            Description = "description"
        };
        savedSearchesController.ControllerContext = new TestControllerContextBuilder().GetContext();

        // act
        await savedSearchesController.UpdateNameAndDescription(id, request);

        // assert
        await savedSearchServiceMock.Received().UpdateNameAndDescription(id, request.Name, request.Description);
    }

}
