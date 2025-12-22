namespace RiskAnalytics.Api.Model;

public class StringIdNamePairModel
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;

    public StringIdNamePairModel() { }

    public StringIdNamePairModel(string id, string name)
    {
        Id = id;
        Name = name;
    }
}
