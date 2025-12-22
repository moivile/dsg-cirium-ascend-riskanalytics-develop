using RiskAnalytics.Api.Model;
public class AssetWatchFilterResponseModel
{
    public IEnumerable<CountriesRegionsModel> Countries { get; set; } = null!;
    public IEnumerable<IdNamePairModel> Operators { get; set; } = null!;
    public IEnumerable<IdNamePairModel> EngineSeries { get; set; } = null!;
    public IEnumerable<IdNamePairModel> AircraftSeries { get; set; } = null!;
    public IEnumerable<IdNamePairModel> AircraftSerialNumbers { get; set; } = null!;
    public IEnumerable<IdNamePairModel> Lessors { get; set; } = null!;
    public IEnumerable<StringIdNamePairModel> Regions { get; set; } = null!;
}
