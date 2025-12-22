using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Business.Authorization;
using RiskAnalytics.Api.Business.Mappers.Interfaces;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Repository.Models;

namespace RiskAnalytics.Api.Business.Services;

public class UtilizationService : IUtilizationService
{
    private readonly IUtilizationRepository utilizationRepository;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationService;
    private readonly IMemoryCache memoryCache;
    private readonly IMonthlyUtilizationMapper monthlyUtilizationMapper;
    private readonly IGroupCountQueryRepository groupCountQueryRepository;

    public UtilizationService(
        IPortfolioAuthorizationService portfolioAuthorizationService,
        IUtilizationRepository utilizationRepository,
        IGroupCountQueryRepository groupCountQueryRepository,
        IMemoryCache memoryCache,
        IMonthlyUtilizationMapper monthlyUtilizationMapper)
    {
        this.portfolioAuthorizationService = portfolioAuthorizationService;
        this.utilizationRepository = utilizationRepository;
        this.memoryCache = memoryCache;
        this.monthlyUtilizationMapper = monthlyUtilizationMapper;
        this.groupCountQueryRepository = groupCountQueryRepository;
    }

    public async Task<IEnumerable<IEnumerable<MonthlyUtilization>>> GetMonthlyUtilization(
        int? portfolioId,
        ClaimsPrincipal user,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds,
        int? operatorId,
        int? lessorId,
        bool includeBaseline,
        bool isEmissions,
        bool isHoursAndCycle)
    {
        if (portfolioId != null)
        {
            await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolioId.Value, user.Auth0Id());
        }

        var includeEmissions = user.Claims.HasPortfoliosClaim(PortfoliosClaim.EmissionsAddOn);
        if (portfolioId != null || (groupBy != null && groupBy != MonthlyUtilizationGroup.MarketClass) || operatorId != null || lessorId != null)
        {

            return await BuildMonthlyUtilization();
        }

        var cacheKey = BuildCacheKey();
        IEnumerable<IEnumerable<MonthlyUtilization>> cachedMonthlyUtilization;

        var cached = memoryCache.TryGetValue(cacheKey, out cachedMonthlyUtilization);

        if (cached && cachedMonthlyUtilization != null)
        {
            return cachedMonthlyUtilization;
        }

        var monthlyUtilization = await BuildMonthlyUtilization();

        memoryCache.Set(cacheKey, monthlyUtilization, TimeSpan.FromMinutes(CacheSettings.MonthlyUtilizationCachePeriodInMinutes));

        return monthlyUtilization;

        async Task<IList<IEnumerable<MonthlyUtilization>>> BuildMonthlyUtilization()
        {

            var monthlyUtilizationsTask = utilizationRepository.GetMonthlyUtilization(
                portfolioId,
                groupBy,
                groupByFilterIds,
                operatorId,
                lessorId,
                includeEmissions,
                includeBaseline,
                isEmissions,
                isHoursAndCycle);

            var monthlyUtilizations = (await monthlyUtilizationsTask).ToList();

            monthlyUtilization = await GetGroupCounts(portfolioId,
                groupBy,
                groupByFilterIds,
                operatorId,
                lessorId,
                monthlyUtilizations,
                includeBaseline);

            return monthlyUtilizationMapper.Map(monthlyUtilizations);
        }

        string BuildCacheKey()
        {
            var cacheKeyBuilder = new StringBuilder();

            cacheKeyBuilder.Append(CacheSettings.MonthlyUtilizationGlobalBenchmarkResultsCachePrefix);
            cacheKeyBuilder.Append($"_IncludeBaseline={includeBaseline}");
            cacheKeyBuilder.Append($"_MarketClassIds={(groupByFilterIds == null ? "All" : string.Join(',', groupByFilterIds.Order()))}");
            cacheKeyBuilder.Append($"_IncludeEmissions={includeEmissions}");
            cacheKeyBuilder.Append($"_IsEmissions={isEmissions}");
            cacheKeyBuilder.Append($"_isHoursAndCycle={isHoursAndCycle}");

            return cacheKeyBuilder.ToString();
        }
    }
    public async Task<IList<IEnumerable<MonthlyUtilization>>> GetGroupCounts(
        int? portfolioId,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds,
        int? operatorId,
        int? lessorId,
        IList<IEnumerable<MonthlyUtilization>> monthlyUtilizations,
        bool includeBaseline)
    {
        // Pre-process the monthlyUtilizations into a dictionary for faster lookups
        var lookup = monthlyUtilizations
            .SelectMany(i => i)
            .GroupBy(x => new { x.GroupId, x.Year, x.Month })
            .ToDictionary(g => g.Key, g => g.First());

        var monthlyUtilizationGroupCounts = await groupCountQueryRepository.GetGroupCounts(
            portfolioId,
            groupBy,
            groupByFilterIds,
            operatorId,
            lessorId,
            includeBaseline);

        foreach (var groupCount in monthlyUtilizationGroupCounts)
        {
            var key = new { groupCount.GroupId, groupCount.Year, groupCount.Month };
            if (lookup.TryGetValue(key, out var matchingUtilization))
            {
                matchingUtilization.NumberOfAircraftInGroup = groupCount.NumberOfAircraftInGroup;
            }
        }

        return monthlyUtilizations;
    }

    public async Task<IEnumerable<MSNUtilizationPerAircraft>> GetMonthlyUtilizationPerAircraft(
        int portfolioId,
        int endMonthIndex,
        int startMonthIndex,
        int endYear,
        int startYear,
        bool isEmissions,
        ClaimsPrincipal user,
        int? operatorId,
        int? lessorId,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds)
    {
        var cacheKey = this.BuildCacheKey(portfolioId, endMonthIndex, startMonthIndex, endYear, startYear, isEmissions, user, operatorId, lessorId, groupBy, groupByFilterIds);
        IEnumerable<MSNUtilizationPerAircraft> cachedMonthlyUtilizationPerAircraft;

        var cached = memoryCache.TryGetValue(cacheKey, out cachedMonthlyUtilizationPerAircraft);

        if (cachedMonthlyUtilizationPerAircraft != null)
        {
            return cachedMonthlyUtilizationPerAircraft;
        }
        var monthlyUtilizationsPerAircraft = await utilizationRepository.GetMonthlyUtilizationPerAircraft(portfolioId, endMonthIndex, startMonthIndex, endYear, startYear, isEmissions, operatorId, lessorId, groupBy, groupByFilterIds);
        memoryCache.Set(cacheKey, monthlyUtilizationsPerAircraft, TimeSpan.FromMinutes(CacheSettings.MonthlyUtilizationCachePeriodInMinutes));
        return monthlyUtilizationsPerAircraft;
    }

    public async Task<UtilizationGroupOptionsModel> GetGroupOptions(
        int? portfolioId,
        int? operatorId,
        int? lessorId,
        string userId)
    {
        if (portfolioId != null)
        {
            await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolioId.Value, userId);
        }

        if (portfolioId != null || operatorId != null || lessorId != null)
        {
            return await GetGroupOptionsFromRepository();
        }

        const string cacheKey = CacheSettings.MonthlyUtilizationGlobalBenchmarkGroupOptionsCacheKey;

        if (memoryCache.TryGetValue(cacheKey, out UtilizationGroupOptionsModel? utilizationGroupOptionsModel) && utilizationGroupOptionsModel != null)
        {
            return utilizationGroupOptionsModel;
        }

        var groupOptionsModel = await GetGroupOptionsFromRepository();

        memoryCache.Set(cacheKey, groupOptionsModel, TimeSpan.FromMinutes(CacheSettings.MonthlyUtilizationCachePeriodInMinutes));

        return groupOptionsModel;

        async Task<UtilizationGroupOptionsModel> GetGroupOptionsFromRepository()
        {
            var groupOptions = (await utilizationRepository.GetGroupOptions(operatorId, portfolioId, lessorId)).ToList();

            return new UtilizationGroupOptionsModel
            {
                AircraftMarketClasses = groupOptions.Where(x => x.Type == MonthlyUtilizationGroup.MarketClass.ToString()).Select(i => new IdNamePairModel(i.Id, i.Name)),
                AircraftFamilies = groupOptions.Where(x => x.Type == MonthlyUtilizationGroup.AircraftFamily.ToString()).Select(i => new IdNamePairModel(i.Id, i.Name)),
                AircraftTypes = groupOptions.Where(x => x.Type == MonthlyUtilizationGroup.AircraftType.ToString()).Select(i => new IdNamePairModel(i.Id, i.Name)),
                AircraftSeries = groupOptions.Where(x => x.Type == MonthlyUtilizationGroup.AircraftSeries.ToString()).Select(i => new IdNamePairModel(i.Id, i.Name)),
                AircraftSerialNumbers = groupOptions.Where(x => x.Type == MonthlyUtilizationGroup.AircraftSerialNumber.ToString()).Select(i => new IdNamePairModel(i.Id, i.Name))
            };
        }
    }

    public async Task<IEnumerable<IdNamePairModel>> GetOperators(
        int? portfolioId,
        int? lessorId,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds,
        string userId)
    {
        if (portfolioId != null)
        {
            await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolioId.Value, userId);
        }

        if (portfolioId != null || groupBy != null)
        {
            return await GetOperatorsFromRepository();
        }

        if (memoryCache.TryGetValue(CacheSettings.MonthlyUtilizationGlobalBenchmarkOperatorsCacheKey, out IEnumerable<IdNamePairModel>? cachedOperators) && cachedOperators != null)
        {
            return cachedOperators;
        }

        var operators = await GetOperatorsFromRepository();

        memoryCache.Set(CacheSettings.MonthlyUtilizationGlobalBenchmarkOperatorsCacheKey, operators, TimeSpan.FromMinutes(CacheSettings.MonthlyUtilizationCachePeriodInMinutes));

        return operators;

        async Task<IList<IdNamePairModel>> GetOperatorsFromRepository()
        {
            return (await utilizationRepository.GetOperators(portfolioId, lessorId, groupBy, groupByFilterIds)).ToList();
        }
    }

    public async Task<IEnumerable<IdNamePairModel>> GetLessors(
        int? portfolioId,
        int? operatorId,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds,
        string userId)
    {
        if (portfolioId != null)
        {
            await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolioId.Value, userId);
        }

        if (portfolioId != null || groupBy != null || operatorId != null)
        {
            return await GetLessorsFromRepository();
        }

        if (memoryCache.TryGetValue(CacheSettings.MonthlyUtilizationGlobalBenchmarkLessorsCacheKey, out IEnumerable<IdNamePairModel>? cachedOperators) && cachedOperators != null)
        {
            return cachedOperators;
        }

        var operators = await GetLessorsFromRepository();

        memoryCache.Set(CacheSettings.MonthlyUtilizationGlobalBenchmarkLessorsCacheKey, operators, TimeSpan.FromMinutes(CacheSettings.MonthlyUtilizationCachePeriodInMinutes));

        return operators;

        async Task<IList<IdNamePairModel>> GetLessorsFromRepository()
        {
            return (await utilizationRepository.GetLessors(portfolioId, operatorId, groupBy, groupByFilterIds)).ToList();
        }
    }

    private string BuildCacheKey(
        int portfolioId,
        int endMonthIndex,
        int startMonthIndex,
        int endYear,
        int startYear,
        bool isEmissions,
        ClaimsPrincipal user,
        int? operatorId,
        int? lessorId,
        MonthlyUtilizationGroup? groupBy,
        IReadOnlyCollection<int>? groupByFilterIds)
    {
        var cacheKeyBuilder = new StringBuilder();
        cacheKeyBuilder.Append(CacheSettings.MonthlyUtilizationPerAircraftCachePrefix);
        cacheKeyBuilder.Append($"_PortfolioId={portfolioId}");
        cacheKeyBuilder.Append($"_EndMonthIndex={endMonthIndex}");
        cacheKeyBuilder.Append($"_StartMonthIndex={startMonthIndex}");
        cacheKeyBuilder.Append($"_EndYear={endYear}");
        cacheKeyBuilder.Append($"_StartYear={startYear}");
        if (operatorId != null)
            cacheKeyBuilder.Append($"_OperatorId={operatorId}");
        if (lessorId != null)
            cacheKeyBuilder.Append($"_LessorId={lessorId}");
        if (groupBy != null)
            cacheKeyBuilder.Append($"_GroupBy={groupBy}");
        if (groupByFilterIds?.Count > 0)
            cacheKeyBuilder.Append($"_GroupByFilterIds={string.Join(',', groupByFilterIds)}");
        cacheKeyBuilder.Append($"_IsEmissions={isEmissions}");

        return cacheKeyBuilder.ToString();
    }

}
