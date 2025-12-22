namespace RiskAnalytics.Api.Business.Validators.Interfaces
{
    public interface ISavedSearchConfigurationValidator
    {
        void IsValidOrThrow(string? frequency);
    }
}
