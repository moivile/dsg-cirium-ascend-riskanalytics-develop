using NSubstitute;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.AssetWatch;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests.AssetWatch
{
    public class AssetWatchGridSearchPeriodTests
    {
        private readonly IAssetWatchTableRepository assetWatchRepository;
        private readonly ISnowflakeRepository snowflakeRepositoryMock;
        const string assetWatchTableDataQuery_1 = @$"SELECT
            flights.aircraft_id AS aircraftid,
            COUNT(*) AS numberofflights,
            SUM(flights.tracked_air_minutes) AS totalFlightMinutes,

            COALESCE(SUM(IFNULL(flights.ground_event_duration_minutes, 0)), 0) AS totalgroundstayhours,
            LISTAGG('[' || flights.ground_event_model_label_id || ']', ', ') WITHIN GROUP (ORDER BY flights.ground_event_model_label_id) AS maintenanceActivity,
            SUM(CASE
            WHEN :MinIndividualGroundStay = 0 AND :MaxIndividualGroundStay > 0 THEN
                CASE
                    WHEN flights.ground_event_duration_minutes <= :MaxIndividualGroundStay * 60 THEN 1
                    ELSE 0
                END
            WHEN :MaxIndividualGroundStay = 0 AND :MinIndividualGroundStay > 0 THEN
                CASE
                    WHEN flights.ground_event_duration_minutes >= :MinIndividualGroundStay * 60 THEN 1
                    ELSE 0
                END
            WHEN :MaxIndividualGroundStay > 0 AND :MinIndividualGroundStay > 0 THEN
                CASE
                    WHEN flights.ground_event_duration_minutes BETWEEN :MinIndividualGroundStay * 60 AND :MaxIndividualGroundStay * 60 THEN 1
                    ELSE 0
                END
            ELSE 0
            END) AS timesBetweenMinMaxIndGroundStay
            FROM
            RI_portfolio_tracked_utilization flights
        WHERE flights.aircraft_id IN (SELECT aircraft_id FROM RI_portfolio_aircraft WHERE portfolio_id=:portfolioId)";

        const string assetWatchTableDataQuery_2 = @$"
        GROUP BY
            flights.aircraft_id";

        public AssetWatchGridSearchPeriodTests()
        {
            snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
            assetWatchRepository = new AssetWatchTableRepository(snowflakeRepositoryMock);
        }

        [Fact]
        public async Task GetTableData_With7DaysSearch_CallDbWithExpectedQuery()
        {
            string calledQuery = string.Empty;
            var portfolioId = 11;
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 0,
                MinTotalGroundStay = 0
            };

            const string assetWatchDefaultWhereClause = @$" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '7 day')  OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '7 day')  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '7 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL))) ";
            var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
            const string expectedSql = assetWatchTableDataQuery_1 + assetWatchDefaultWhereClause + assetWatchTableDataQuery_2;
            snowflakeRepositoryMock
                .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetTableData_With_Yesterday_Search_CallDbWithExpectedQuery()
        {
            string calledQuery = string.Empty;
            var portfolioId = 11;
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                Period = AssetWatchSearchPeriod.Yesterday,
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 0,
                MinTotalGroundStay = 0
            };

            const string assetWatchDefaultWhereClause = @$" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '1 day')  OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '1 day')  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '1 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL))) ";
            var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
            const string expectedSql = assetWatchTableDataQuery_1 + assetWatchDefaultWhereClause + assetWatchTableDataQuery_2;
            snowflakeRepositoryMock
                .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetTableData_With_1Month_Search_CallDbWithExpectedQuery()
        {
            string calledQuery = string.Empty;
            var portfolioId = 11;
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last1Month,
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 0,
                MinTotalGroundStay = 0
            };

            const string assetWatchDefaultWhereClause = @$"  AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '1 month')  OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '1 month')  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '1 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL))) ";
            var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
            const string expectedSql = assetWatchTableDataQuery_1 + assetWatchDefaultWhereClause + assetWatchTableDataQuery_2;
            snowflakeRepositoryMock
                .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetTableData_With_3Months_Search_CallDbWithExpectedQuery()
        {
            string calledQuery = string.Empty;
            var portfolioId = 11;
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last3Months,
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 0,
                MinTotalGroundStay = 0
            };

            const string assetWatchDefaultWhereClause = @$" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '3 month')  OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '3 month')  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '3 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL))) ";
            var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
            const string expectedSql = assetWatchTableDataQuery_1 + assetWatchDefaultWhereClause + assetWatchTableDataQuery_2;
            snowflakeRepositoryMock
                .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                    calledQuery = p.Args().First() as string);

            // act
            await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetTableData_With_6Months_Search_CallDbWithExpectedQuery()
        {
            string calledQuery = string.Empty;
            var portfolioId = 11;
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last6Months,
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 0,
                MinTotalGroundStay = 0
            };

            const string assetWatchDefaultWhereClause = @$" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '6 month')  OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '6 month')  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '6 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL))) ";
            var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
            const string expectedSql = assetWatchTableDataQuery_1 + assetWatchDefaultWhereClause + assetWatchTableDataQuery_2;
            snowflakeRepositoryMock
                .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetTableData_With_12Months_Search_CallDbWithExpectedQuery()
        {
            string calledQuery = string.Empty;
            var portfolioId = 11;
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last12Months,
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 0,
                MinTotalGroundStay = 0
            };
            var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
            var twelveMonthsQueryPart = "AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '12 month') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '12 month')  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '12 month') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL)))";

            var expectedSql = assetWatchTableDataQuery_1 + twelveMonthsQueryPart + assetWatchTableDataQuery_2;

            snowflakeRepositoryMock
                .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetTableData_With_SelectDateRange_Search_CallDbWithExpectedQuery()
        {
            string calledQuery = string.Empty;
            var portfolioId = 11;
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                Period = AssetWatchSearchPeriod.SelectDateRange,
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 0,
                MinTotalGroundStay = 0,
                DateFrom = new DateTime(2023, 8, 8),
                DateTo = new DateTime(2023, 9, 9),
            };
            const string assetWatchDefaultWhereClause = "AND ((tracked_runway_departure_time_utc >='2023-08-08'::date AND tracked_runway_departure_time_utc <'2023-09-10'::date) OR (tracked_runway_departure_time_utc <'2023-08-08'::date AND tracked_runway_arrival_time_utc >='2023-08-08'::date))";
            var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
            const string expectedSql = assetWatchTableDataQuery_1 + assetWatchDefaultWhereClause + assetWatchTableDataQuery_2;
            snowflakeRepositoryMock
                .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetTableData_WithFilterCountrySpecified_CallDbWithExpectedQuery()
        {
            string calledQuery = string.Empty;
            var portfolioId = 11;
            var filterCriteria = new AssetWatchTableSearchParameters
            {
                Period = AssetWatchSearchPeriod.Last7Days,
                MinNoOfFlights = 5,
                MinIndividualGroundStay = 0,
                MinTotalGroundStay = 0,
                CountryCodes = new List<string> { "5", "6" }
            };

            const string assetWatchDefaultWhereClause = @$" AND (tracked_runway_departure_time_utc >=(CURRENT_DATE - interval '7 day') OR (tracked_runway_departure_time_utc <(CURRENT_DATE - interval '7 day')  AND ((tracked_runway_arrival_time_utc >=(CURRENT_DATE - interval '7 day') AND tracked_runway_arrival_time_utc <CURRENT_DATE) OR tracked_runway_arrival_time_utc IS NULL))) AND flights.tracked_arrival_country_code_iata IN ('5','6') ";
            var parameters = new { filterCriteria.MinIndividualGroundStay, filterCriteria.MinTotalGroundStay, filterCriteria.MinNoOfFlights, portfolioId };
            const string expectedSql = assetWatchTableDataQuery_1 + assetWatchDefaultWhereClause + assetWatchTableDataQuery_2;
            snowflakeRepositoryMock
                .When(t => t.Query<AssetWatchListDataGridModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchRepository.GetTrackedUtilizationData(portfolioId, filterCriteria);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }


    }
}
