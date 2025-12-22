using RiskAnalytics.Api.Business.Validators;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;
using System.Net;
using Xunit;

namespace RiskAnalytics.Business.Tests.Validators;

public class SavedSearchRunReportValidatorTests
{
    private readonly ISavedSearchRunReportValidator validator;

    public SavedSearchRunReportValidatorTests()
    {
        validator = new SavedSearchRunReportValidator();
    }

    [Fact]
    public async Task IsValidOrThrow_SavedSearchIdIsZero_EntityValidationException()
    {
        // arrange

        var report = new SavedSearchRunReportModel
        {
            SavedSearchId = 0
        };

        // act & assert
        var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await validator.IsValidOrThrow(report));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
        Assert.Equal(ValidationMessages.SearchRunReportSavedSearchIdCannotBeNull, exception.Message);
    }

    [Fact]
    public async Task IsValidOrThrow_AircraftIdIsZero_EntityValidationException()
    {
        // arrange

        var report = new SavedSearchRunReportModel
        {
            SavedSearchId = 1,
            AircraftId = 0
        };

        // act & assert
        var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await validator.IsValidOrThrow(report));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
        Assert.Equal(ValidationMessages.SearchRunReportAircraftIdCannotBeNull, exception.Message);
    }

    [Fact]
    public async Task IsValidOrThrow_CriteriaNameIsNull_EntityValidationException()
    {
        // arrange

        var report = new SavedSearchRunReportModel
        {
            SavedSearchId = 1,
            AircraftId = 1
        };

        // act & assert
        var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await validator.IsValidOrThrow(report));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
        Assert.Equal(ValidationMessages.SearchRunReportCriteriaNameCannotBeNull, exception.Message);
    }

    [Fact]
    public async Task IsValidOrThrow_CriteriaValueIsNull_EntityValidationException()
    {
        // arrange

        var report = new SavedSearchRunReportModel
        {
            SavedSearchId = 1,
            AircraftId = 1,
            CriteriaName = "name"
        };

        // act & assert
        var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await validator.IsValidOrThrow(report));
        Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
        Assert.Equal(ValidationMessages.SearchRunReportCriteriaValueCannotBeNull, exception.Message);
    }

    [Fact]
    public async Task IsValidOrThrow_EverythingPopulatedAsRequired_DoesNotThrowException()
    {
        // arrange

        var report = new SavedSearchRunReportModel
        {
            SavedSearchId = 1,
            AircraftId = 1,
            CriteriaName = "name",
            CriteriaValue = "444"
        };

        // act & assert
        var exception = await Record.ExceptionAsync(() => validator.IsValidOrThrow(report));
        Assert.Null(exception);
    }
}
