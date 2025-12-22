namespace RiskAnalytics.Api.Model;
public class AssetWatchListDataGridModel
{
    public int AircraftId { get; set; }
    public string AircraftSerialNumber { get; set; }
    public string? AircraftRegistrationNumber { get; set; }
    public string? AircraftSeries { get; set; }
    public string? AircraftStatus { get; set; }
    public string? OperatorName { get; set; }
    public string? MaintenanceActivity { get; set; }
    public string? ManagerName { get; set; }
    public int? NumberOfFlights { get; set; }
    public double? TotalFlightMinutes { get; set; }
    public double? TotalGroundStayHours { get; set; }
    public int? TimesBetweenMinMaxIndGroundStay { get; set; }

    public DateTime? LastFlightDate { get; set; }
    public string? CurrentGroundEventAirportName { get; set; }
    public double? CurrentGroundEventDurationMinutes { get; set; }

    public string? Region { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? RouteCategory { get; set; }
    public string? EngineSeriesName { get; set; }
}
