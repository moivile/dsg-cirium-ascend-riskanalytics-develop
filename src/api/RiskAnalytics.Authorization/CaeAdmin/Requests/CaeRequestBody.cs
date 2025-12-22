using Newtonsoft.Json;

namespace RiskAnalytics.Authorization.CaeAdmin.Requests
{
    public class CaeRequestBody
    {
        public CaeRequestBody(CaeRequester requester, object payload)
        {
            Requester = requester;
            Payload = payload;
        }

        [JsonProperty(PropertyName = "requester")]
        public CaeRequester Requester { get; set; }

        [JsonProperty(PropertyName = "payload")]
        public object Payload { get; set; }
    }
}
