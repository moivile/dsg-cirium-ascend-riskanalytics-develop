using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.AssetWatchSavedSearches;
using System.Text.RegularExpressions;

namespace RiskAnalytics.Api.Business.Validators.Interfaces;

public class SavedSearchValidator : ISavedSearchValidator
{
    private readonly ISavedSearchesRepository savedSearchesRepository;

    public SavedSearchValidator(
    ISavedSearchesRepository savedSearchesRepository)
    {
        this.savedSearchesRepository = savedSearchesRepository;
    }

    public async Task<bool> IsNameUnique(string name, string userId)
    {
        return await savedSearchesRepository.IsNameUnique(name, userId);
    }

    public async Task IsValidOrThrow(SavedSearchModel savedSearch)
    {
        if (!await IsNameUnique(savedSearch.Name, savedSearch.UserId))
        {
            throw new EntityValidationException(ValidationMessages.SearchNameIsNotUnique);
        }

        if (savedSearch.Name.Length > 100)
        {
            throw new EntityValidationException(ValidationMessages.SearchNameIsGreaterThen100);
        }

        var htmlTagRegex = new Regex(@"<\s*([^ >]+)[^>]*>.*?<\s*/\s*\1\s*>");

        if (htmlTagRegex.IsMatch(savedSearch.Name))
        {
            throw new EntityValidationException(ValidationMessages.SearchNameContainsHtmlTags);
        }
    }
}
