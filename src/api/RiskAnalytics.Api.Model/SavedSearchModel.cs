namespace RiskAnalytics.Api.Model;

public class SavedSearchModel: AssetWatchTableSearchParameters
{
    public int Id { get; set; }
    public int PortfolioId { get; set; }
    public string PortfolioName { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string UserId { get; set; } = null!;
    public DateTime DateCreated { get; set; }
    public DateTime DateModified { get; set; }
}
