using System.Globalization;

namespace RiskAnalytics.Api.Repository.Tests;

public static class QueryTestHelpers
{
    public static bool IsQueryValid(string expectedQuery, string testQuery)
    {
        return String.Compare(expectedQuery, testQuery, CultureInfo.CurrentCulture, CompareOptions.IgnoreCase | CompareOptions.IgnoreSymbols) == 0;
    }
}
