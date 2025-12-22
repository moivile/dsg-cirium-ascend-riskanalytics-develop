namespace RiskAnalytics.Api.Model;

public class SearchAircraftParameters
{
    public string? Keyword { get; set; }
    public List<int>? ManufacturerIds { get; set; }
    public List<int>? AircraftTypeIds { get; set; }
    public List<int>? AircraftMasterSeriesIds { get; set; }
    public List<int>? AircraftOperatorIds { get; set; }
    public List<int>? OperatorCountryIds { get; set; }
    public List<int>? StatusIds { get; set; }
    public List<int>? LessorIds { get; set; }
    public List<int>? CompanyTypeIds { get; set; }
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 200;
}
