namespace RiskAnalytics.Api.Model;

public class AssetWatchFilterValues
{
    public IEnumerable<string>? Regions { get; set; }
    public IEnumerable<string>? Countries { get; set; }
    public IEnumerable<string>? Cities { get; set; }
    public IEnumerable<string>? Airports { get; set; }
    public IEnumerable<string>? Operators { get; set; }
    public IEnumerable<string>? Lessors { get; set; }
    public IEnumerable<string>? AircraftSeries { get; set; }
    public IEnumerable<string>? EngineSeries { get; set; }
    public IEnumerable<string>? SerialNumbers { get; set; }
    public IEnumerable<string>? MaintenanceActivities { get; set; }
}
