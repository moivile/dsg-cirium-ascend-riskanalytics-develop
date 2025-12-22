using Mapster;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Mappers;

public class SavedSearchEntityToSavedSearchModelMapper: IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Repository.Entities.SavedSearch, SavedSearchModel>()
            .Map(destination => destination.EngineSerieIds, source => source.EngineSeriesIds);
    }
}
