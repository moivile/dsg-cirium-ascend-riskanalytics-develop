namespace RiskAnalytics.Api.Common;

public static class DateTimeExtensions
{
    public static string ToQueryDate(this DateTime date)
    {
        return $"'{date.ToString("yyyy-MM-dd")}'::date";
    }
}
