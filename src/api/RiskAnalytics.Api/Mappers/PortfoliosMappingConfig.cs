using Mapster;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Requests;

namespace RiskAnalytics.Api.Mappers;

public class PortfoliosMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {

        config.NewConfig<PortfolioRequest, Portfolio>()
            .Map(destination => destination.Aircraft, source => source.AircraftIds.Select(id => new PortfolioAircraft
            {
                Aircraft = new Aircraft
                {
                    AircraftId = id
                }
            }).ToList());
    }
}
