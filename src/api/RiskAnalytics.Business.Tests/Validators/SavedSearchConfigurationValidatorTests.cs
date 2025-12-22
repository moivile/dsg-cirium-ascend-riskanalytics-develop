using RiskAnalytics.Api.Business.Validators;
using Xunit;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Business.Validators.Interfaces;

namespace RiskAnalytics.Business.Tests.Validators;

public class SavedSearchConfigurationValidatorTests
{
    private readonly ISavedSearchConfigurationValidator savedSearchConfigurationValidator;

    public SavedSearchConfigurationValidatorTests()
    {
        savedSearchConfigurationValidator = new SavedSearchConfigurationValidator();
    }

    [Theory]
    [InlineData("daily")]
    [InlineData("alertsonly")]
    public void IsValidOrThrow_ValidValues_DoesNotThrowException(string value)
    {
        // Arrange
        // Act
        var exception = Record.Exception(() => savedSearchConfigurationValidator.IsValidOrThrow(value));

        // Assert
        Assert.Null(exception);
    }

    [Theory]
    [InlineData("")]
    [InlineData("alerts")]
    public void IsValidOrThrow_InvalidValues_ThrowsEntityValidationException(string value)
    {
        // Arrange
        // Act && Assert
         Assert.Throws<EntityValidationException>(() => savedSearchConfigurationValidator.IsValidOrThrow(value));
    }

}
