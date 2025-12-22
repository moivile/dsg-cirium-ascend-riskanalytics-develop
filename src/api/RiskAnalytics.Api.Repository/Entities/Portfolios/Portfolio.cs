namespace RiskAnalytics.Api.Repository.Entities.Portfolios;
public class Portfolio
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public DateTime DateCreated { get; set; }

    public DateTime DateModified { get; set; }

    public List<PortfolioAircraft> Aircraft { get; set; } = new();

    public int NumberOfAircraft { get; set; }
}
