using RiskAnalytics.Api.Model;
using System.Text;

namespace RiskAnalytics.Api.Repository.QueryBuilders;

public class TrackedUtilizationQueryBuilder
{
    public static StringBuilder GetSearchPeriodQuery(StringBuilder sb, AssetWatchSearchParameters assetWatchSearchParameters)
    {
        switch (assetWatchSearchParameters.Period)
        {
            case AssetWatchSearchPeriod.Yesterday:
                sb.Append($" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '1 day')");
                sb.Append($" OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '1 day') AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '1 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))");
                break;
            case AssetWatchSearchPeriod.Last7Days:
                sb.Append($" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '7 day')");
                sb.Append($" OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '7 day') AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '7 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))");
                break;
            case AssetWatchSearchPeriod.Last1Month:
                sb.Append($" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '1 month') ");
                sb.Append($" OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '1 month') AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '1 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))");
                break;
            case AssetWatchSearchPeriod.Last3Months:
                sb.Append($" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '3 month')");
                sb.Append($" OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '3 month') AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '3 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))");
                break;

            case AssetWatchSearchPeriod.Last6Months:
                sb.Append($" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '6 month')");
                sb.Append($" OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '6 month') AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '6 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))");
                break;
            case AssetWatchSearchPeriod.Last12Months:
                sb.Append($" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '12 month')");
                sb.Append($" OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '12 month') AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '12 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))");
                break;

            case AssetWatchSearchPeriod.SelectDateRange:

                if (!assetWatchSearchParameters.DateFrom.HasValue)
                {
                    throw new ArgumentException("DateFrom is required for custom search period");
                }

                if (!assetWatchSearchParameters.DateTo.HasValue)
                {
                    throw new ArgumentException("DateTo is required for custom search period");
                }

                //A & B
                sb.Append($" AND ((tracked_runway_departure_time_utc >={ToQueryDate(assetWatchSearchParameters.DateFrom.Value)} AND tracked_runway_departure_time_utc <{ToQueryDate(assetWatchSearchParameters.DateTo.Value.AddDays(1))})");

                // C & D
                sb.Append($" OR (tracked_runway_departure_time_utc <{ToQueryDate(assetWatchSearchParameters.DateFrom.Value)} AND tracked_runway_arrival_time_utc >={ToQueryDate(assetWatchSearchParameters.DateFrom.Value)}))");

                break;
            default:
                break;
        }

        return sb;
    }

    private static string ToQueryDate(DateTime date)
    {
        return $"'{date.ToString("yyyy-MM-dd")}'::date";
    }
}
