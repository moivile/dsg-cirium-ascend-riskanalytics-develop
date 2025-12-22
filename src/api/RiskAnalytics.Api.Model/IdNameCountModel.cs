
namespace RiskAnalytics.Api.Model;

public class IdNameCountModel 
{
    public string? id { get; set; }
    public string? name { get; set; }
    public int Count { get; set; }

    public IdNameCountModel()
    {
    }

    public IdNameCountModel(string id, string name, int count)
    {
        Count = count;
        this.id = id;
        this.name = name;
    }
}
