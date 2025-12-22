namespace RiskAnalytics.Authorization.CaeAdmin.Responses
{
    public class Entitlement
    {
        public IEnumerable<ProductItem> ProductItems { get; set; } = new List<ProductItem>();
    }
}
