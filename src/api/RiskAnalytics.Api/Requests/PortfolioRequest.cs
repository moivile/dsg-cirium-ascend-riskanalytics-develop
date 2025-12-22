using System.ComponentModel.DataAnnotations;

namespace RiskAnalytics.Api.Requests;

public class PortfolioRequest
{
    [Required]
    public string Name { get; set; } = null!;
    public List<int> AircraftIds { get; set; } = new();
}
