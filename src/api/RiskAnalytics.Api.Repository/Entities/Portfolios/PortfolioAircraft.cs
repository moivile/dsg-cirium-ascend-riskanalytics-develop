namespace RiskAnalytics.Api.Repository.Entities.Portfolios;

public class PortfolioAircraft
{
    public int Id { get; set; }

    public int PortfolioId { get; set; }

    public DataPlatform.Aircraft Aircraft { get; set; } = null!;
}
