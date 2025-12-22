namespace RiskAnalytics.Api.Model;

public class UserSavedSearchModel
{
    public string UserId { get; set; }
    public string Frequency { get; set; }
    public List<EmailAlertsUserSavedSearchModel> UsersSavedSearches { get; set; } = new List<EmailAlertsUserSavedSearchModel>();

}