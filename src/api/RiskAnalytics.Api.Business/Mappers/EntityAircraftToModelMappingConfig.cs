using Mapster;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;

namespace RiskAnalytics.Api.Business.Mappers;

public class EntityAircraftToModelMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Aircraft, Model.AircraftModel>()
            .Map(destination => destination, source => source.CurrentAircraftHistory)
            .Map(destination => destination, source => source.CurrentAircraftHistory!.AircraftStatusHistory)
            .Map(destination => destination, source => source.CurrentAircraftHistory!.AircraftConfiguration)
            .Map(destination => destination, source => source.CurrentReportedUtilization);
    }
}
