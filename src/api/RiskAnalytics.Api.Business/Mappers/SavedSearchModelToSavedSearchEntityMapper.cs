using Mapster;
using RiskAnalytics.Api.Model;

namespace RiskAnalytics.Api.Business.Mappers;

public class SavedSearchModelToSavedSearchEntityMapper : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<SavedSearchModel, Repository.Entities.SavedSearch>()
            .Map(destination => destination.EngineSeriesIds, source => source.EngineSerieIds);
    }
}
