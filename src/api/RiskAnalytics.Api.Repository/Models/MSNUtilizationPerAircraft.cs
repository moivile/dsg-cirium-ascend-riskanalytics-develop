namespace RiskAnalytics.Api.Repository.Models;
public class MSNUtilizationPerAircraft
{
    public string? Registration { get; set; }
    public string? Series { get; set; }
    public string? SerialNumber { get; set; }
    public int AircraftId { get; set; }
    public string[]? YearMonth { get; set; }
    public decimal[]? TotalHours { get; set; }
    public int[]? TotalCycles { get; set; }
    public decimal[]? AverageHoursPerCycle { get; set; }
    public int[]? CO2EmissionPerKg { get; set; }
    public int[]? AverageCo2KgPerSeat { get; set; }
    public decimal[]? AverageCo2GPerAsk { get; set; }
    public decimal[]? AverageCo2GPerAsm { get; set; }
}

