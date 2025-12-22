using Dapper;
using Snowflake.Data.Client;
using RiskAnalytics.Api.Repository.Interfaces;
using Tomlyn;
using Tomlyn.Model;
using System.Text;

namespace RiskAnalytics.Api.Repository;

public class SnowflakeRepository : ISnowflakeRepository, IDisposable
{
    private static readonly Dictionary<string, string> tomlToNetPropertiesMapper = new Dictionary<string, string>(StringComparer.InvariantCultureIgnoreCase)
    {
        { "DATABASE", "DB" }
    };

    private static readonly string tomlConnectionPath = $"{Environment.GetEnvironmentVariable("SNOWFLAKE_HOME")}/connections.toml";
    private static readonly string localSnowflakeDefaulConnection = Environment.GetEnvironmentVariable("SNOWFLAKE_DEFAULT_CONNECTION_NAME");

    private readonly RepositoryConfiguration configuration;
    private SnowflakeDbConnection connection;

    public SnowflakeRepository(RepositoryConfiguration configuration)
    {
        this.configuration = configuration;
        connection = GetSnowflakeConnection(configuration);
    }

    public async Task<IEnumerable<T>> Query<T>(string query, object parameters, bool isServiceUser = false)
    {
        await using var connection = GetSnowflakeConnection(configuration);

        return await connection.QueryAsync<T>(query, parameters, commandTimeout: configuration.SnowflakeCommandTimeout);
    }

    public async Task<IEnumerable<TReturn>> Query<TFirst, TSecond, TReturn>(string sql, Func<TFirst, TSecond, TReturn> map, string splitOn, object? parameters = null, bool isServiceUser = false)
    {
        await using var connection = GetSnowflakeConnection(configuration);

        return await connection.QueryAsync<TFirst, TSecond, TReturn>(sql, map, parameters, null, true, splitOn, configuration.SnowflakeCommandTimeout);
    }


    /* Implement other query methods in the same way */

    public async Task<T> ExecuteScalar<T>(string query, object? parameters = null)
    {
        await using var connection = GetSnowflakeConnection(configuration);

        return await connection.ExecuteScalarAsync<T>(query, parameters, commandTimeout: configuration.SnowflakeCommandTimeout);
    }

    public async Task Execute(string query, object? parameters = null, bool isServiceUser = false)
    {
        await using var connection = GetSnowflakeConnection(configuration);

        await connection.ExecuteAsync(query, parameters, commandTimeout: configuration.SnowflakeCommandTimeout);
    }

    public async Task<IEnumerable<TReturn>> Query<TFirst, TSecond, TThird, TReturn>(string sql, Func<TFirst, TSecond, TThird, TReturn> map, string splitOn = "Id", object? parameters = null, bool isServiceUser = false)
    {
        await using var connection = GetSnowflakeConnection(configuration);

        return await connection.QueryAsync(sql, map, parameters, splitOn: splitOn, commandTimeout: configuration.SnowflakeCommandTimeout);
    }

    public async Task<IEnumerable<TReturn>> Query<TFirst, TSecond, TThird, TFourth, TReturn>(string sql, Func<TFirst, TSecond, TThird, TFourth, TReturn> map, string splitOn = "Id", object? parameters = null, bool isServiceUser = false)
    {
        await using var connection = GetSnowflakeConnection(configuration);

        return await connection.QueryAsync(sql, map, parameters, splitOn: splitOn, commandTimeout: configuration.SnowflakeCommandTimeout);
    }

    public async Task<IEnumerable<TReturn>> Query<TFirst, TSecond, TThird, TFourth, TFifth, TReturn>(string sql, Func<TFirst, TSecond, TThird, TFourth, TFifth, TReturn> map, string splitOn = "Id", object? parameters = null, bool isServiceUser = false)
    {
        await using var connection = GetSnowflakeConnection(configuration);

        return await connection.QueryAsync(sql, map, parameters, splitOn: splitOn, commandTimeout: configuration.SnowflakeCommandTimeout);
    }

    public static SnowflakeDbConnection GetSnowflakeConnection(RepositoryConfiguration repositoryConfiguration)
    {
        if (Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") == "local")
        {
            var tableToml = GetTomlTableFromConfig(tomlConnectionPath, localSnowflakeDefaulConnection);
            var localConnectionString = GetConnectionStringFromTomlTable(tableToml);
            return new SnowflakeDbConnection(localConnectionString);
        }

        var account = repositoryConfiguration.Account;
        var user = repositoryConfiguration.User;
        var PathToPrivateKeyFile = repositoryConfiguration.PathToThePrivateKeyFile;
        var db = repositoryConfiguration.Db;
        var schema = repositoryConfiguration.Schema;
        var withoutSchemaAndRole = repositoryConfiguration.withoutSchemaAndRole;
        var ClientSessionKeepAlive = repositoryConfiguration.ClientSessionKeepAlive;

        var privateKey = File.ReadAllText(PathToPrivateKeyFile);

        var connectionString = $"ACCOUNT={account};authenticator=snowflake_jwt;USER={user};DB={db};PRIVATE_KEY={privateKey};CLIENT_SESSION_KEEP_ALIVE={ClientSessionKeepAlive};";

        if (!withoutSchemaAndRole)
        {
            connectionString += $";schema={schema}";
        }

        return new SnowflakeDbConnection(connectionString);

    }

    public void Dispose()
    {
        connection?.Dispose();
    }

    private static TomlTable GetTomlTableFromConfig(string tomlPath, string connectionName)
    {
        if (!File.Exists(tomlPath))
        {
            throw new FileNotFoundException($"Snowflake connection configuration file not found at: {tomlPath}");
        }

        var tomlContent = File.ReadAllText(tomlPath);
        var toml = Toml.ToModel(tomlContent);

        var connectionExists = toml.TryGetValue(connectionName, out var connection);

        if (!connectionExists)
        {
            throw new Exception("Specified connection name does not exist in connections.toml");
        }

        var connectionTomlTable = connection as TomlTable;

        return connectionTomlTable;
    }

    private static string GetConnectionStringFromTomlTable(TomlTable connectionToml)
    {
        var connectionStringBuilder = new StringBuilder();
        var privateKeyFileProperty = "private_key_file";
        foreach (var property in connectionToml.Keys)
        {
            var propertyValue = (string)connectionToml[property];
            if (property == privateKeyFileProperty) { propertyValue = propertyValue.Replace("/home/ubuntu/", "/root/");}
            var mappedProperty = tomlToNetPropertiesMapper.TryGetValue(property, out var mapped) ? mapped : property;
            connectionStringBuilder.Append($"{mappedProperty}={propertyValue};");
        }

        return connectionStringBuilder.ToString();
    }

}
