using Mapster;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Mappers;

    public class SavedSearchEntityToEmailAlertsUserSavedSearchModelMapper : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Repository.Entities.SavedSearch, EmailAlertsUserSavedSearchModel>()
                .Map(destination => destination, source => Process(source));
        }

        private static EmailAlertsUserSavedSearchModel Process(Repository.Entities.SavedSearch data)
        {
            var response = new EmailAlertsUserSavedSearchModel();
            response.Id = data.Id;
            response.PortfolioId = data.PortfolioId;
            response.PortfolioName = data.PortfolioName;
            response.Name = data.Name;
            response.Description = data.Description;
            response.DateFrom = data.DateFrom;
            response.DateTo = data.DateTo;
            response.MaintenanceActivityIds = data.MaintenanceActivityIds.ToList();
            response.MinNoOfFlights = data.MinNoOfFlights;
            response.MinTotalGroundStay = data.MinTotalGroundStay;
            response.MinIndividualGroundStay = data.MinIndividualGroundStay;
            response.MaxIndividualGroundStay = data.MaxIndividualGroundStay;
            response.MinCurrentGroundStay = data.MinCurrentGroundStay;
            response.MaxCurrentGroundStay = data.MaxCurrentGroundStay;
            response.ShowAircraftOnGround = data.ShowAircraftOnGround;
            response.RegionCodes = data.RegionCodes.ToList();
            response.OperatorIds = data.OperatorIds.ToList();
            response.LessorIds = data.LessorIds.ToList();
            response.AircraftSeriesIds = data.AircraftSeriesIds.ToList();
            response.EngineSeriesIds = data.EngineSeriesIds.ToList();
            response.AircraftIds = data.AircraftIds.ToList();
            response.CountryCodes = data.CountryCodes.ToList();
            response.Cities = data.Cities.ToList();
            response.AirportCodes = data.AirportCodes.ToList();
            response.Period = data.Period;
            response.FilterValues = data.FilterValues;

            return response;
        }

    }
