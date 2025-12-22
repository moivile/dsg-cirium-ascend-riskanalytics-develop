using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Services.AssetWatchSavedSearches
{
    public interface ISavedSearchService
    {
        Task<int> Create(SavedSearchModel savedSearch, string userId);
        Task Delete(int savedSearchId, string userId);
        Task<SavedSearchModel?> Get(int id);
        Task<IEnumerable<SavedSearchModel>> GetAll(string userId);
        Task<IEnumerable<UserSavedSearchModel>> GetAllUserSavedSearches();
        Task Update(SavedSearchModel savedSearch);
        Task UpdateIsActive(int id, bool isActive);
        Task UpdateNameAndDescription(int id, string name, string? description);
        Task TrackProcessedAlertForUser(int id, DateTime processedTimeSlot);
        Task<AssetWatchListGridDataResponseModel> ProcessUserSavedSearch(EmailAlertsUserSavedSearchModel savedSearch, string userId);

        Task<SavedSearchFrequency> GetFrequency(string userId);
        Task SetFrequency(string userId, SavedSearchFrequency frequency);

    }
}
