using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.Dataplatform.Interfaces
{
    public interface IAircraftRepository
    {
        Task<IEnumerable<Aircraft>> Search(SearchAircraftParameters searchAircraftRequest);
        Task<IEnumerable<AircraftSearchFilterOption>> GetSearchFilterOptions(SearchAircraftParameters searchParams);
    }
}
