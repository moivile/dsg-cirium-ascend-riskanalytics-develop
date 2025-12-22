using Microsoft.Extensions.Diagnostics.HealthChecks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RiskAnalytics.Api.Repository;

namespace RiskAnalytics.Api.Services
{
    public static class RiskAnalyticsHealthCheck
    {
        public static void ConfigureHealthCheck(IServiceCollection services, RepositoryConfiguration repositoryConfiguration)
        {
            // Configure the individual health checks here
            services
                .AddHealthChecks()
                .AddCheck(
                    "Snowflake_connection",
                    new FuncHealthCheck(async () => await CheckSnowflakeHealth(repositoryConfiguration)),
                    failureStatus: HealthStatus.Unhealthy,
                    timeout: TimeSpan.FromSeconds(3),
                    tags: new[] { "dotnet", "snowflake", "riskanalytics" }
                )
                .AddCheck(
                    name: "version",
                    new VersionHealthCheck(),
                    failureStatus: HealthStatus.Unhealthy,
                    timeout: TimeSpan.FromSeconds(3),
                    tags: new[] { "dotnet", "assemblyVersion" }
                );
        }

        private static async Task<HealthCheckResult> CheckSnowflakeHealth(RepositoryConfiguration repositoryConfiguration)
        {
            try
            {
                using var repository = new SnowflakeRepository(repositoryConfiguration);
                var result = await repository.ExecuteScalar<string>("SELECT 'Snowflake connection health check'");

                if (result == "Snowflake connection health check")
                {
                    return HealthCheckResult.Healthy("Snowflake connection is healthy.");
                }

                return HealthCheckResult.Unhealthy("Unexpected result from Snowflake connection health check.");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy("Snowflake connection is unhealthy.", ex);
            }
        }

        public static Task WriteResponse(HttpContext context, HealthReport result)
        {
            context.Response.ContentType = "application/json";

            var json = new JObject(
                new JProperty("status", result.Status.ToString()),
                new JProperty("results", new JObject(result.Entries.Select(pair =>
                    new JProperty(pair.Key, new JObject(
                        new JProperty("status", pair.Value.Status.ToString()),
                        new JProperty("tags", pair.Value.Tags),
                        new JProperty("description", pair.Value.Description)
                    ))
                )))
            );

            return context.Response.WriteAsync(json.ToString(Formatting.Indented));
        }
    }

    internal class FuncHealthCheck : IHealthCheck
    {
        private readonly Func<Task<HealthCheckResult>> _check;

        public FuncHealthCheck(Func<Task<HealthCheckResult>> check)
        {
            _check = check;
        }

        public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            return _check();
        }
    }
}
