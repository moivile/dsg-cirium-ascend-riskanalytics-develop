using Newtonsoft.Json;

namespace RiskAnalytics.Authorization.CaeAdmin.Requests
{
    public class CaeRequester
    {
        public CaeRequester(CaeRequesterApplication application, CaeRequesterUser user)
        {
            Application = application;
            User = user;
        }

        [JsonProperty(PropertyName = "application")]
        public CaeRequesterApplication Application { get; set; }

        [JsonProperty(PropertyName = "user")]
        public CaeRequesterUser User { get; set; }
    }
}
