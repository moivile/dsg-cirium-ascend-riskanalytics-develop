using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Repository.AssetWatchSavedSearches;

namespace RiskAnalytics.Api.Business.Services;

public class SavedSearchAuthorizationService : ISavedSearchAuthorizationService
{
    private readonly ISavedSearchesRepository savedSearchesRepository;

    public SavedSearchAuthorizationService(
        ISavedSearchesRepository savedSearchesRepository)
    {
        this.savedSearchesRepository = savedSearchesRepository;
    }

    public async Task ValidateAccessToSearchOrThrow(int searchId, string userId)
    {
        var search = await savedSearchesRepository.Get(searchId);
        ValidateAccessToSearchOrThrow(search, userId);
    }

    public void ValidateAccessToSearchOrThrow(Repository.Entities.SavedSearch? search, string userId)
    {
        if(search == null)
        {
            throw new NotFoundException();
        }

        if (search.UserId != userId)
        {
            throw new ForbiddenException();
        }
    }

    public void ValidateAccessToAlertingEndpointOrThrow(string userId, string riskAnalyticsMachineToMachineAuth0ClientId)
    {
        if (userId != riskAnalyticsMachineToMachineAuth0ClientId)
            throw new ForbiddenException();
    }
}
