using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;

namespace RiskAnalytics.Api.Business.Validators;

public class SavedSearchConfigurationValidator : ISavedSearchConfigurationValidator
{
    public void IsValidOrThrow(string? frequency)
    {

        if (frequency?.ToLowerInvariant() != "daily" && frequency?.ToLowerInvariant() != "alertsonly")
        {
            throw new EntityValidationException(ValidationMessages.SavedSearchFrequencyContainInvalidValue);
        }

    }
}
