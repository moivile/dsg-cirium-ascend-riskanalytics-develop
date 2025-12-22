namespace RiskAnalytics.Api.Repository.Models;

public class UtilizationGroupOption
{
    public UtilizationGroupOption(int id, string name, string type)
    {
        Id = id;
        Name = name;
        Type = type;
    }
    public UtilizationGroupOption(){
        
    }

    public int Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
}
