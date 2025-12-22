namespace RiskAnalytics.Api.Repository.Models;

public class MonthlyUtilization
{
    public string? Group { get; set; } = null!;
    public string? AircraftType { get; set; }
    public int? GroupId { get; set; }
    public int NumberOfAircraftInGroup { get; set; }

    public int Year { get; set; }

    public int Month { get; set; }

    public double TotalHours { get; set; }
    public double AverageHours { get; set; }
    public int NumberOfAircraftWithHours { get; set; }

    public double TotalCycles { get; set; }
    public double AverageCycles { get; set; }
    public int NumberOfAircraftWithCycles { get; set; }

    public double AverageHoursPerCycle { get; set; }
    public int NumberOfAircraftWithHoursPerCycle { get; set; }

    public double TotalCo2KgPerSeat { get; set; }
    public double AverageCo2KgPerSeat { get; set; }
    public int NumberOfAircraftWithCo2KgPerSeat { get; set; }

    public double TotalCo2GPerAsk { get; set; }
    public double AverageCo2GPerAsk { get; set; }
    public int NumberOfAircraftWithCo2GPerAsk { get; set; }

    public double TotalCo2GPerAsm { get; set; }
    public double AverageCo2GPerAsm { get; set; }
    public int NumberOfAircraftWithCo2GPerAsm { get; set; }
}
