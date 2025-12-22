namespace RiskAnalytics.Api.Responses;
public class AssetWatchListRow
{
    public int AircraftId { get; set; }
    public string? AircraftSerialNumber { get; set; }
    public string? AircraftRegistrationNumber { get; set; }
    public string? ManagerName { get; set; }
    public string? OperatorName { get; set; }
    public string? AircraftSeries { get; set; }
    public string? AircraftStatus { get; set; }
    public string? MaintenanceActivity { get; set; }
    public int? NumberOfFlights { get; set; }
    public double? TotalFlightHours { get; set; }

    public double? TotalGroundStayHours { get; set; }
    public int? TimesBetweenMinMaxIndGroundStay { get; set; }

    public DateTime? LastFlightDate { get; set; }
    public string? CurrentGroundEventAirportName { get; set; }
    public double? CurrentGroundEventDurationHours { get; set; }
}
