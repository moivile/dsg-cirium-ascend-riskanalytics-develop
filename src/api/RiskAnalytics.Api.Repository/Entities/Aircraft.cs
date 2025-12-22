

namespace RiskAnalytics.Api.Repository.Entities;

public class Aircraft
{
    public int Id { get; set; }
    public int Aircraft_id { get; set; }
    public string? Keywords { get; set; }
    public DateTime Last_flight_date { get; set; }
    public int Aircraft_age_years { get; set; }
    public string? Aircraft_serial_number { get; set; }
    public string? Aircraft_registration_number { get; set; }
    public string? Operator { get; set; }
    public string? Manager { get; set; }
    public string? Aircraft_series { get; set; }
    public int Current_ground_event_start_flight_id { get; set; }
    public int Current_ground_event_duration_minutes { get; set; }
    public string? Current_ground_event_airport_name { get; set; }

}
