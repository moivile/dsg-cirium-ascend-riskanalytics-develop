using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Reflection;

namespace RiskAnalytics.Api.Services;

public class VersionHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default(CancellationToken))
    {
        var assembly = Assembly.GetEntryAssembly();

        if(assembly == null)
        {
            return Task.Run(() => HealthCheckResult.Unhealthy());
        }

        var assemblyInformationalVersionAttribute = assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>();

        if (assemblyInformationalVersionAttribute == null)
        {
            return Task.Run(() => HealthCheckResult.Unhealthy());
        }

        var version = assemblyInformationalVersionAttribute.InformationalVersion;

        return Task.Run(() => HealthCheckResult.Healthy(description: version));
    }
}
