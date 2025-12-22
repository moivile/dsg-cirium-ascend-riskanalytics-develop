namespace RiskAnalytics.Authorization.Auth0MachineToMachine
{
    public interface IAuth0MachineToMachineClient
    {
        Task<string> GetAuth0AccessToken();
    }
}
