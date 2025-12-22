namespace RiskAnalytics.Api.Model;

public class AircraftModel
{
    // from Aircraft
    public int AircraftId { get; set; }
    public string AircraftSerialNumber { get; set; } = string.Empty;
    public double? AircraftAgeYears { get; set; }

    // from Aircraft.AircraftHistory
    public string? AircraftRegistrationNumber { get; set; }
    public string? Operator { get; set; }
    public int? OperatorOrganizationId { get; set; }
    public string? OperatorCountry { get; set; }
    public string? Manager { get; set; }
    public int? ManagerOrganizationId { get; set; }

    public int? LessorOrganizationId { get; set; }
    public string? LessorOrganization { get; set; }
    public int? CompanyTypeId { get; set; }
    public string? CompanyType { get; set; }

    // from Aircraft.AircraftHistory.AircraftConfiguration
    public string? AircraftType { get; set; }
    public int? AircraftTypeId { get; set; }
    public string? AircraftSeries { get; set; }
    public int? AircraftSeriesId { get; set; }
    public string? EngineSeries { get; set; }
    public string? AircraftFamily { get; set; }
    public int? AircraftFamilyId { get; set; }
    public int? AircraftMarketClassId { get; set; }
    public string? AircraftMarketClass { get; set; }
    public string? AircraftMasterSeries { get; set; }
    public int? AircraftMasterSeriesId { get; set; }

    public string? Status { get; set; }
    public int? StatusId { get; set; }

    public int? OwnerOrganizationId { get; set; }
    public string? Owner { get; set; }
    public int? AircraftManufacturerOrganizationId { get; set; }
    public string? AircraftManufacturer { get; set; }

    public string? AircraftUsage { get; set; }
    public DateTime? StatusStartDate { get; set; }
    public int Hours { get; set; }
    public int Cycles { get; set; }
}
