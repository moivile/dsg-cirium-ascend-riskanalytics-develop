using Newtonsoft.Json;

namespace RiskAnalytics.Authorization.CaeAdmin.Requests
{
    public class CaeRequesterApplication
    {
        public CaeRequesterApplication(string name)
        {
            Name = name;
        }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }
    }
}
