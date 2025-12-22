namespace RiskAnalytics.Api.Repository.Models
{
    public class AircraftSearchFilterOption
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }

        // Parameterless constructor
        public AircraftSearchFilterOption()
        {
        }

        public AircraftSearchFilterOption(int id, string name, string type)
        {
            Id = id;
            Name = name;
            Type = type;
        }
    }
}
