namespace RiskAnalytics.Api.Model;

public class AssetWatchSearchParameters
{
    public List<string>? RegionCodes { get; set; }
    public AssetWatchSearchPeriod Period { get; set; }
    public AssetWatchRouteCategory? RouteCategory { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public List<int>? OperatorIds { get; set; }
    public List<int>? LessorIds { get; set; }
    public List<int>? AircraftSeriesIds { get; set; }
    public List<int>? EngineSerieIds { get; set; }
    public List<int>? AircraftIds { get; set; }
    public List<string>? CountryCodes { get; set; }
    public List<string>? Cities { get; set; }
    public List<string>? AirportCodes { get; set; }
}
