using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.AssetWatch;

public interface IAssetWatchFlightDetailsService
{
    Task<FlightsDetails> GetFlightDetails(int aircraftId, AssetWatchTableSearchParameters filterCriteria);
    Task<IEnumerable<FlightDetailsModel>> ReplaceLastFlightOnGroundHours(int aircraftId, IEnumerable<FlightDetailsModel> flights);
}
