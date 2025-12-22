using RiskAnalytics.Api.Repository.Entities;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Repository;

public class AircraftRepository : IAircraftRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;

    public AircraftRepository(
        ISnowflakeRepository snowflakeRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
    }

    public async Task<Aircraft?> Get(int id)
    {
        var parameters = new { id };

        var sql = @$"SELECT * FROM {Constants.RiskAnalyticsTablePrefix}aircraft WHERE aircraft_id = :id";

        return (await snowflakeRepository.Query<Aircraft>(sql, parameters)).FirstOrDefault();
    }

}
