using Mapster;
using RiskAnalytics.Api.Responses;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;

namespace RiskAnalytics.Api.Mappers;

public class PortfolioAircraftMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Aircraft, AircraftResponse>()
            .Map(destination => destination, source => source.CurrentAircraftHistory)
            .Map(destination => destination, source => source.CurrentAircraftHistory!.AircraftStatusHistory)
            .Map(destination => destination, source => source.CurrentAircraftHistory!.AircraftConfiguration)
            .Map(destination => destination, source => source.CurrentReportedUtilization);
    }
}
