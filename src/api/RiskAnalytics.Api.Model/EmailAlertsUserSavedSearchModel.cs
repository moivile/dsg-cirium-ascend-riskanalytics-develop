namespace RiskAnalytics.Api.Model;

public class EmailAlertsUserSavedSearchModel
{
    public int Id { get; set; }
    public int PortfolioId { get; set; }
    public string PortfolioName {get; set;}
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string UserId { get; set; } = null!;
    public List<int>? MaintenanceActivityIds { get; set; }
    public int MinNoOfFlights { get; set; }
    public int MinTotalGroundStay { get; set; }
    public int MinIndividualGroundStay { get; set; }
    public int MinCurrentGroundStay { get; set; }
    public int MaxCurrentGroundStay { get; set; }
    public int MaxIndividualGroundStay { get; set; }
    public bool ShowAircraftOnGround { get; set; }
    public List<string>? RegionCodes { get; set; }
    public AssetWatchSearchPeriod Period { get; set; }
    public AssetWatchRouteCategory? RouteCategory { get; set; }
    public string? Frequency { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public List<int>? OperatorIds { get; set; }
    public List<int>? LessorIds { get; set; }
    public List<int>? AircraftSeriesIds { get; set; }
    public List<int>? EngineSeriesIds { get; set; }
    public List<int>? AircraftIds { get; set; }
    public List<string>? CountryCodes { get; set; }
    public List<string>? Cities { get; set; }
    public List<string>? AirportCodes { get; set; }
    public AssetWatchFilterValues? FilterValues { get; set; }
}
