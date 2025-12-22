namespace RiskAnalytics.Api.Model;

public class SavedSearchRunReportModel
{
    public int Id { get; set; }
    public int SavedSearchId { get; set; }
    public Guid RunId { get; set; }
    public int AircraftId { get; set; }
    public string MSN { get; set; }
    public string CriteriaName { get; set; }
    public string CriteriaValue { get; set; }
    public DateTime DateCreated { get; set; }
}
