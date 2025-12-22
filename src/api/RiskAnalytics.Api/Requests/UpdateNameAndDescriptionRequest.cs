namespace RiskAnalytics.Api.Requests
{
    public class UpdateNameAndDescriptionRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
