using RiskAnalytics.Api.Business.Mappers;
using RiskAnalytics.Api.Repository.Models;
using Xunit;

namespace RiskAnalytics.Business.Tests.Mappers;

public class MonthlyUtilizationMapperTests
{
    [Fact]
    public void Map_MapGroupCountsAndAddsMissingMonthlyUtilizationFrom2017ToLastMonth()
    {
        // arrange

        IList<IEnumerable<MonthlyUtilization>> existingMonthlyUtilizations = new List<IEnumerable<MonthlyUtilization>>
        {
            new List<MonthlyUtilization>
            {
                new() { GroupId = null, Year = 2023, Month = 1, AverageHours = 1, NumberOfAircraftInGroup = 123, AircraftType="xxx",Group = UtilizationBaselineGroupName.Name },
                new() { GroupId = null, Year = 2023, Month = 3, AverageHours = 2, NumberOfAircraftInGroup = 123, AircraftType="xxx",Group = UtilizationBaselineGroupName.Name }
            },
            new List<MonthlyUtilization>
            {
                new() { GroupId = 1, Year = 2023, Month = 1, AverageHours = 3, NumberOfAircraftInGroup = 456,Group = "Narrowbody" },
                new() { GroupId = 1, Year = 2023, Month = 2, AverageHours = 4, NumberOfAircraftInGroup = 456,Group = "Narrowbody" }
            }
        };

        // act
        var monthlyUtilizations = new MonthlyUtilizationMapper().Map(existingMonthlyUtilizations);

        // assert
        var expectedNumberOfMonths = (DateTime.UtcNow.Year - 2017) * 12 + DateTime.UtcNow.Month - 1;
        var expectedEndYear = DateTime.UtcNow.AddMonths(-1).Year;
        var expectedEndMonth = DateTime.UtcNow.AddMonths(-1).Month;

        Assert.Equal(2, monthlyUtilizations.Count);

        Assert.Equal(expectedNumberOfMonths, monthlyUtilizations[0].Count());
        Assert.Equal(2017, monthlyUtilizations[0].First().Year);
        Assert.Equal(1, monthlyUtilizations[0].First().Month);
        Assert.Equal(expectedEndYear, monthlyUtilizations[0].Last().Year);
        Assert.Equal(expectedEndMonth, monthlyUtilizations[0].Last().Month);
        Assert.Equal(1, monthlyUtilizations[0].Single(x => x is { Year: 2023, Month: 1 }).AverageHours);
        Assert.Equal(2, monthlyUtilizations[0].Single(x => x is { Year: 2023, Month: 3 }).AverageHours);
        Assert.Equal(0, monthlyUtilizations[0].Where(x => x.Year != 2023 && x.Month != 1 && x.Month != 3).Sum(x => x.AverageHours));
        Assert.True(monthlyUtilizations[0].All(x => x.GroupId == null));
        Assert.True(monthlyUtilizations[0].All(x => x.Group == UtilizationBaselineGroupName.Name));
        Assert.True(monthlyUtilizations[0].Where(i => i.Year == 2023 && i.Month == 1).First().NumberOfAircraftInGroup == 123);

        Assert.Equal(expectedNumberOfMonths, monthlyUtilizations[1].Count());
        Assert.Equal(2017, monthlyUtilizations[1].First().Year);
        Assert.Equal(1, monthlyUtilizations[1].First().Month);
        Assert.Equal(expectedEndYear, monthlyUtilizations[1].Last().Year);
        Assert.Equal(expectedEndMonth, monthlyUtilizations[1].Last().Month);
        Assert.Equal(3, monthlyUtilizations[1].Single(x => x is { Year: 2023, Month: 1 }).AverageHours);
        Assert.Equal(4, monthlyUtilizations[1].Single(x => x is { Year: 2023, Month: 2 }).AverageHours);
        Assert.Equal(0, monthlyUtilizations[1].Where(x => x.Year != 2023 && x.Month != 1 && x.Month != 2).Sum(x => x.AverageHours));
        Assert.True(monthlyUtilizations[1].All(x => x.GroupId == 1));
        Assert.True(monthlyUtilizations[1].All(x => x.Group == "Narrowbody"));
        Assert.True(monthlyUtilizations[1].Where(i => i.Year == 2023 && i.Month == 1).First().NumberOfAircraftInGroup == 456);
    }

    [Fact]
    public void Map_WhenThereIsNoExistingMonthlyUtilizationData_MapGroupCountsAndAddsMissingMonthlyUtilizationsFrom2017ToLastMonth()
    {
        // arrange
        IList<IEnumerable<MonthlyUtilization>> existingMonthlyUtilizations = new List<IEnumerable<MonthlyUtilization>>
        {
            new List<MonthlyUtilization>
            {
                new MonthlyUtilization
                {
                    GroupId = 1, Group = "Narrowbody"
                }
            }
        };

        // act
        var monthlyUtilizations = new MonthlyUtilizationMapper().Map(existingMonthlyUtilizations);

        // assert
        var expectedNumberOfMonths = (DateTime.UtcNow.Year - 2017) * 12 + DateTime.UtcNow.Month - 1;
        var expectedEndYear = DateTime.UtcNow.AddMonths(-1).Year;
        var expectedEndMonth = DateTime.UtcNow.AddMonths(-1).Month;

        Assert.Single(monthlyUtilizations);
        Assert.Equal(expectedNumberOfMonths, monthlyUtilizations[0].Count());
        Assert.Equal(2017, monthlyUtilizations[0].First().Year);
        Assert.Equal(1, monthlyUtilizations[0].First().Month);
        Assert.Equal(expectedEndYear, monthlyUtilizations[0].Last().Year);
        Assert.Equal(expectedEndMonth, monthlyUtilizations[0].Last().Month);
        Assert.Equal(0, monthlyUtilizations[0].Sum(x => x.AverageHours));
        Assert.True(monthlyUtilizations[0].All(x => x.GroupId == 1));
        Assert.True(monthlyUtilizations[0].All(x => x.Group == "Narrowbody"));
        Assert.True(monthlyUtilizations[0].All(x => x.NumberOfAircraftInGroup == 0));
    }

    [Fact]
    public void Map_OrderMonthlyUtilizationsByYearAndMonth()
    {
        // arrange

        IList<IEnumerable<MonthlyUtilization>> existingMonthlyUtilizations = new List<IEnumerable<MonthlyUtilization>>
        {
            new List<MonthlyUtilization>
            {
                new() { GroupId = null, Year = 2017, Month = 4 },
                new() { GroupId = null, Year = 2017, Month = 2 },
                new() { GroupId = null, Year = 2017, Month = 1 }
            }
        };

        // act
        var monthlyUtilizations = new MonthlyUtilizationMapper().Map(existingMonthlyUtilizations);

        // assert
        var monthlyUtilizationGroup = monthlyUtilizations[0].ToList();

        Assert.Equal(1, monthlyUtilizationGroup[0].Month);
        Assert.Equal(2017, monthlyUtilizationGroup[0].Year);

        Assert.Equal(2, monthlyUtilizationGroup[1].Month);
        Assert.Equal(2017, monthlyUtilizationGroup[1].Year);

        Assert.Equal(3, monthlyUtilizationGroup[2].Month);
        Assert.Equal(2017, monthlyUtilizationGroup[2].Year);

        Assert.Equal(4, monthlyUtilizationGroup[3].Month);
        Assert.Equal(2017, monthlyUtilizationGroup[3].Year);
    }

    [Fact]
    public void Map_OrderMonthlyUtilizationGroupsByBaselineThenNumberOfAircraftInGroupDescending()
    {
        // arrange

        IList<IEnumerable<MonthlyUtilization>> existingMonthlyUtilizations = new List<IEnumerable<MonthlyUtilization>>
        {
            new List<MonthlyUtilization>
            {
                new() { GroupId = 2, Group = "Widebody", NumberOfAircraftInGroup = 789 },
                new() { GroupId = null, Group = UtilizationBaselineGroupName.Name, NumberOfAircraftInGroup = 123 },
                new() { GroupId = 1, Group = "Narrowbody", NumberOfAircraftInGroup = 456 }
            }
        };

        // act
        var monthlyUtilizations = new MonthlyUtilizationMapper().Map(existingMonthlyUtilizations);

        // assert
        Assert.Equal(3, monthlyUtilizations.Count);

        Assert.True(monthlyUtilizations[0].All(x => x.Group == UtilizationBaselineGroupName.Name));
        Assert.True(monthlyUtilizations[1].All(x => x.Group == "Widebody"));
        Assert.True(monthlyUtilizations[2].All(x => x.Group == "Narrowbody"));
    }
}
