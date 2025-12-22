using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Repository.Entities;

public class SavedSearch
{
    public int Id { get; set; }
    public int PortfolioId { get; set; }
    public string PortfolioName {get; set;}
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string UserId { get; set; } = null!;
    public DateTime DateCreated { get; set; }
    public DateTime DateModified { get; set; }
    public int[]? MaintenanceActivityIds { get; set; }
    public int MinNoOfFlights { get; set; }
    public int MinTotalGroundStay { get; set; }
    public int MinIndividualGroundStay { get; set; }
    public int MaxIndividualGroundStay { get; set; }
    public int MinCurrentGroundStay { get; set; }
    public int MaxCurrentGroundStay { get; set; }
    public bool ShowAircraftOnGround { get; set; }
    public string? Frequency { get; set; }
    public string[]? RegionCodes { get; set; }
    public AssetWatchSearchPeriod Period { get; set; }
    public AssetWatchRouteCategory? RouteCategory { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int[]? OperatorIds { get; set; }
    public int[]? LessorIds { get; set; }
    public int[]? AircraftSeriesIds { get; set; }
    public int[]? EngineSeriesIds { get; set; }
    public int[]? AircraftIds { get; set; }
    public string[]? CountryCodes { get; set; }
    public string[]? Cities { get; set; }
    public string[]? AirportCodes { get; set; }
    public AssetWatchFilterValues? FilterValues { get; set; } = new();

}
