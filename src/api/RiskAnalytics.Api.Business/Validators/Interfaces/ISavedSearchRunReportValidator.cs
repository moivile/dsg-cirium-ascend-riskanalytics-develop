using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Validators.Interfaces
{
    public interface ISavedSearchRunReportValidator
    {
        Task IsValidOrThrow(SavedSearchRunReportModel report);
    }
}