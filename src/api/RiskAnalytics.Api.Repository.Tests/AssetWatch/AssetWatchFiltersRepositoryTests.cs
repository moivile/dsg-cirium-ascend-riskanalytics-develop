using NSubstitute;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;


namespace RiskAnalytics.Api.Repository.Tests.AssetWatch
{
    public class AssetWatchFiltersRepositoryTests
    {
        private readonly IAssetWatchFiltersRepository assetWatchFiltersRepository;
        private readonly ISnowflakeRepository snowflakeRepositoryMock;

        public AssetWatchFiltersRepositoryTests()
        {
            snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
            assetWatchFiltersRepository = new AssetWatchFiltersRepository(snowflakeRepositoryMock);
        }

        [Fact]
        public async Task GetAssetWatchFilterOperators_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            const int portfolioId = 1;
            const string expectedSql = $@"SELECT DISTINCT aah.operator AS Name,
                aah.operator_organization_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah ON pa.aircraft_id = aah.aircraft_id
                WHERE aah.operator IS NOT NULL
                AND portfolio_id =:portfolioId
                ORDER BY Name";

            snowflakeRepositoryMock
                .When(t => t.Query<IdNamePairModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchFiltersRepository.GetAssetWatchFilterOperators(portfolioId);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetAssetWatchFilterAircraftSeries_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            const int portfolioId = 1;
            const string expectedSql = $@"SELECT DISTINCT ac.aircraft_series AS Name,
                ac.aircraft_series_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah on pa.aircraft_id = aah.aircraft_id
                JOIN ""aircraft_configurations_latest"" AS ac on aah.aircraft_configuration_id = ac.aircraft_configuration_id
                WHERE ac.aircraft_series IS NOT NULL
                AND portfolio_id =:portfolioId
                ORDER BY Name";

            snowflakeRepositoryMock
                .When(t => t.Query<IdNamePairModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchFiltersRepository.GetAssetWatchFilterAircraftSeries(portfolioId);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetAssetWatchFilterEngineSeries_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            const string expectedSql = $@"SELECT DISTINCT es.name AS Name,
                es.engine_series_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah on pa.aircraft_id = aah.aircraft_id
                JOIN ""aircraft_configurations_latest"" AS ac on aah.aircraft_configuration_id = ac.aircraft_configuration_id
                JOIN {Constants.RiskAnalyticsTablePrefix}engine_series AS es on es.name = ac.engine_series
                WHERE portfolio_id =:portfolioId
                ORDER BY Name";

            snowflakeRepositoryMock
                .When(t => t.Query<IdNamePairModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchFiltersRepository.GetAssetWatchFilterEngineSeries(1);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetRegions_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            const string expectedSql = $@"SELECT region_code AS Id,
                name
                FROM {Constants.RiskAnalyticsTablePrefix}regions
                ORDER BY name";

            snowflakeRepositoryMock
                .When(t => t.Query<StringIdNamePairModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchFiltersRepository.GetRegions();

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetAssetWatchFilterLessors_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            const string expectedSql = $@"SELECT DISTINCT lessor.organization AS Name,
                lessor.organization_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_all_history_latest"" AS aah on pa.aircraft_id = aah.aircraft_id
                LEFT JOIN ""organizations_latest"" AS lessor on lessor.organization_id = aah.manager_organization_id
                AND lessor.organization_sub_type_id = 88
                WHERE lessor.organization IS NOT NULL
                AND portfolio_id =:portfolioId
                ORDER BY Name
";

            snowflakeRepositoryMock
                .When(t => t.Query<IdNamePairModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchFiltersRepository.GetAssetWatchFilterLessors(1);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetAssetWatchFilterAircraftSerialNumbers_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            const int portfolioId = 1;
            const string expectedSql = $@"SELECT DISTINCT CONCAT(a.aircraft_serial_number, ' (', ac.aircraft_master_series, ')') AS Name,
                a.aircraft_id AS Id
                FROM {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft AS pa
                JOIN ""aircraft_latest"" AS a on a.aircraft_id = pa.aircraft_id
                JOIN ""aircraft_all_history_latest"" aah on pa.aircraft_id = aah.aircraft_id
                JOIN ""aircraft_configurations_latest"" AS ac ON aah.aircraft_configuration_id = ac.aircraft_configuration_id
                WHERE ac.aircraft_master_series IS NOT NULL
                AND portfolio_id =:portfolioId
                ORDER BY Name";

            snowflakeRepositoryMock
                .When(t => t.Query<IdNamePairModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);
            // act
            await assetWatchFiltersRepository.GetAssetWatchFilterAircraftSerialNumbers(portfolioId);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetAssetWatchFilterCities_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            var countryCodes = new List<string> { "1",  "2",  "3" };
            const string expectedSql =
            @$"SELECT name AS Id,
                name
               FROM {Constants.RiskAnalyticsTablePrefix}cities WHERE country_code_iata IN (:countryCode0,:countryCode1,:countryCode2) ORDER BY name";

            snowflakeRepositoryMock
                .When(t => t.Query<StringIdNamePairModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchFiltersRepository.GetAssetWatchFilterCities(countryCodes);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetAssetWatchFilterAirports_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            var countryCodes = new List<string> { "1",  "2",  "3" };
            const string expectedSql =
            @$"SELECT airport_fs_internal AS Id,
                CONCAT(' (', airport_fs_internal, ') ',name ) AS name
               FROM {Constants.RiskAnalyticsTablePrefix}airports WHERE country_code_iata IN (:countryCode0,:countryCode1,:countryCode2) ORDER BY name";

            snowflakeRepositoryMock
                .When(t => t.Query<StringIdNamePairModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchFiltersRepository.GetAssetWatchFilterAirports(countryCodes);

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }

        [Fact]
        public async Task GetCountriesAndRegions_CallDbWithExpectedQuery()
        {
            // arrange
            string calledQuery = string.Empty;
            const string expectedSql = $@"
            SELECT
                c.country_code_iata AS Id,
                c.name AS name,
                r.region_code AS RegionCode,
            FROM {Constants.RiskAnalyticsTablePrefix}countries AS c
            JOIN {Constants.RiskAnalyticsTablePrefix}regions AS r ON c.region_code = r.region_code
            ORDER BY c.name";

            snowflakeRepositoryMock
                .When(t => t.Query<CountriesRegionsModel>(Arg.Any<string>(), Arg.Any<object>()))
                .Do(p =>
                calledQuery = p.Args().First() as string);

            // act
            await assetWatchFiltersRepository.GetCountriesAndRegions();

            // assert
            Assert.True(QueryTestHelpers.IsQueryValid(expectedSql, calledQuery));
        }
    }
}
