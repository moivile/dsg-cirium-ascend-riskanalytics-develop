using MapsterMapper;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Interfaces;

namespace RiskAnalytics.Api.Business.Services;

public class PortfolioAircraftService : IPortfolioAircraftService
{
    private readonly IPortfolioAircraftRepository portfolioAircraftRepository;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationService;
    private readonly IMapper mapper;

    public PortfolioAircraftService(
        IPortfolioAuthorizationService portfolioAuthorizationService,
        IPortfolioAircraftRepository portfolioAircraftRepository,
        IMapper mapper)
    {
        this.portfolioAuthorizationService = portfolioAuthorizationService;
        this.portfolioAircraftRepository = portfolioAircraftRepository;
        this.mapper = mapper;
    }

    public async Task<IEnumerable<AircraftModel>> GetAll(int portfolioId, string userId, bool isServiceUser = false)
    {
        if (!isServiceUser)
        {
            await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolioId, userId);
        }

        var result = await portfolioAircraftRepository.GetAll(portfolioId);

        return mapper.Map<List<AircraftModel>>(result);
    }
}
