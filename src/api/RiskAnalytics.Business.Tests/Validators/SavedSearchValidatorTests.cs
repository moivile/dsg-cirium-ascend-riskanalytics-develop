using NSubstitute;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using System.Net;
using Xunit;
using RiskAnalytics.Api.Repository.AssetWatchSavedSearches;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Business.Tests.Validators;

public class SavedSearchValidatorTests
{
    private readonly ISavedSearchesRepository savedSearchesRepositoryMock;
    private readonly ISavedSearchValidator savedSearchValidator;

    public SavedSearchValidatorTests()
    {
        savedSearchesRepositoryMock = Substitute.For<ISavedSearchesRepository>();
        savedSearchValidator = new SavedSearchValidator(savedSearchesRepositoryMock);
    }

    [Fact]
    public async Task IsValidOrThrow_NameNotUnique_EntityValidationException()
    {
        // arrange
        savedSearchesRepositoryMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
            .Returns(false);

        var search = new SavedSearchModel();

        // act & assert
        var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await savedSearchValidator.IsValidOrThrow(search));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
        Assert.Equal(ValidationMessages.SearchNameIsNotUnique, exception.Message);
    }

    [Fact]
    public async Task IsValidOrThrow_NameUniqueOneAircraft_ThrowsNoException()
    {
        // arrange
        savedSearchesRepositoryMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
            .Returns(true);

        var portfolio = new SavedSearchModel
        {
            Name = "TestPortfolio"
        };

        // act & assert
        var exception = await Record.ExceptionAsync(async () => await savedSearchValidator.IsValidOrThrow(portfolio));
        Assert.Null(exception);
    }

    [Fact]
    public async Task IsValidOrThrow_NameGreaterThen100_EntityValidationException()
    {
        // arrange
        savedSearchesRepositoryMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
            .Returns(true);

        var search = new SavedSearchModel
        {
            Name = "blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah"
        };

        // act & assert
        var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await savedSearchValidator.IsValidOrThrow(search));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
        Assert.Equal(ValidationMessages.SearchNameIsGreaterThen100, exception.Message);
    }

    [Fact]
    public async Task IsValidOrThrow_NameContainsHtmlTag_EntityValidationException()
    {
        // arrange
        savedSearchesRepositoryMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
            .Returns(true);

        var search = new SavedSearchModel
        {
            Name = "A <a href>Name</a>"
        };

        // act & assert
        var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await savedSearchValidator.IsValidOrThrow(search));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
        Assert.Equal(ValidationMessages.SearchNameContainsHtmlTags, exception.Message);
    }
}
