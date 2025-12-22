namespace RiskAnalytics.Api.Model;
public class FlightsDetails 
{
    public IEnumerable<FlightDetailsModel>? FlightDetails { get; set; }
    public int TotalResultCount { get; set; }
}
