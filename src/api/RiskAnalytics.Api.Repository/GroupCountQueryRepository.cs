using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Repository.QueryBuilders.Utilization.Interfaces;

namespace RiskAnalytics.Api.Repository;

public class GroupCountQueryRepository : IGroupCountQueryRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;
    private readonly IGetGroupCountQueryBuilder groupCountQueryBuilder;

    public GroupCountQueryRepository(
        ISnowflakeRepository snowflakeRepository,
        IGetGroupCountQueryBuilder groupCountQueryBuilder)
    {
        this.snowflakeRepository = snowflakeRepository;
        this.groupCountQueryBuilder = groupCountQueryBuilder;
    }

    public async Task<IEnumerable<MonthlyUtilizationGroupCount>> GetGroupCounts(
        int? portfolioId,
        MonthlyUtilizationGroup? groupBy,
        IEnumerable<int>? groupByFilterIds,
        int? operatorId,
        int? lessorId,
        bool includeBaseline
        )
    {
        var parameters = new
        {
            portfolioId = portfolioId,
            groupByFilterIds = groupByFilterIds != null ? string.Join(",", groupByFilterIds) : null,
            operatorId = operatorId,
            lessorId = lessorId
        };
        var query = groupCountQueryBuilder.BuildQuery(groupBy, includeBaseline);

        return await snowflakeRepository.Query<MonthlyUtilizationGroupCount>(query, parameters);
    }
}
