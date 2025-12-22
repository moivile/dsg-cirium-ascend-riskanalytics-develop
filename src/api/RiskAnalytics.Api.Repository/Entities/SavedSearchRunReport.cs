namespace RiskAnalytics.Api.Repository.Entities;

public class SavedSearchRunReport
{
    public int Id { get; set; }
    public int SavedSearchId {  get; set; }
    public string RunId { get; set; }
    public int AircraftId {  get; set; }
    public string MSN { get; set; }
    public string CriteriaName { get; set; }
    public string CriteriaValue {  get; set; }
    public DateTime DateCreated { get; set; }

}
