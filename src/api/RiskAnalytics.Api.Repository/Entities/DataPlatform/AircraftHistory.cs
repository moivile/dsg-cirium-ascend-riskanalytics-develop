namespace RiskAnalytics.Api.Repository.Entities.DataPlatform;

public class AircraftHistory
{
    public int AircraftHistoryId { get; set; }

    public int AircraftId { get; set; }

    public string? AircraftRegistrationNumber { get; set; }

    public string? Operator { get; set; }
    public int? OperatorOrganizationId { get; set; }

    public string? OperatorCountry { get; set; }
    public int? OperatorCountryId { get; set; }

    public string? Manager { get; set; }
    public int? ManagerOrganizationId { get; set; }

    public int? LessorOrganizationId { get; set; }

    public string? LessorOrganization { get; set; }

    public AircraftConfiguration? AircraftConfiguration { get; set; }

    public AircraftStatusHistory? AircraftStatusHistory { get; set; }

    public bool IsCurrent { get; set; }

    public int? OwnerOrganizationId { get; set; }
    public string? Owner { get; set; }

    public int? CompanyTypeId { get; set; }
    public string? CompanyType { get; set; }
}
