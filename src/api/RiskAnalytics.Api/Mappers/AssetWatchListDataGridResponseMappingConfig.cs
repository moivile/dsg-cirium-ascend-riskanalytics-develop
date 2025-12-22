using Mapster;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Responses;

namespace RiskAnalytics.Api.Mappers;

public class AssetWatchListDataGridResponseMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AssetWatchListGridDataResponseModel, AssetWatchListDataGridResponse>()
            .Map(destination => destination.AssetWatchListDataGrid, source => Process(source.AssetWatchListDataGrid));
    }

    private IEnumerable<AssetWatchListRow> Process(IEnumerable<AssetWatchListDataGridModel>? data)
    {
        if (data == null)
        {
            return new List<AssetWatchListRow>();
        }

        var response = new List<AssetWatchListRow>();

        foreach (var row in data)
        {
            response.Add(new AssetWatchListRow
            {
                AircraftId = row.AircraftId,
                AircraftSerialNumber = row.AircraftSerialNumber,
                AircraftRegistrationNumber = row.AircraftRegistrationNumber,
                AircraftSeries = row.AircraftSeries,
                AircraftStatus = row.AircraftStatus,
                OperatorName = row.OperatorName,
                ManagerName = row.ManagerName,
                MaintenanceActivity = row.MaintenanceActivity,
                NumberOfFlights = row.NumberOfFlights,
                TotalFlightHours = DoubleExtensions.ConvertMinutesIntoHoursAndRoundOff(row.TotalFlightMinutes),
                TotalGroundStayHours = row.TotalGroundStayHours,
                TimesBetweenMinMaxIndGroundStay = row.TimesBetweenMinMaxIndGroundStay,
                LastFlightDate = row.LastFlightDate,
                CurrentGroundEventAirportName = row.CurrentGroundEventAirportName,
                CurrentGroundEventDurationHours = DoubleExtensions.ConvertMinutesIntoHoursAndRoundOff(row.CurrentGroundEventDurationMinutes)
            });
        }

        return response;
    }
}
