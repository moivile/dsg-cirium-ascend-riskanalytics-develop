namespace RiskAnalytics.Api.Common
{
    public static class DoubleExtensions
    {
        public static int RoundDown(this double value)
        {
            return (int)Math.Round(value);
        }
        public static double ConvertMinutesIntoHoursAndRoundOff(this double? minutes)
        {
            if (minutes == null || minutes.Value == 0)
            {
                return 0;
            }

            var totalMinutes = minutes.Value;
            return Math.Round(totalMinutes / 60, 1);
        }
    }
}
