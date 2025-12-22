namespace RiskAnalytics.Api.Responses;

public class GeneralConfigurationResponse
{
    public string NoAccessUrl { get; set; } = null!;
    public string MyCiriumApiUrl { get; set; } = null!;
    public string MarketingUrl { get; set; } = null!;
    public string FullStoryOrganisationId { get; set; } = null!;
	public string SupportEmailAddress { get; set; } = null!;
}
