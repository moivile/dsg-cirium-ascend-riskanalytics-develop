
using NSubstitute;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;
using System.Text.RegularExpressions;

namespace RiskAnalytics.Api.Repository.Tests
{
    public class GroundEventsRepositoryTests
    {
        private readonly IGroundEventsRepository groundEventsRepository;
        private readonly ISnowflakeRepository snowflakeRepositoryMock;

        public GroundEventsRepositoryTests()
        {
            snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
            groundEventsRepository = new GroundEventsRepository(snowflakeRepositoryMock);
        }
        [Fact]
        public async Task SummaryGroundEvents_EnsurePortfolioIdIsSetToParameter()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                .Select(call => call.GetArguments()[0])
                .OfType<string>()
                .FirstOrDefault();

            Assert.Contains(":portfolioId", actualSql);
        }

        [Fact]
        public async Task SummaryGroundEvents_EnsurePortfolioIdIsSetToParameter_WithDifferentPeriod()
        {
            // arrange
            const int portfolioId = 2;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last1Month
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Country;

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                .Select(call => call.GetArguments()[0])
                .OfType<string>()
                .FirstOrDefault();

            Assert.Contains(":portfolioId", actualSql);
        }

        [Fact]
        public async Task SummaryGroundEvents_EnsurePortfolioIdIsSetToParameter_WithCustomDateRange()
        {
            // arrange
            const int portfolioId = 3;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.SelectDateRange,
                DateFrom = new DateTime(2023, 1, 1),
                DateTo = new DateTime(2023, 1, 31)
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Region;

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                .Select(call => call.GetArguments()[0])
                .OfType<string>()
                .FirstOrDefault();

            Assert.Contains(":portfolioId", actualSql);
        }

        [Fact]
        public async Task SummaryGroundEvents_EnsurePortfolioIdIsSetToParameter_WithNullDateRange_ThrowsArgumentException()
        {
            // arrange
            const int portfolioId = 4;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.SelectDateRange,
                DateFrom = null,
                DateTo = null
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;

            // act & assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption));
            Assert.Equal(ValidationMessages.MandatoryDateFromDateIsNull, exception.Message);
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByCountry_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Country;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
            very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
            FROM (SELECT ground_event_location_country_id AS id,
            COUNT(1),
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
            FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(ground_event_location_country_id)
            LIMIT 1000) AS rawdata
            INNER JOIN {Constants.RiskAnalyticsTablePrefix}countries AS countries ON countries.country_code_iata = id
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByRegion_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Region;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
            very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
            FROM (SELECT ground_event_location_region_id AS id,
            COUNT(1),
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
            FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(ground_event_location_region_id)
            LIMIT 1000) AS rawdata
            INNER JOIN {Constants.RiskAnalyticsTablePrefix}regions AS regions ON regions.region_code = id
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByCity_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.City;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
            very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
            FROM (SELECT ground_event_location_city_name AS city_name,
            COUNT(1),
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
            FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(ground_event_location_city_name)
            LIMIT 1000) AS rawdata
            INNER JOIN {Constants.RiskAnalyticsTablePrefix}cities AS cities ON cities.name = city_name
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirport_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
                WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
                AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
                GROUP BY(arrival_airports.name)
                LIMIT 1000) AS rawdata
                ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                                   .Select(call => call.GetArguments()[0])
                                                   .OfType<string>()
                                                   .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirportAndRegionFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                RegionCodes = new List<string> { "5" }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GE.ground_event_location_region_id IN ('5') AND GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirportAndRegionFilterSpecified_CallDbWithExpectedQueryAndRegionNameInLowerCase()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                RegionCodes = new List<string> { "5", "6" }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GE.ground_event_location_region_id IN ('5','6') AND GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirportAndOperatorIdFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                OperatorIds = new List<int> { 1 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND  GE.operator_organization_id IN (1)
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirportAndLessorIdFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                LessorIds = new List<int> { 1 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND  GE.lessor_organization_id IN (1)
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirportAndAircraftSeriesIdsFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                AircraftSeriesIds = new List<int> { 1 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND  GE.aircraft_series_id IN (1)
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirportAndEngineSeriesFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                EngineSerieIds = new List<int> { 3 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND  GE.engine_series_id IN (3)
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirportAndEngineSeriesFilterSpecified_CallDbWithExpectedQueryAndEngineSeriesInLowerCase()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                EngineSerieIds = new List<int> { 5 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND  GE.engine_series_id IN (5)
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAirportAndMsnsFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                AircraftIds = new List<int> { 123 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND  GE.aircraft_id IN  (123)
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_PeriodYesterday_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Yesterday
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '1 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_PeriodLast7Days_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_PeriodLast30Days_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last1Month
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '1 month') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_PeriodLast3MonthsDays_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last3Months
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '3 month') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_PeriodLast6Months_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last6Months
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '6 month') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_PeriodLast12Months_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last12Months
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '12 month') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_PeriodCustom_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.SelectDateRange,
                DateFrom = new DateTime(2019, 1, 1),
                DateTo = new DateTime(2019, 1, 31)
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >='2019-01-01'::date AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <'2019-02-01'::date
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_CallWithSelectDateRangeButTheDatesFromIsNull_ThrowsArgumentException()
        {
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.SelectDateRange,
                DateFrom = null,
                DateTo = new DateTime(2019, 1, 31)
            };
            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;

            // act
            // assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption));
            Assert.Equal(ValidationMessages.MandatoryDateFromDateIsNull, exception.Message);
        }

        [Fact]
        public async Task SummaryGroundEvents_CallWithSelectDateRangeButTheDatesToIsNull_ThrowsArgumentException()
        {
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.SelectDateRange,
                DateFrom = DateTime.UtcNow,
                DateTo = null
            };
            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;

            // act
            // assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption));
            Assert.Equal(ValidationMessages.MandatoryDateToDateIsNull, exception.Message);
        }

        [Fact]
        public async Task GetAssetWatchListGridDataWithAirportCodes_CallDbWithExpectedQuery()
        {
            var portfolioId = 10;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                AirportCodes = new List<string> { "4" }
            };
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GE.ground_event_location_airport_code_fs_internal IN ('4') AND GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";
            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task GetAssetWatchListGridDataWithCityIds_CallDbWithExpectedQuery()
        {
            var portfolioId = 10;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                Cities = new List<string> { "4" }
            };
            const string expectedSql = $@"SELECT name, very_short_stay_count, short_stay_count, medium_stay_count, long_stay_count,
                very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                FROM (SELECT arrival_airports.name AS name,
                COUNT(1),
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = GE.ground_event_location_airport_code_fs_internal
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GE.ground_event_location_city_name IN ('4') AND GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY(arrival_airports.name)
            LIMIT 1000) AS rawdata
            ORDER BY TOTAL DESC";
            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByOperator_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Operator;
            const string expectedSql = $@"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
            very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
            FROM (SELECT AAH.OPERATOR AS NAME,
            COUNT(1),
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
            FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
            INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID= GE.AIRCRAFT_ID
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
            GROUP BY (AAH.OPERATOR)
            LIMIT 1000) AS RAWDATA
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByOperatorAndFilterByOperator_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                OperatorIds = new List<int> { 1 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Operator;
            const string expectedSql = $@"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
            very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
            FROM (SELECT AAH.OPERATOR AS NAME,
            COUNT(1),
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
            COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
            FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
            INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID= GE.AIRCRAFT_ID
            WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :portfolioId)
            AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE AND  GE.operator_organization_id IN (1)
            GROUP BY (AAH.OPERATOR)
            LIMIT 1000) AS RAWDATA
            ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByLessor_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Lessor;
            const string expectedSql = @$"SELECT
                    NAME,
                    VERY_SHORT_STAY_COUNT,
                    SHORT_STAY_COUNT,
                    MEDIUM_STAY_COUNT,
                    LONG_STAY_COUNT,
                    VERY_SHORT_STAY_COUNT + SHORT_STAY_COUNT + MEDIUM_STAY_COUNT + LONG_STAY_COUNT AS TOTAL
                FROM (
                    SELECT
                        LESSOR.ORGANIZATION AS NAME,
                        COUNT(1),
                        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM RI_PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH
                    ON AAH.AIRCRAFT_ID = GE.AIRCRAFT_ID
                    LEFT JOIN ""organizations_latest"" AS LESSOR
                    ON LESSOR.ORGANIZATION_ID = AAH.MANAGER_ORGANIZATION_ID
                    AND LESSOR.ORGANIZATION_SUB_TYPE_ID = 88
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM RI_PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :PORTFOLIOID)
                    AND LESSOR.ORGANIZATION IS NOT NULL
                    AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
                    GROUP BY(LESSOR.ORGANIZATION)
                    LIMIT 1000
                ) AS RAWDATA
                ORDER BY TOTAL DESC
            ";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        [Fact]
        public async Task SummaryGroundEvents_GroupByAircraftSeries_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.AircraftSeries;
            const string expectedSql = @$"SELECT NAME,
                    VERY_SHORT_STAY_COUNT,
                    SHORT_STAY_COUNT,
                    MEDIUM_STAY_COUNT,
                    LONG_STAY_COUNT,
                    VERY_SHORT_STAY_COUNT + SHORT_STAY_COUNT + MEDIUM_STAY_COUNT + LONG_STAY_COUNT AS TOTAL
                FROM
                (
                    SELECT AC.AIRCRAFT_SERIES AS NAME,
                        COUNT(1),
                        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                        COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM RI_PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID = GE.AIRCRAFT_ID
                    INNER JOIN ""aircraft_configurations_latest"" AS AC ON AC.AIRCRAFT_CONFIGURATION_ID = AAH.AIRCRAFT_CONFIGURATION_ID
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM RI_PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :PORTFOLIOID)
                    AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
					GROUP BY(AC.AIRCRAFT_SERIES)
					LIMIT 1000) AS RAWDATA
					ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }
        [Fact]
        public async Task SummaryGroundEvents_GroupByEngineSeries_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.EngineSeries;
            const string expectedSql = @$"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
                    very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                    FROM (SELECT AC.ENGINE_SERIES AS NAME,
                    COUNT(1),
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID = GE.AIRCRAFT_ID
                    INNER JOIN ""aircraft_configurations_latest"" AS AC ON AC.AIRCRAFT_CONFIGURATION_ID = AAH.AIRCRAFT_CONFIGURATION_ID
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :PORTFOLIOID)
					AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
					GROUP BY(AC.ENGINE_SERIES)
					LIMIT 1000) AS RAWDATA
					ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }
        [Fact]
        public async Task SummaryGroundEvents_GroupByAircraftType_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.AircraftType;
            const string expectedSql = @$"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
                    VERY_SHORT_STAY_COUNT+SHORT_STAY_COUNT+MEDIUM_STAY_COUNT+LONG_STAY_COUNT AS TOTAL
                    FROM (SELECT AC.AIRCRAFT_TYPE AS NAME,
                    COUNT(1),
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM RI_PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID= GE.AIRCRAFT_ID
                    INNER JOIN ""aircraft_configurations_latest"" AS AC ON AC.AIRCRAFT_CONFIGURATION_ID = AAH.AIRCRAFT_CONFIGURATION_ID
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM RI_PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :PORTFOLIOID)
                    AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
                    GROUP BY(AC.AIRCRAFT_TYPE)
                    LIMIT 1000) AS RAWDATA
                    ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                .FirstOrDefault(call => call.GetMethodInfo().Name == "Query")?
                .GetArguments()[0] as string;

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }


        [Fact]
        public async Task SummaryGroundEvents_GroupByMarketClass_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 117;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.MarketClass;
            const string expectedSql = @$"SELECT NAME, VERY_SHORT_STAY_COUNT, SHORT_STAY_COUNT, MEDIUM_STAY_COUNT, LONG_STAY_COUNT,
                    very_short_stay_count+short_stay_count+medium_stay_count+long_stay_count AS TOTAL
                    FROM (SELECT AC.AIRCRAFT_MARKET_CLASS AS NAME,
                    COUNT(1),
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 360 AND GROUND_EVENT_DURATION_MINUTES <= 720 THEN 1 ELSE NULL END) AS VERY_SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 720 AND GROUND_EVENT_DURATION_MINUTES <= 2880 THEN 1 ELSE NULL END) AS SHORT_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 2880 AND GROUND_EVENT_DURATION_MINUTES <= 10080 THEN 1 ELSE NULL END) AS MEDIUM_STAY_COUNT,
                    COUNT(CASE WHEN GROUND_EVENT_DURATION_MINUTES > 10080 THEN 1 ELSE NULL END) AS LONG_STAY_COUNT
                    FROM RI_PORTFOLIO_AIRCRAFT_GROUND_EVENTS AS GE
                    INNER JOIN ""aircraft_all_history_latest"" AS AAH ON AAH.AIRCRAFT_ID= GE.AIRCRAFT_ID
                    INNER JOIN ""aircraft_configurations_latest"" AS AC ON AC.AIRCRAFT_CONFIGURATION_ID = AAH.AIRCRAFT_CONFIGURATION_ID
                    WHERE GE.AIRCRAFT_ID IN (SELECT AIRCRAFT_ID FROM RI_PORTFOLIO_AIRCRAFT WHERE PORTFOLIO_ID = :PORTFOLIOID)
                    AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC >=(CURRENT_DATE - interval '7 day') AND  GROUND_EVENT_START_RUNWAY_ARRIVAL_TIME_UTC <CURRENT_DATE
                    GROUP BY(AC.AIRCRAFT_MARKET_CLASS)
                    LIMIT 1000) AS RAWDATA
                    ORDER BY TOTAL DESC";

            // act
            await groundEventsRepository.SummaryGroundEvents(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            var actualSql = snowflakeRepositoryMock.ReceivedCalls()
                                       .Select(call => call.GetArguments()[0])
                                       .OfType<string>()
                                       .FirstOrDefault();

            Assert.Equal(NormalizeSql(expectedSql), NormalizeSql(actualSql));
        }

        private string NormalizeSql(string sql)
        {
            return Regex.Replace(sql, @"\s+", "").ToLower();
        }

    }
}
