using RiskAnalytics.Api.Repository.Entities;

namespace RiskAnalytics.Api.Repository;

public interface ISavedSearchRunReportsRepository
{
    Task<IEnumerable<SavedSearchRunReport>> GetTheLatestRunResults();
    Task Save(SavedSearchRunReport report);
}
