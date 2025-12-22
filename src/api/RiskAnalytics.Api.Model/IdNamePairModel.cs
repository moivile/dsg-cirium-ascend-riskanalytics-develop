
namespace RiskAnalytics.Api.Model;

public class IdNamePairModel
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public IdNamePairModel() { }

    public IdNamePairModel(int id, string name)
    {
        Id = id;
        Name = name;
    }
}
