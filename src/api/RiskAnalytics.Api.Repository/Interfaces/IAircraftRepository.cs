using RiskAnalytics.Api.Repository.Entities;

namespace RiskAnalytics.Api.Repository.Interfaces;

public interface IAircraftRepository
{
    Task<Aircraft?> Get(int id);
}
