using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Validators;

public class SavedSearchRunReportValidator : ISavedSearchRunReportValidator
{
    public async Task IsValidOrThrow(SavedSearchRunReportModel report)
    {
        if (report.SavedSearchId == 0)
        {
            throw new EntityValidationException(ValidationMessages.SearchRunReportSavedSearchIdCannotBeNull);
        }

        if (report.AircraftId == 0)
        {
            throw new EntityValidationException(ValidationMessages.SearchRunReportAircraftIdCannotBeNull);
        }

        if (string.IsNullOrEmpty(report.CriteriaName))
        {
            throw new EntityValidationException(ValidationMessages.SearchRunReportCriteriaNameCannotBeNull);
        }

        if (string.IsNullOrEmpty(report.CriteriaValue))
        {
            throw new EntityValidationException(ValidationMessages.SearchRunReportCriteriaValueCannotBeNull);
        }


    }
}
