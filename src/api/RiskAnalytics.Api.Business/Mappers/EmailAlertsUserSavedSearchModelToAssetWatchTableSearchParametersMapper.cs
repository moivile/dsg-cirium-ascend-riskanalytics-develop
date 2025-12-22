using Mapster;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Mappers;

public class EmailAlertsUserSavedSearchModelToAssetWatchTableSearchParametersMapper : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<EmailAlertsUserSavedSearchModel, AssetWatchTableSearchParameters>()
            .Map(destination => destination, source => Process(source));
    }

    private static AssetWatchTableSearchParameters Process(EmailAlertsUserSavedSearchModel data)
    {
        var response = new AssetWatchTableSearchParameters();
        response.Period = data.Period;
        response.MinCurrentGroundStay = data.MinCurrentGroundStay;
        response.MaxCurrentGroundStay = data.MaxCurrentGroundStay;
        response.OperatorIds = data.OperatorIds;
        response.AircraftIds = data.AircraftIds;
        response.AircraftSeriesIds = data.AircraftSeriesIds;
        response.AirportCodes = data.AirportCodes;
        response.Cities = data.Cities;
        response.CountryCodes = data.CountryCodes;
        response.DateFrom = data.DateFrom;
        response.DateTo = data.DateTo;
        response.EngineSerieIds = data.EngineSeriesIds;
        response.LessorIds = data.LessorIds;
        response.MaintenanceActivityIds = data.MaintenanceActivityIds;
        response.MinIndividualGroundStay = data.MinIndividualGroundStay;
        response.MaxIndividualGroundStay = data.MaxIndividualGroundStay;
        response.MinNoOfFlights = data.MinNoOfFlights;
        response.MinTotalGroundStay = data.MinTotalGroundStay;
        response.RegionCodes = data.RegionCodes;
        response.RouteCategory = data.RouteCategory;

        return response;
    }

}
