
using NSubstitute;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Repository.Tests
{
    public class TrackedUtilizationRepositoryTests
    {
        private readonly ITrackedUtilizationRepository trackedUtilizationRepository;
        private readonly ISnowflakeRepository snowflakeRepositoryMock;

        const string last7daysClause = $" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '7 day') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '7 day')" +
        $" AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '7 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))";

        public TrackedUtilizationRepositoryTests()
        {
            snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
            trackedUtilizationRepository = new TrackedUtilizationRepository(snowflakeRepositoryMock);
        }

        [Fact]
        public async Task SummaryFlights_GroupByCountry_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Country;
            const string expectedSql = $@"SELECT countries.name, count FROM (SELECT
ptu.tracked_arrival_country_code_iata AS id,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(ptu.tracked_arrival_country_code_iata) LIMIT 1000) AS rawdata
INNER JOIN {Constants.RiskAnalyticsTablePrefix}countries AS countries ON countries.country_code_iata = id ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByRegion_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Region;
            const string expectedSql = $@"SELECT regions.name, count FROM (SELECT ptu.tracked_arrival_region_code AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(ptu.tracked_arrival_region_code) LIMIT 1000) AS rawdata
INNER JOIN {Constants.RiskAnalyticsTablePrefix}regions AS regions ON regions.region_code = id ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByCity_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.City;
            const string expectedSql = $@"SELECT cities.name, count FROM (SELECT ptu.tracked_arrival_city_name AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(ptu.tracked_arrival_city_name) LIMIT 1000) AS rawdata
INNER JOIN {Constants.RiskAnalyticsTablePrefix}cities AS cities ON cities.name = id ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirport_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndRegionFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                RegionCodes = new List<string> { "4" },
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
AND  ptu.tracked_arrival_region_code IN (4)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndCityFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                Cities = new List<string> { "4" },
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
AND ptu.tracked_arrival_city_name IN (4)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndAirportFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                AirportCodes = new List<string> { "4" }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
AND  ptu.tracked_arrival_airport_fs_internal IN ('4')
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndRegionFilterSpecified_CallDbWithExpectedQueryAndRegionNameInLowerCase()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                RegionCodes = new List<string> { "4",  "6" }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
AND  ptu.tracked_arrival_region_code IN (4,6)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndOperatorIdFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                OperatorIds = new List<int> { 1 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause} AND  ptu.operator_organization_id IN (1)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndLessorIdFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                LessorIds = new List<int> { 1 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}  AND  ptu.lessor_organization_id IN (1)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndAircraftSeriesIdsFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                AircraftSeriesIds = new List<int> { 1 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}  AND  ptu.aircraft_series_id IN (1)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndEngineSeriesFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                EngineSerieIds = new List<int> { 4 },
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}  AND  ptu.engine_series_id IN (4)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndEngineSeriesFilterSpecified_CallDbWithExpectedQueryAndEngineSeriesInLowerCase()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                EngineSerieIds = new List<int> { 4 },
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}  AND  ptu.engine_series_id IN (4)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndMsnsFilterSpecified_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                AircraftIds = new List<int> { 123 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}  AND  ptu.aircraft_id IN  (123)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAirportAndMsnsFilterSpecified_CallDbWithExpectedQueryAndMsnInLowerCase()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                AircraftIds = new List<int> { 123 }
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}  AND  ptu.aircraft_id IN  (123)
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_PeriodYesterday_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Yesterday
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '1 day') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '1 day')
 AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '1 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_PeriodLast7Days_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_PeriodLast30Days_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last1Month
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '1 month')  OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '1 month')
 AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '1 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_PeriodLast3Months_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last3Months
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '3 month') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '3 month')
 AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '3 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_PeriodLast6Months_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last6Months
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '6 month') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '6 month')
 AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '6 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_PeriodLast12Months_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last12Months
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '12 month') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '12 month')
 AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '12 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_PeriodCustom_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.SelectDateRange,
                DateFrom = new DateTime(2019, 1, 1),
                DateTo = new DateTime(2019, 1, 31)
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
AND ((tracked_runway_departure_time_utc >='2019-01-01'::date AND tracked_runway_departure_time_utc <'2019-02-01'::date) OR (tracked_runway_departure_time_utc <'2019-01-01'::date
AND tracked_runway_arrival_time_utc >='2019-01-01'::date))
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_RouteCategoryDomestic_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                RouteCategory = AssetWatchRouteCategory.Domestic
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Airport;
            const string expectedSql = $@"SELECT
arrival_airports.name AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
INNER JOIN {Constants.RiskAnalyticsTablePrefix}airports AS arrival_airports ON arrival_airports.airport_fs_internal = ptu.tracked_arrival_airport_fs_internal
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
AND  route_category='Domestic'
GROUP BY(arrival_airports.name)
ORDER BY count DESC
LIMIT 1000";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_CallWithSelectDateRangeButTheDatesFromIsNull_ThrowsArgumentException()
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
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption));
            Assert.Equal(ValidationMessages.MandatoryDateFromDateIsNull, exception.Message);
        }

        [Fact]
        public async Task SummaryFlights_CallWithSelectDateRangeButTheDatesToIsNull_ThrowsArgumentException()
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
            var exception = await Assert.ThrowsAsync<ArgumentException>(() => trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption));
            Assert.Equal(ValidationMessages.MandatoryDateToDateIsNull, exception.Message);
        }

        [Fact]
        public async Task SummaryFlights_GroupByOperator_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Operator;
            const string expectedSql = $@"SELECT DISTINCT aah.operator as name, count FROM (SELECT ptu.operator_organization_id AS id,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(ptu.operator_organization_id) LIMIT 1000) AS rawdata
INNER JOIN ""aircraft_all_history_latest"" AS aah ON aah.operator_organization_id = id ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByLessor_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.Lessor;
            const string expectedSql = $@"SELECT DISTINCT lessor.organization as name, count FROM (SELECT ptu.lessor_organization_id AS id,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(ptu.lessor_organization_id) LIMIT 1000) AS rawdata
INNER JOIN ""organizations_latest"" AS lessor ON lessor.organization_id = id
AND lessor.organization_sub_type_id = 88
ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAircraftSeries_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.AircraftSeries;
            const string expectedSql = $@"SELECT DISTINCT ac.aircraft_series as name, count FROM (SELECT ptu.aircraft_series_id AS id,COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
 AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '7 day') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '7 day') AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '7 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))
GROUP BY(ptu.aircraft_series_id) LIMIT 1000) AS rawdata
INNER JOIN ""aircraft_configurations_latest"" AS ac ON ac.aircraft_series_id = id  ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p => { calledQuery = p.Args().First() as string; });

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }
        [Fact]
        public async Task SummaryFlights_GroupByEngineSeries_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.EngineSeries;
            const string expectedSql = $@"SELECT DISTINCT name, count FROM (SELECT ptu.engine_series_id AS id,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(ptu.engine_series_id) LIMIT 1000) AS rawdata
INNER JOIN {Constants.RiskAnalyticsTablePrefix}engine_series AS es ON es.engine_series_id = id ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task SummaryFlights_GroupByAircraftType_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.AircraftType;
            const string expectedSql = $@"SELECT DISTINCT ac.aircraft_type as name, count FROM (SELECT ptu.aircraft_type_id AS id,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization AS ptu
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}PORTFOLIO_AIRCRAFT WHERE portfolio_id = :portfolioId)
{last7daysClause}
GROUP BY(ptu.aircraft_type_id) LIMIT 1000) AS rawdata
INNER JOIN ""aircraft_configurations_latest"" AS ac ON ac.aircraft_type_id = id ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }
        [Fact]
        public async Task SummaryFlights_GroupByMarketClass_CallDbWithExpectedQuery()
        {
            // arrange
            const int portfolioId = 1;
            string calledQuery = string.Empty;
            var searchParams = new AssetWatchSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days
            };

            const AssetWatchGroupingOption assetWatchGroupingOption = AssetWatchGroupingOption.MarketClass;
            const string expectedSql = $@"SELECT DISTINCT  name, count FROM (SELECT ac.aircraft_market_class AS name,
COUNT(1) AS count
FROM {Constants.RiskAnalyticsTablePrefix}portfolio_tracked_utilization as ptu
INNER JOIN ""aircraft_all_history_latest"" AS aah ON aah.aircraft_id = ptu.aircraft_id
INNER JOIN ""aircraft_configurations_latest"" AS ac ON ac.aircraft_configuration_id = aah.aircraft_configuration_id
WHERE ptu.aircraft_id
IN (SELECT aircraft_id FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft WHERE portfolio_id=:portfolioId)
{last7daysClause}
GROUP BY(ac.aircraft_market_class) LIMIT 1000) AS rawdata
ORDER BY count DESC";

            snowflakeRepositoryMock
            .When(t => t.Query<IdNameCountModel>(Arg.Any<string>(), Arg.Any<object>()))
            .Do(p =>
            calledQuery = p.Args().First() as string);

            // act
            await trackedUtilizationRepository.SummaryFlights(portfolioId, searchParams, assetWatchGroupingOption);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

    }
}
