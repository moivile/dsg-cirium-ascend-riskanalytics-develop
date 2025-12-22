using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository;
using RiskAnalytics.Api.Repository.Entities;

namespace RiskAnalytics.Api.Business.Services;

public class SavedSearchRunReportsService : ISavedSearchRunReportsService
{
    private readonly ISavedSearchRunReportsRepository savedSearchRunReportsRepository;

    public SavedSearchRunReportsService(ISavedSearchRunReportsRepository savedSearchRunReportsRepository)
    {
        this.savedSearchRunReportsRepository = savedSearchRunReportsRepository;
    }

    public async Task Save(IEnumerable<SavedSearchRunReport> reports)
    {
        foreach (var report in reports)
        {
            await savedSearchRunReportsRepository.Save(report);
        }
    }

    public async Task<IEnumerable<SavedSearchRunReport>> GetTheLatestRunResults()
    {
        return await savedSearchRunReportsRepository.GetTheLatestRunResults();
    }
}
