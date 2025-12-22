using RiskAnalytics.Api.Model;

public class AssetWatchFilterOptions
{
    public StringIdNamePairModel[] Regions { get; set; } = null!;
    public CountriesRegionsModel[] Countries { get; set; } = null!;
    public IdNamePairModel[] Operators { get; set; } = null!;
    public IdNamePairModel[] Lessors { get; set; } = null!;
    public IdNamePairModel[] AircraftSeries { get; set; } = null!;
    public IdNamePairModel[] EngineSeries { get; set; } = null!;
    public IdNamePairModel[] AircraftSerialNumbers { get; set; } = null!;
}
