namespace RiskAnalytics.Api.Responses;
public class PortfolioResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public DateTime DateCreated { get; set; }

    public DateTime DateModified { get; set; }
    public int NumberOfAircraft { get; set; }
}
