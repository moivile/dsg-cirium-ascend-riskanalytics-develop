
namespace RiskAnalytics.Api.Model;

public class AircraftSearchModel
{
    public IEnumerable<AircraftModel>? AircraftList {get;set;}
    public IEnumerable<IdNamePairModel>? Manufacturers { get;set;}
    public IEnumerable<IdNamePairModel>? AircraftTypes { get; set; }
    public IEnumerable<IdNamePairModel>? AircraftMasterSeries { get; set; }
    public IEnumerable<IdNamePairModel>? AircraftOperators { get; set; }
    public IEnumerable<IdNamePairModel>? OperatorCountries { get; set; }
    public IEnumerable<IdNamePairModel>? Lessors { get; set; }
    public IEnumerable<IdNamePairModel>? Statuses { get; set; }
    public IEnumerable<IdNamePairModel>? CompanyTypes { get; set; }

    public int Skip { get; set; }
    public int Take { get; set; }
    public int TotalCount { get; set; }
}
