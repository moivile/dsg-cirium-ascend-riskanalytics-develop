using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Common.Messages;
using Xunit;
using RiskAnalytics.Api.Repository.Models;
using System.Security.Claims;
using RiskAnalytics.Api.Business.Authorization;

namespace RiskAnalytics.Business.Tests.Validators
{
    public class MonthlyUtilizationPerAircraftRequestValidatorTests
    {
        private readonly IMonthlyUtilizationPerAircraftRequestValidator monthlyUtilizationPerAircraftRequestValidator;
        private IEnumerable<Claim> user;

        public MonthlyUtilizationPerAircraftRequestValidatorTests()
        {

            monthlyUtilizationPerAircraftRequestValidator = new MonthlyUtilizationPerAircraftRequestValidator();
        }

        [Theory]
        [InlineData(1, 1, 1, 2020, 2021, true, 1, 1, MonthlyUtilizationGroup.AircraftFamily, new int[] { 1, 2, 3 },
         UtilizationPerAircraftValidationMessages.EndMonthYearMustBeGreaterThanOrEqualToStartMonthYear)]
        [InlineData(1, 1, 1, 2023, 2021, true, 0, 1, MonthlyUtilizationGroup.AircraftFamily, new int[] { 1, 2, 3 },
         UtilizationPerAircraftValidationMessages.OperatorIdMustBeGreaterThanZero)]
        [InlineData(1, 1, 1, 2023, 2021, true, 1, 0, MonthlyUtilizationGroup.AircraftFamily, new int[] { 1, 2, 3 },
         UtilizationPerAircraftValidationMessages.LessorIdMustBeGreaterThanZero)]
        [InlineData(0, 1, 1, 2023, 2021, true, 1, 0, MonthlyUtilizationGroup.AircraftFamily, new int[] { 1, 2, 3 },
         UtilizationPerAircraftValidationMessages.PortfolioIdMustBeGreaterThanZero)]
        [InlineData(1, 13, 1, 2023, 2021, true, 1, 0, MonthlyUtilizationGroup.AircraftFamily, new int[] { 1, 2, 3 },
         UtilizationPerAircraftValidationMessages.EndMonthIndexMustBeBetween1And12)]
        [InlineData(1, 1, 0, 2023, 2021, true, 1, 1, MonthlyUtilizationGroup.AircraftFamily, new int[] { 1, 2, 3 },
         UtilizationPerAircraftValidationMessages.StartMonthIndexMustBeBetween1And12)]
        public void ValidateMonthluUtilizationPerAircraftRequest(
            int portfolioId,
            int endMonthIndex,
            int startMonthIndex,
            int endYear,
            int startYear,
            bool isEmissions,
            int? operatorId,
            int? lessorId,
            MonthlyUtilizationGroup? groupBy,
            IReadOnlyCollection<int>? groupByFilterIds,
            string exceptionMessage)
        {
            var claimsIdentity = new ClaimsIdentity((IEnumerable<Claim>?)user, ClaimTypes.NameIdentifier);
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
            claimsIdentity.AddClaim(new Claim(PortfoliosClaim.EmissionsAddOn, ""));
            var exception = monthlyUtilizationPerAircraftRequestValidator.ValidateMonthluUtilizationPerAircraftRequest(
                portfolioId,
                endMonthIndex,
                startMonthIndex,
                endYear,
                startYear,
                true,
                operatorId,
                lessorId,
                claimsPrincipal,
                groupBy,
                groupByFilterIds);

            Assert.Contains(exceptionMessage, exception.Message);
        }
    }

}
