namespace RiskAnalytics.Api.Repository.Interfaces
{
    public interface ISnowflakeRepository
    {
        Task<IEnumerable<T>> Query<T>(string query, object? parameters = null, bool isServiceUser = false);

        Task<T> ExecuteScalar<T>(string query, object? parameters = null);
        Task Execute(string query, object parameters, bool isServiceUser = false);

        Task<IEnumerable<TReturn>> Query<TFirst, TSecond, TReturn>(string sql, Func<TFirst, TSecond, TReturn> map, string splitOn, object? parameters = null, bool isServiceUser = false);

        Task<IEnumerable<TReturn>> Query<TFirst, TSecond, TThird, TReturn>(string sql, Func<TFirst, TSecond, TThird, TReturn> map, string splitOn, object? parameters = null, bool isServiceUser = false);

        Task<IEnumerable<TReturn>> Query<TFirst, TSecond, TThird, TFourth, TReturn>(string sql, Func<TFirst, TSecond, TThird, TFourth, TReturn> map, string splitOn, object? parameters = null, bool isServiceUser = false);

        Task<IEnumerable<TReturn>> Query<TFirst, TSecond, TThird, TFourth, TFifth, TReturn>(string sql, Func<TFirst, TSecond, TThird, TFourth, TFifth, TReturn> map, string splitOn, object? parameters = null, bool isServiceUser = false);

    }
}
