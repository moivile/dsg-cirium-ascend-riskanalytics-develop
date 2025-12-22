namespace RiskAnalytics.Api.Repository.Entities.DataPlatform;

public class AircraftConfiguration
{
    public string? AircraftMasterSeries { get; set; }
    public int? AircraftMasterSeriesId { get; set; }

    public string? EngineSeries { get; set; }

    public string? AircraftFamily { get; set; }

    public int? AircraftFamilyId { get; set; }

    public string? AircraftManufacturer { get; set; }
    public int? AircraftManufacturerOrganizationId { get; set; }

    public string? AircraftType { get; set; }
    public int? AircraftTypeId { get; set; }

    public string? AircraftSeries { get; set; }
    public int? AircraftSeriesId { get; set; }

    public string? AircraftMarketClass { get; set; }

    public int? AircraftMarketClassId { get; set; }
}
