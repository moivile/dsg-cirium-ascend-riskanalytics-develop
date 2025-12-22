namespace RiskAnalytics.Authorization.CaeAdmin.Responses
{
    public class EntitlementsResponse
    {
        public IEnumerable<Entitlement> Entitlements { get; set; } = new List<Entitlement>();
    }
}
