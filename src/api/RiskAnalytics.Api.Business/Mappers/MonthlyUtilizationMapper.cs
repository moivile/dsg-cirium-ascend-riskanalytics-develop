using RiskAnalytics.Api.Business.Mappers.Interfaces;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Business.Mappers;

public class MonthlyUtilizationMapper : IMonthlyUtilizationMapper
{
    private const int StartYear = 2017;
    private const int StartMonth = 1;

    public IList<IEnumerable<MonthlyUtilization>> Map(
        IList<IEnumerable<MonthlyUtilization>> monthlyUtilizations)
    {
        var monthlyUtilizationsForAllMonths = new List<IEnumerable<MonthlyUtilization>>();

        var groups = monthlyUtilizations.SelectMany(x => x).GroupBy(i => i.GroupId).Select(i => new
        {
            GroupId = i.Key
        }).ToList();

        foreach (var group in groups)
        {
            var existingMonthlyUtilizationsForGroup = monthlyUtilizations?.SelectMany(x => x).Where(x => x.GroupId == group.GroupId).ToList();

            var monthlyUtilizationGroupWithAllMonths = GetMonthlyUtilizationsForAllMonths(existingMonthlyUtilizationsForGroup).ToList();

            monthlyUtilizationsForAllMonths.Add(monthlyUtilizationGroupWithAllMonths);
        }

        return monthlyUtilizationsForAllMonths
            .OrderBy(x => x.First().Group == UtilizationBaselineGroupName.Name ? 0 : 1)
            .ThenByDescending(x => x.First().NumberOfAircraftInGroup)
            .ToList();
    }

    private static IEnumerable<MonthlyUtilization> GetMonthlyUtilizationsForAllMonths(IList<MonthlyUtilization>? existingMonthlyUtilizations)
    {
        var monthlyUtilizationsForAllDates = new List<MonthlyUtilization>();

        var endYear = DateTime.UtcNow.Year;
        var endMonth = DateTime.UtcNow.Month;

        var totalMonths = (endYear - StartYear) * 12 + (endMonth - StartMonth);

        for (var i = 0; i < totalMonths; i++)
        {
            var year = StartYear + (StartMonth + i - 1) / 12;
            var month = (StartMonth + i - 1) % 12 + 1;

            var existingMonthlyUtilization = existingMonthlyUtilizations?.SingleOrDefault(x => x.Month == month && x.Year == year);

            if (existingMonthlyUtilization != null)
            {
                monthlyUtilizationsForAllDates.Add(existingMonthlyUtilization);
                continue;
            }

            if (existingMonthlyUtilizations == null)
            {
                continue;
            }

            var firstRowInTheGroup = existingMonthlyUtilizations.FirstOrDefault();

            if (firstRowInTheGroup == null)
            {
                continue;
            }

            var newMonthlyUtilization = new MonthlyUtilization
            {
                Year = year,
                Month = month,
                GroupId = firstRowInTheGroup.GroupId,
                Group = firstRowInTheGroup.Group,
                AircraftType = firstRowInTheGroup.AircraftType
            };

            monthlyUtilizationsForAllDates.Add(newMonthlyUtilization);
        }

        return monthlyUtilizationsForAllDates.OrderBy(x => x.Year).ThenBy(x => x.Month).ToList();
    }
}
