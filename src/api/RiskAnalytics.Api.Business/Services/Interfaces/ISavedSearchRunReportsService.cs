using RiskAnalytics.Api.Repository.Entities;

namespace RiskAnalytics.Api.Business.Services.Interfaces;

public interface ISavedSearchRunReportsService
{
    Task<IEnumerable<SavedSearchRunReport>> GetTheLatestRunResults();
    Task Save(IEnumerable<SavedSearchRunReport> report);
}
