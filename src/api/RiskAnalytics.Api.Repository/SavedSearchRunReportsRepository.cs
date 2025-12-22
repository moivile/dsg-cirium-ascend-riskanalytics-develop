using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository;

public class SavedSearchRunReportsRepository : ISavedSearchRunReportsRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;

    public SavedSearchRunReportsRepository(ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public async Task Save(SavedSearchRunReport report)
    {
        var dateUpdated = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, DateTime.UtcNow.Hour, DateTime.UtcNow.Minute, 0);

        var portfolioParameters = new
        {
            SavedSearchId = report.SavedSearchId,
            RunId = report.RunId,
            AircraftId = report.AircraftId,
            MSN = report.MSN,
            CriteriaName = report.CriteriaName,
            CriteriaValue = report.CriteriaValue,
            dateUpdated
        };

        var sql = @$"
                INSERT INTO {Constants.EmailAlertingTablePrefix}saved_search_run_reports(saved_search_id, run_id, aircraft_id, msn, criteria_name, criteria_value, date_created)
                VALUES(:SavedSearchId, :RunId, :AircraftId, :MSN, :CriteriaName, :CriteriaValue, :dateUpdated)";

        await snowflakeRepository.ExecuteScalar<int>(sql, portfolioParameters);
    }

    public async Task<IEnumerable<SavedSearchRunReport>> GetTheLatestRunResults()
    {
        var sql = @$"SELECT *
                FROM {Constants.EmailAlertingTablePrefix}saved_search_run_reports
                ORDER BY date_created DESC LIMIT 1";

        var savedSearchRunReport = (await snowflakeRepository.Query<SavedSearchRunReport>(sql)).SingleOrDefault();

        if (savedSearchRunReport == null)
        {
            return Enumerable.Empty<SavedSearchRunReport>();
        }

        var parameters = new
        {
            RunId = savedSearchRunReport.RunId
        };

        return await snowflakeRepository.Query<SavedSearchRunReport>(
            @$"SELECT *
                FROM {Constants.EmailAlertingTablePrefix}saved_search_run_reports
                WHERE run_id=:RunId", parameters);
    }

}