using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Repository.Interfaces
{
    public interface IAssetWatchFlightDetailsRepository
    {
        Task<int> AircraftFlightsCount(int aircraftId, AssetWatchTableSearchParameters filterCriteria);
        Task<IEnumerable<FlightDetailsModel>> ListAircraftFlightDetails(int aircraftId, AssetWatchTableSearchParameters filterCriteria);
    }
}
