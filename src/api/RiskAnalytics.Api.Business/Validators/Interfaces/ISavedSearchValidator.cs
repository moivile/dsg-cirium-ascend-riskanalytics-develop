using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Validators.Interfaces;
public interface ISavedSearchValidator
{
    Task IsValidOrThrow(SavedSearchModel savedSearch);

    Task<bool> IsNameUnique(string name, string userId);
}
