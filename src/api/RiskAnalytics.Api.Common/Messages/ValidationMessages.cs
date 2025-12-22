namespace RiskAnalytics.Api.Common.Messages;

public static class ValidationMessages
{
    public const string PortfolioNameIsNotUnique = "The given name is not unique amongst your existing portfolios, please choose another one";
    public const string PortfolioNameIsGreaterThen100 = "The given name is greater than 100 characters, please choose another one";
    public const string PortfolioNameContainsHtmlTags = "The given name contains HTML tags, please choose another one";

    public const string GetMonthlyUtilizationRequestRequiresGroupByOrIncludeBaseLine = "Request must have a valid GroupBy or have IncludeBaseline set to true.";
    public const string GetMonthlyUtilizationRequestRequiresGroupByFilterIds = "GroupBy requires at least 1 groupByFilterId.";
    public const string UserDoesNotHaveEntitlementToAssetWatch = "User does not have entitlement to Asset Watch";

    public const string MandatoryDateFromDateIsNull = "DateFrom is required for custom search period";
    public const string MandatoryDateToDateIsNull = "DateTo is required for custom search period";

    public const string SearchNameCannotBeNull = "Search name cannot be null";
    public const string SearchNameIsNotUnique = "The given name is not unique amongst your searches, please choose another one";
    public const string SearchNameIsGreaterThen100 = "The given name is greater than 100 characters, please choose another one";
    public const string SearchNameContainsHtmlTags = "The given name contains HTML tags, please choose another one";

    public static string SavedSearchFrequencyContainInvalidValue = "The provided frequency is invalid, please select either 'daily' or 'alertsonly' only";

    public const string SearchRunReportSavedSearchIdCannotBeNull = "SavedSearchId cannot be null";
    public const string SearchRunReportAircraftIdCannotBeNull = "AircraftId cannot be null";
    public const string SearchRunReportCriteriaNameCannotBeNull = "CriteriaName cannot be null";
    public const string SearchRunReportCriteriaValueCannotBeNull = "CriteriaValue cannot be null";


}
