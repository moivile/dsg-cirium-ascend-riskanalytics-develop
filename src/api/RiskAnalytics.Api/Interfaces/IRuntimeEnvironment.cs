namespace RiskAnalytics.Api.Interfaces;

public interface IRuntimeEnvironment
{
    string EnvironmentName { get; }
    bool IsLocalDevelopment { get; }
}