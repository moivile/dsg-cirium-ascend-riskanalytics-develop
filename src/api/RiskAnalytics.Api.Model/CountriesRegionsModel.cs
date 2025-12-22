
namespace RiskAnalytics.Api.Model;

public class CountriesRegionsModel : StringIdNamePairModel
{
    public string RegionCode { get; set; }

    public CountriesRegionsModel() { }

    public CountriesRegionsModel(string id, string name, string regionCode)
    {
        Id = id;
        Name = name;
        RegionCode = regionCode;
    }
}
