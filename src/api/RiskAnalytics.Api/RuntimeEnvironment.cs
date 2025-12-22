using RiskAnalytics.Api.Interfaces;

namespace RiskAnalytics.Api;

public class RuntimeEnvironment : IRuntimeEnvironment
{
    private const string LocalDevelopmentEnvironmentName = "local";

    public string EnvironmentName => Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? LocalDevelopmentEnvironmentName;

    public bool IsLocalDevelopment => EnvironmentName.Equals(LocalDevelopmentEnvironmentName, StringComparison.OrdinalIgnoreCase);
}
