using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface IAircraftService
{
    Task<AircraftSearchModel> Search(SearchAircraftParameters searchAircraftRequest);
}
