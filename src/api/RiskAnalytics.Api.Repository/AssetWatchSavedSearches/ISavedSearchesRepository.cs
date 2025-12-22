using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Entities;

namespace RiskAnalytics.Api.Repository.AssetWatchSavedSearches;

public interface ISavedSearchesRepository
{
    Task<int> Create(SavedSearch savedSearch, string userId);
    Task Delete(int id, string userId);
    Task<SavedSearch?> Get(int id);
    Task<IEnumerable<SavedSearch>> GetAll(string userId);
    Task<IEnumerable<SavedSearch>> GetAllActiveSavedSearches();
    Task<bool> IsNameUnique(string name, string userId);
    Task Update(SavedSearch savedSearch);
    Task TrackProcessedAlertForUser(int id, DateTime dateTimeSent);

    Task SetFrequency(string userId, SavedSearchFrequency frequency);
    Task<SavedSearchFrequency> GetFrequency(string userId);
    Task<AssetWatchFilterValues> GetAssetWatchFilterValues(Entities.SavedSearch savedSearch);
}
