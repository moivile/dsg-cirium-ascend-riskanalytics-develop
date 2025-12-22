using System.Security.Claims;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Repository.Models;

public class MonthlyUtilizationPerAircraftRequestValidator : IMonthlyUtilizationPerAircraftRequestValidator
{
    public Exception ValidateMonthluUtilizationPerAircraftRequest(
        int portfolioId,
        int endMonthIndex,
        int startMonthIndex,
        int endYear,
        int startYear,
        bool isEmissions,
        int? operatorId,
        int? lessorId,
        ClaimsPrincipal user,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds)
    {
        try
        {
            if (user == null || user.Claims.ToList().Count == 0)
            {
                throw new UnauthorizedAccessException(UtilizationPerAircraftValidationMessages.UnauthorizedAccess);
            }

            if (portfolioId <= 0)
            {
                throw new ArgumentOutOfRangeException(UtilizationPerAircraftValidationMessages.PortfolioIdMustBeGreaterThanZero);
            }

            ValidateDate(endMonthIndex, startMonthIndex, endYear, startYear);

            if (operatorId.HasValue && Math.Abs((decimal)operatorId) <= 0)
            {
                throw new ArgumentOutOfRangeException(UtilizationPerAircraftValidationMessages.OperatorIdMustBeGreaterThanZero);
            }

            if (lessorId.HasValue && Math.Abs((decimal)lessorId) <= 0)
            {
                throw new ArgumentOutOfRangeException(UtilizationPerAircraftValidationMessages.LessorIdMustBeGreaterThanZero);
            }

            if (groupBy.HasValue && groupByFilterIds == null)
            {
                throw new ArgumentNullException(UtilizationPerAircraftValidationMessages.GroupByFilterIdsMustBeProvidedWhenGroupByIsProvided);
            }
            return null;
        }
        catch (Exception ex)
        {
            return ex;
        }
    }

    private DateTime GetDateFromMonthYear(int year, int monthIndex)
    {
        return new DateTime(year, monthIndex, 1);
    }
    private void ValidateDate(int endMonthIndex, int startMonthIndex, int endYear, int startYear)
    {
        if (endMonthIndex < 1 || endMonthIndex > 12)
        {
            throw new ArgumentOutOfRangeException(UtilizationPerAircraftValidationMessages.EndMonthIndexMustBeBetween1And12);
        }
        if (startMonthIndex < 1 || startMonthIndex > 12)
        {
            throw new ArgumentOutOfRangeException(UtilizationPerAircraftValidationMessages.StartMonthIndexMustBeBetween1And12);
        }
        if (endYear > DateTime.Now.Year)
        {
            throw new ArgumentOutOfRangeException(UtilizationPerAircraftValidationMessages.EndYearMustBeLessThanCurrentYear);
        }
        if (startYear < 2017)
        {
            throw new ArgumentOutOfRangeException(UtilizationPerAircraftValidationMessages.StartYearMustBeGreaterThanOrEqualTo2017);
        }
        if (GetDateFromMonthYear(endYear, endMonthIndex) < GetDateFromMonthYear(startYear, startMonthIndex))
        {
            throw new EntityValidationException(UtilizationPerAircraftValidationMessages.EndMonthYearMustBeGreaterThanOrEqualToStartMonthYear);
        }
    }

}
