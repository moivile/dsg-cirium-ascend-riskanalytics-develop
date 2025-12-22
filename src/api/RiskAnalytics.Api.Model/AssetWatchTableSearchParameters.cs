
namespace RiskAnalytics.Api.Model;

public class AssetWatchTableSearchParameters : AssetWatchSearchParameters
{
        public string? SortColumn { get; set; }
        public string? SortOrder { get; set; }
        public List<int>? MaintenanceActivityIds { get; set; }
        public int MinNoOfFlights { get; set; }
        public int MinTotalGroundStay { get; set; }
        public int MinIndividualGroundStay { get; set; }
        public int MinCurrentGroundStay { get; set; }
        public int MaxCurrentGroundStay { get; set; }
        public int MaxIndividualGroundStay { get; set; }
        public bool ShowAircraftOnGround { get; set; }
        public int Skip { get; set; } = 0;
        public int Take { get; set; } = 50;
}
