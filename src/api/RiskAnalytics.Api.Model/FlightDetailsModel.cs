namespace RiskAnalytics.Api.Model;
public class FlightDetailsModel
{
    public DateTime? ArrivalDate { get; set; }
    public string? LastOriginAirport { get; set; }
    public string? SelectedAirport { get; set; }
    public string? SelectedCountry { get; set; }
    public string? RouteCategory { get; set; }
    public string? OperationType { get; set; }
    public double? GroundEventTime { get; set; }
    public string? MaintenanceActivity { get; set; }
    public DateTime DepartureDate { get; set; }
    public string? NextDestinationAirport { get; set; }
    public double? FlightMinutes { get; set; }
}
