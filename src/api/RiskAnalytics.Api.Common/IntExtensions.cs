namespace RiskAnalytics.Api.Common;
public static class IntExtensions
{
    public static int ConvertMinutesIntoHoursAndRoundOff(this int? minutes)
    {
        if (minutes.HasValue)
        {
            double hours = (double)minutes;
            return (int)Math.Round(hours / 60);
        }
        return 0;
    }
}
