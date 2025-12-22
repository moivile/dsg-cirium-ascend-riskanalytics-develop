namespace RiskAnalytics.Api.Model;
public class FlightDetailsResponse 
{
    public IEnumerable<FlightDetails>? FlightDetails { get; set; }
    public int TotalResultCount { get; set; }
}
