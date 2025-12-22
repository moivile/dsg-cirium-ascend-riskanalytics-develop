namespace RiskAnalytics.Api.Repository;

public class RepositoryConfiguration
{
    public int SnowflakeCommandTimeout { get; set; } = 300;
    public string Account { get; set; } = null!;

    public string User { get; set; } = null!;

    public string PathToThePrivateKeyFile { get; set; } = null!;

    public string Db { get; set; } = null!;

    public string Schema { get; set; } = null!;

    public string ClientSessionKeepAlive { get; set; } = "true";

    public string Warehouse { get; set; } = null!;

    public bool withoutSchemaAndRole { get; set; } = false;
}
