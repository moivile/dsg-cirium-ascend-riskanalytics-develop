using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Requests;

public class SavedSearchRequest : AssetWatchTableSearchParameters
{
    public int PortfolioId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
