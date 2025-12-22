using Mapster;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Mappers;

public class FlightDetailsResponseMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<FlightsDetails, FlightDetailsResponse>()
            .Map(destination => destination.FlightDetails, source => Process(source.FlightDetails));
    }

    private IEnumerable<FlightDetails> Process(IEnumerable<FlightDetailsModel>? data)
    {
        if (data == null)
        {
            return new List<FlightDetails>();
        }

        var response = new List<FlightDetails>();

        foreach (var row in data)
        {
            response.Add(new FlightDetails
            {
                ArrivalDate = row.ArrivalDate,
                LastOriginAirport = row.LastOriginAirport,
                SelectedAirport = row.SelectedAirport,
                SelectedCountry = row.SelectedCountry,
                RouteCategory = row.RouteCategory,
                OperationType = row.OperationType,
                GroundEventTime = DoubleExtensions.ConvertMinutesIntoHoursAndRoundOff(row.GroundEventTime),
                MaintenanceActivity = row.MaintenanceActivity,
                DepartureDate = row.DepartureDate,
                NextDestinationAirport = row.NextDestinationAirport,
                FlightHours = DoubleExtensions.ConvertMinutesIntoHoursAndRoundOff(row.FlightMinutes)
            });
        }

        return response;
    }
}
