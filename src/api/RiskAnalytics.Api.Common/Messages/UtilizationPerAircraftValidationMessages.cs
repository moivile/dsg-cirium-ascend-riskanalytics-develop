namespace RiskAnalytics.Api.Common.Messages
{
    public static class UtilizationPerAircraftValidationMessages
    {
        public const string UnauthorizedAccess = "User does not have entitlement";
        public const string EndMonthYearMustBeGreaterThanOrEqualToStartMonthYear = "end date should be greater than  start date";
        public const string PortfolioIdMustBeGreaterThanZero = "PortfolioId must be greater than 0";
        public const string EndMonthIndexMustBeBetween1And12 = "Index for end month must be between 1 and 12";
        public const string StartMonthIndexMustBeBetween1And12 = "Index for start month must be between 1 and 12";
        public const string EndYearMustBeLessThanCurrentYear = "End year must be less than current year";
        public const string StartYearMustBeGreaterThanOrEqualTo2017 = "Start year must be greater than or equal to 2017";
        public const string OperatorIdMustBeGreaterThanZero = "OperatorId must be greater than 0";
        public const string LessorIdMustBeGreaterThanZero = "LessorId must be greater than 0";
        public const string GroupByFilterIdsMustBeProvidedWhenGroupByIsProvided = "GroupByFilterIds must be provided when GroupBy is provided";

    }
}
