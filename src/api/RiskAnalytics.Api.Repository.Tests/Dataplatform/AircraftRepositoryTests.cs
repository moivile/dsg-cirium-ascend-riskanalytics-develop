using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using NSubstitute;

namespace RiskAnalytics.Api.Repository.Tests.Dataplatform;

public class AircraftRepositoryTests
{
    private readonly Repository.Dataplatform.Interfaces.IAircraftRepository aircraftRepository;
    private readonly ISnowflakeRepository snowflakeRepositoryMock;
    private readonly string searchQueryTemplate;

    public AircraftRepositoryTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        var aircraftsMapperMock = Substitute.For<IAircraftsMapper>();
        aircraftRepository = new Repository.Dataplatform.AircraftRepository(snowflakeRepositoryMock, aircraftsMapperMock);

        searchQueryTemplate = @$"SELECT
                            aircraft.aircraft_id,
                            aircraft.aircraft_age_years,
                            aircraft.aircraft_serial_number,
                            aircraft_usage_history.aircraft_usage,
                            aircraft_all_history.aircraft_history_id,
                            aircraft_all_history.aircraft_registration_number,
                            aircraft_all_history.manager,
                            aircraft_all_history.manager_organization_id,
                            aircraft_all_history.operator,
                            aircraft_all_history.operator_organization_id,
                            aircraft_all_history.owner,
                            aircraft_all_history.owner_organization_id,
                            operator.country AS Operator_Country,
                            operator.country_id AS Operator_Country_Id,
                            company.organization_sub_type as company_type,
                            company.organization_sub_type_id as company_type_id,
                            lessor.organization as lessor_organization,
                            lessor.organization_id as lessor_organization_id,
                            aircraft_all_history.is_current,
                            REPLACE(aircraft_status_history.status, 'Letter of Intent', 'LOI' ) as status,
                            aircraft_status_history.status_id,
                            (SELECT MIN(status_start_date) FROM ""aircraft_status_history_latest"" WHERE aircraft_id = aircraft.aircraft_id AND status_id = {(int)AircraftStatus.InService}) status_start_date,
                            aircraft_configurations.aircraft_series,
                            aircraft_configurations.aircraft_series_id,
                            aircraft_configurations.aircraft_market_class_id,
                            aircraft_configurations.aircraft_market_class,
                            aircraft_configurations.aircraft_manufacturer,
                            aircraft_configurations.aircraft_manufacturer_organization_id,
                            aircraft_configurations.aircraft_type,
                            aircraft_configurations.aircraft_type_id,
                            aircraft_configurations.aircraft_family,
                            aircraft_configurations.aircraft_family_id,
                            aircraft_configurations.aircraft_master_series,
                            aircraft_configurations.aircraft_master_series_id,
                            aircraft_configurations.engine_series
                        FROM ""aircraft_latest"" as aircraft
                        JOIN ""aircraft_all_history_latest"" as aircraft_all_history  ON aircraft_all_history.aircraft_id = aircraft.aircraft_id
                        LEFT JOIN ""organizations_latest"" operator ON aircraft_all_history.operator_organization_id = operator.organization_id                        
                        JOIN ""aircraft_configurations_latest"" as aircraft_configurations ON aircraft_all_history.aircraft_configuration_id = aircraft_configurations.aircraft_configuration_id
                        JOIN ""aircraft_status_history_latest"" as aircraft_status_history ON aircraft.aircraft_id = aircraft_status_history.aircraft_id AND aircraft_status_history.is_current = true
                        LEFT JOIN ""aircraft_usage_history_latest"" as aircraft_usage_history ON aircraft_usage_history.aircraft_id = aircraft.aircraft_id AND aircraft_usage_history.is_current = true
                        JOIN {Constants.RiskAnalyticsTablePrefix}aircraft as RI_aircraft ON RI_aircraft.aircraft_id = aircraft.aircraft_id
                        LEFT JOIN ""organizations_latest"" as lessor ON lessor.organization_id = aircraft_all_history.manager_organization_id AND lessor.organization_sub_type_id={(int)OrganizationSubType.OperatingLessor}
                        LEFT JOIN ""organizations_latest"" as company ON company.organization_id = aircraft_all_history.owner_organization_id AND company.organization_sub_type_id IN ({(int)OrganizationSubType.AssetBackedSecurities},{(int)OrganizationSubType.EETC})";
    }

    [Fact]
    public void Search_NoFilterParams_CallDbWithNoWhereClause()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                         ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters();

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>())
            ;
    }

    [Fact]
    public void Search_WithKeywordParameterWithCapitalF_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE ({Constants.RiskAnalyticsTablePrefix}aircraft.keywords LIKE @keyword)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            Keyword = "Airbus"
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>())
            ;
    }

    [Fact]
    public void Search_WithKeywordParameterWithCapitalFAndManufacturerId_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE ({Constants.RiskAnalyticsTablePrefix}aircraft.keywords LIKE @keyword) AND  aircraft_manufacturer_organization_id in (2,3)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            Keyword = "Airbus",
            ManufacturerIds = new List<int> { 2, 3 }
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>())
            ;
    }

    [Fact]
    public void Search_WithManufacturerIdParameter_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE  aircraft_manufacturer_organization_id in (1,2)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            ManufacturerIds = new List<int> { 1, 2 }
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Received().Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>());
    }

    [Fact]
    public void Search_WithAircraftTypeIdParameter_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE  aircraft_configurations.aircraft_type_id in (1,2)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            AircraftTypeIds = new List<int> { 1, 2 }
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Received().Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>());
    }

    [Fact]
    public void Search_WithAircraftSeriesIdParameter_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE  aircraft_configurations.aircraft_master_series_id in (1,2)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            AircraftMasterSeriesIds = new List<int> { 1, 2 }
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Received().Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>());
    }

    [Fact]
    public void Search_WithLessorIdParameter_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE  lessor.organization_id in (1,2)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            LessorIds = new List<int> { 1, 2 }
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Received().Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>());
    }

    [Fact]
    public void Search_WithCompanyTypeIdParameter_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE  company.organization_sub_type_id IN (1,2)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            CompanyTypeIds = new List<int> { 1, 2 }
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Received().Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>());
    }

    [Fact]
    public void Search_WithOperatorOrganizationIdParameter_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE  operator_organization_id in (1,2)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            AircraftOperatorIds = new List<int> { 1, 2 }
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Received().Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>());
    }

    [Fact]
    public void Search_WithOperatorCountryParameter_CallDbWithExpectedWhereConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                        WHERE  operator_country_id in (1,2)  ORDER BY aircraft_id LIMIT 200 OFFSET 0";

        var request = new SearchAircraftParameters
        {
            OperatorCountryIds = new List<int> { 1, 2 }
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Received().Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>());
    }

    [Fact]
    public void Search_WithSkipTakeParameters_CallDbWithExpectedOffsetConditions()
    {
        // Arrange
        var expectedSql = @$"{searchQueryTemplate}
                         ORDER BY aircraft_id LIMIT 10 OFFSET 20";

        var request = new SearchAircraftParameters
        {
            Take = 10,
            Skip = 20
        };

        // Act
        aircraftRepository.Search(request);

        // Assert
        snowflakeRepositoryMock.Received().Query(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<Func<Aircraft, AircraftHistory, AircraftStatusHistory, AircraftConfiguration, Aircraft>>(),
                Arg.Any<string>(),
                Arg.Any<object>());
    }
}
