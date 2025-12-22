namespace RiskAnalytics.Api.Model;

public class NameStringListPairModel
{
    public string Name { get; set; }
    public List<string> Values { get; set; }

    public NameStringListPairModel()
    {
        Values = new List<string>();
    }

    public NameStringListPairModel(string name, List<string> values)
    {
        Name = name;
        Values = values;
    }

    public NameStringListPairModel(string name, List<int> values)
    {
        Name = name;
        Values = values.ConvertAll(s => s.ToString()).ToList();
    }

    public NameStringListPairModel(string name, string value)
    {
        Name = name;
        Values = new List<string> { value };
    }
}
