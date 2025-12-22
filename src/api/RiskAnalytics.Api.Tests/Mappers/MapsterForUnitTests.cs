using Mapster;
using MapsterMapper;

namespace RiskAnalytics.Api.Tests.Mappers
{
    public static class MapsterForUnitTests
    {
        public static Mapper GetMapper<ImplementationOfIRegisterClass>()
        {
            var config = TypeAdapterConfig.GlobalSettings;
            config.Scan(typeof(ImplementationOfIRegisterClass).Assembly);
            return new Mapper(config);
        }
    }
}
