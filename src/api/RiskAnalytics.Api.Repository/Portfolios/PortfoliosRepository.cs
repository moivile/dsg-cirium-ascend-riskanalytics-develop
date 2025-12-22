using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Mappers.Interfaces;
using System.Transactions;

namespace RiskAnalytics.Api.Repository;

public class PortfoliosRepository : IPortfoliosRepository
{
    private readonly ISnowflakeRepository snowflakeRepository;
    private readonly IPortfoliosMapper portfoliosMapper;
    private readonly IPortfolioAircraftRepository portfolioAircraftRepository;

    public PortfoliosRepository(
        ISnowflakeRepository snowflakeRepository,
        IPortfoliosMapper portfoliosMapper,
        IPortfolioAircraftRepository portfolioAircraftRepository)
    {
        this.snowflakeRepository = snowflakeRepository;
        this.portfoliosMapper = portfoliosMapper;
        this.portfolioAircraftRepository = portfolioAircraftRepository;
    }

    public async Task<IEnumerable<Portfolio>> GetAll(string userId)
    {
        var parameters = new { userId };

        return await snowflakeRepository.Query<Portfolio>(
            $@"SELECT
                    portfolios.id,
                    portfolios.name,
                    portfolios.user_id,
                    portfolios.date_created,
                    portfolios.date_modified,
					count(portfolio_aircraft.id) as number_of_aircraft
                FROM {Constants.RiskAnalyticsTablePrefix}portfolios as portfolios
                LEFT JOIN {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft as portfolio_aircraft ON portfolios.id = portfolio_aircraft.portfolio_id
				WHERE portfolios.user_id = :userId
				GROUP BY portfolios.id,
                    portfolios.name,
                    portfolios.user_id,
                    portfolios.date_created,
                    portfolios.date_modified
				ORDER BY portfolios.name", parameters);
    }

    public async Task<Portfolio?> Get(int id, bool isServiceUser = false)
    {
        var parameters = new { id };

        var sql = $@"
                SELECT
                    portfolios.id,
                    portfolios.name,
                    portfolios.user_id,
                    portfolios.date_created,
                    portfolios.date_modified,
                    portfolio_aircraft.id,
                    portfolio_aircraft.portfolio_id,
                    portfolio_aircraft.aircraft_id,
                    portfolio_aircraft.date_created
                FROM {Constants.RiskAnalyticsTablePrefix}portfolios as portfolios
                LEFT JOIN {Constants.RiskAnalyticsTablePrefix}portfolio_aircraft as portfolio_aircraft ON portfolios.id = portfolio_aircraft.portfolio_id
                WHERE portfolios.id = :id";

        var existingPortfolios = new Dictionary<int, Portfolio>();

        return (await snowflakeRepository.Query(
            sql,
            new Func<Portfolio, PortfolioAircraft, Portfolio>((portfolio, portfolioAircraft)
                => portfoliosMapper.Map(existingPortfolios, portfolio, portfolioAircraft)),
            "id, id",
            parameters,
            isServiceUser
        )).Distinct().SingleOrDefault();
    }

    public async Task Delete(int id, string userId)
    {
        var parameters = new { id, userId };
        var dateDeleted = DateTime.UtcNow;

        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
        await snowflakeRepository.Query<Portfolio>($@"
            DELETE
            FROM {Constants.RiskAnalyticsTablePrefix}portfolios
            WHERE id = :id AND user_id = :userId", parameters);

        var savedSearchParameters = new { id, userId, dateDeleted };
        var sql = @$"UPDATE {Constants.EmailAlertingTablePrefix}saved_searches SET date_deleted=:dateDeleted WHERE portfolio_id=:id AND user_id = :userId";

        await snowflakeRepository.Execute(sql, savedSearchParameters);
        scope.Complete();
    }

    public async Task<bool> IsNameUnique(string name, string userId)
    {
        var parameters = new { name, userId };

        var sql = $@"
                SELECT
                    COUNT(portfolios.id)
                FROM {Constants.RiskAnalyticsTablePrefix}portfolios AS portfolios
                WHERE portfolios.name = :name AND user_id = :userId";

        var portfoliosWithTheName = await snowflakeRepository.ExecuteScalar<int>(sql, parameters);

        return portfoliosWithTheName == 0;
    }

    public async Task<int> Create(Portfolio portfolio)
    {
        var dateUpdated = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
        var dateCreated = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

        var portfolioParameters = new
        {
            Name = portfolio.Name,
            UserId = portfolio.UserId,
            DateCreated = dateCreated,
            DateUpdated = dateUpdated
        };

        var sql = $@"
            INSERT INTO {Constants.RiskAnalyticsTablePrefix}portfolios(name, user_id, date_created, date_modified)
            VALUES(:Name, :UserId, :DateCreated, :DateUpdated)";

        await snowflakeRepository.Execute(sql, portfolioParameters);

        var getIdSql = $"SELECT id FROM {Constants.RiskAnalyticsTablePrefix}portfolios WHERE user_id = :UserId AND name = :Name AND date_created = :DateCreated LIMIT 1";

        var portfolioId = await snowflakeRepository.ExecuteScalar<int>(getIdSql, new { UserId = portfolio.UserId , Name = portfolio.Name, DateCreated = dateCreated });

        if (!portfolio.Aircraft.Any()) return portfolioId;

        await portfolioAircraftRepository.Insert(portfolioId, portfolio.Aircraft.Select(i => i.Aircraft).ToList());

        return portfolioId;
    }


    public async Task Update(Portfolio portfolio)
    {
        var dateUpdated = DateTime.UtcNow;

        var portfolioParameters = new
        {
            portfolio.Id,
            portfolio.Name,
            dateUpdated
        };

        var sql = $"UPDATE {Constants.RiskAnalyticsTablePrefix}portfolios as portfolios SET name=:Name,date_modified=:dateUpdated WHERE portfolios.id=:Id";

        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
        await snowflakeRepository.Execute(sql, portfolioParameters);

        await portfolioAircraftRepository.DeleteAll(portfolio.Id);

        if (portfolio.Aircraft.Any())
        {
            await portfolioAircraftRepository.Insert(portfolio.Id, portfolio.Aircraft.Select(i => i.Aircraft).ToList());
        }

        scope.Complete();
    }
}
