namespace RiskAnalytics.Api.Model;

public class UtilizationGroupOptionsModel
{
    public IEnumerable<IdNamePairModel> AircraftMarketClasses { get; set; } = new List<IdNamePairModel>();
    public IEnumerable<IdNamePairModel> AircraftFamilies { get; set; } = new List<IdNamePairModel>();
    public IEnumerable<IdNamePairModel> AircraftTypes { get; set; } = new List<IdNamePairModel>();
    public IEnumerable<IdNamePairModel> AircraftSeries { get; set; } = new List<IdNamePairModel>();
    public IEnumerable<IdNamePairModel> AircraftSerialNumbers { get; set; } = new List<IdNamePairModel>();
}
