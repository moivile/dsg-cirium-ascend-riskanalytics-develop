using RiskAnalytics.Api.Repository.Entities;

namespace RiskAnalytics.Api.Business.Services.Interfaces
{
    public interface ISavedSearchAuthorizationService
    {
        Task ValidateAccessToSearchOrThrow(int searchId, string userId);
        void ValidateAccessToSearchOrThrow(SavedSearch? search, string userId);
        void ValidateAccessToAlertingEndpointOrThrow(string userId, string riskAnalyticsMachineToMachineAuth0ClientId);
    }
}
