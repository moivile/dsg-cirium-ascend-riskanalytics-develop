using RiskAnalytics.Authorization.CaeAdmin.Responses;

namespace RiskAnalytics.Authorization.CaeAdmin
{
    public interface ICaeAdminClient
    {
        Task<IEnumerable<Entitlement>> GetEntitlements(string auth0Id);
        Task<string?> GetUserEmailAddress(string auth0Id);
    }
}
