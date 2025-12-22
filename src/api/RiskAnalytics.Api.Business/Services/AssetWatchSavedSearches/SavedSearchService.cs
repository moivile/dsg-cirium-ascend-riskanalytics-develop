using MapsterMapper;
using RiskAnalytics.Api.Repository.AssetWatchSavedSearches;
using SavedSearchModel = RiskAnalytics.Api.Model.SavedSearchModel;
using UserSavedSearchModel = RiskAnalytics.Api.Model.UserSavedSearchModel;
using EmailAlertsUserSavedSearchModel = RiskAnalytics.Api.Model.EmailAlertsUserSavedSearchModel;
using AssetWatchListGridDataResponseModel = RiskAnalytics.Api.Model.AssetWatchListGridDataResponseModel;
using RiskAnalytics.Api.Business.Services.AssetWatch;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Business.Services.Interfaces;


namespace RiskAnalytics.Api.Business.Services.AssetWatchSavedSearches;
public class SavedSearchService : ISavedSearchService
{
    private readonly ISavedSearchesRepository savedSearchesRepository;
    private readonly IAssetWatchTableService assetWatchTableService;
    private readonly IPortfolioAircraftService portfolioAircraftService;
    private readonly IMapper mapper;

    public SavedSearchService(
        ISavedSearchesRepository savedSearchesRepository,
        IAssetWatchTableService assetWatchTableService,
        IMapper mapper,
        IPortfolioAircraftService portfolioAircraftService)
    {
        this.savedSearchesRepository = savedSearchesRepository;
        this.assetWatchTableService = assetWatchTableService;
        this.mapper = mapper;
        this.portfolioAircraftService = portfolioAircraftService;
    }

    public async Task<IEnumerable<SavedSearchModel>> GetAll(string userId)
    {
        var savedSearches = await savedSearchesRepository.GetAll(userId);
        return mapper.Map<IEnumerable<SavedSearchModel>>(savedSearches);
    }
    public async Task<SavedSearchModel?> Get(int id)
    {
        var savedSearch = await savedSearchesRepository.Get(id);
        return savedSearch == null ? null : mapper.Map<SavedSearchModel>(savedSearch);
    }

    public async Task<IEnumerable<UserSavedSearchModel>> GetAllUserSavedSearches()
    {
        var userSavedSearches = await savedSearchesRepository.GetAllActiveSavedSearches();
        userSavedSearches.ToList().ForEach(async savedSearch =>
        {
            savedSearch.FilterValues = await savedSearchesRepository.GetAssetWatchFilterValues(savedSearch);
        });

        var groupedUserSavedSearches = userSavedSearches
                     .GroupBy(userSavedSearch => new
                     {
                         userSavedSearch.UserId,
                         userSavedSearch.Frequency
                     }).Select(savedSearch =>
                     new UserSavedSearchModel()
                     {
                         UserId = savedSearch?.Key.UserId,
                         Frequency = savedSearch?.Key.Frequency,
                         UsersSavedSearches = mapper.Map<IEnumerable<EmailAlertsUserSavedSearchModel>>(savedSearch).ToList()
                     });

        return groupedUserSavedSearches;
    }

    public async Task<AssetWatchListGridDataResponseModel> ProcessUserSavedSearch(EmailAlertsUserSavedSearchModel savedSearch, string userId)
    {
        var isServiceUser = true;

        var result = await assetWatchTableService.GetTableData(
            savedSearch.PortfolioId,
            mapper.Map<AssetWatchTableSearchParameters>(savedSearch),
            savedSearch.UserId, isServiceUser);

        var allPortfolioAircraft = await portfolioAircraftService.GetAll(savedSearch.PortfolioId, userId, isServiceUser);

        var matchCriteriaMsns = result.AssetWatchListDataGrid.Select(i => i.AircraftSerialNumber).ToList();
        var portfolioAircraftMsns = allPortfolioAircraft.Select(i => i.AircraftSerialNumber).ToList();

        result.NotMetCriteriaMsns = portfolioAircraftMsns.Except(matchCriteriaMsns).ToList();

        return result;
    }

    public async Task<int> Create(SavedSearchModel savedSearch, string userId)
    {
        var entity = mapper.Map<Repository.Entities.SavedSearch>(savedSearch);
        var id = await savedSearchesRepository.Create(entity, userId);

        var currentFrequency = await savedSearchesRepository.GetFrequency(userId);
        await savedSearchesRepository.SetFrequency(userId, currentFrequency);

        return id;
    }

    public async Task Update(SavedSearchModel savedSearch)
    {
        var entity = mapper.Map<Repository.Entities.SavedSearch>(savedSearch);
        await savedSearchesRepository.Update(entity);
    }

    public async Task UpdateIsActive(int id, bool isActive)
    {
        var savedSearch = await savedSearchesRepository.Get(id);
        savedSearch!.IsActive = isActive;
        await savedSearchesRepository.Update(savedSearch);
    }

    public async Task UpdateNameAndDescription(int id, string name, string? description)
    {
        var savedSearch = await savedSearchesRepository.Get(id) ?? throw new NotFoundException();
        savedSearch!.Name = name;
        savedSearch.Description = description;
        await savedSearchesRepository.Update(savedSearch);
    }

    public async Task TrackProcessedAlertForUser(int id, DateTime processedTimeSlot)
    {
        await savedSearchesRepository.TrackProcessedAlertForUser(id, processedTimeSlot);
    }

    public async Task Delete(int savedSearchId, string userId)
    {
        await savedSearchesRepository.Delete(savedSearchId, userId);
    }


    public async Task SetFrequency(string userId, SavedSearchFrequency frequency)
    {
        await savedSearchesRepository.SetFrequency(userId, frequency);
    }

    public async Task<SavedSearchFrequency> GetFrequency(string userId)
    {
        return await savedSearchesRepository.GetFrequency(userId);
    }
}
