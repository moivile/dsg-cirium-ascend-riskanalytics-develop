using NSubstitute;
using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository.Tests;

public class SavedSearchRunReportsRepositoryTests
{
    private ISavedSearchRunReportsRepository repository;
    private readonly ISnowflakeRepository snowflakeRepositoryMock;

    public SavedSearchRunReportsRepositoryTests()
    {
        snowflakeRepositoryMock = Substitute.For<ISnowflakeRepository>();
        repository = new SavedSearchRunReportsRepository(snowflakeRepositoryMock);
    }

    [Fact]
    public async Task GetTheLatestRunResults_ExecutesTwoDbCalls()
    {
        // arrange
        var parameters = new
        {
            RunId = Guid.NewGuid()
        };

        var firstExpectedSql = @$"SELECT *
                FROM {Constants.EmailAlertingTablePrefix}saved_search_run_reports
                ORDER BY date_created DESC LIMIT 1";

        var secondExpectedSql = @$"SELECT *
                FROM {Constants.EmailAlertingTablePrefix}saved_search_run_reports
                WHERE run_id=:RunId";

        snowflakeRepositoryMock.Query<SavedSearchRunReport>(Arg.Any<string>())
            .Returns(new List<SavedSearchRunReport> { new SavedSearchRunReport{
            Id=1}
            });

        // act
        await repository.GetTheLatestRunResults();

        //assert
        Received.InOrder(() =>
        {
            snowflakeRepositoryMock.Received(1).Query<SavedSearchRunReport>(
        Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(firstExpectedSql, actualSql)));
            snowflakeRepositoryMock.Received(1).Query<SavedSearchRunReport>(
        Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(secondExpectedSql, actualSql)), Arg.Any<object>());
        });
    }

    [Fact]
    public async Task Save_ExecutesQueryWithExpectedSql()
    {
        // arrange
        var savedSearchObject = new SavedSearchRunReport();
        // act
        await repository.Save(savedSearchObject);

        // assert
        var expectedSql = @$"
                INSERT INTO {Constants.EmailAlertingTablePrefix}saved_search_run_reports(saved_search_id, run_id, aircraft_id, msn, criteria_name, criteria_value, date_created)
                VALUES(:SavedSearchId, :RunId, :AircraftId, :MSN, :CriteriaName, :CriteriaValue, :dateUpdated)";

        await snowflakeRepositoryMock.Received().ExecuteScalar<int>(
                Arg.Is<string>(actualSql => QueryTestHelpers.IsQueryValid(expectedSql, actualSql)),
                Arg.Any<object?>());
    }
}
