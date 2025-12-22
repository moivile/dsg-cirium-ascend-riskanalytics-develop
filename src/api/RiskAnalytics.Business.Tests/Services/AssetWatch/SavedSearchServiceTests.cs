using RiskAnalytics.Api.Repository.AssetWatchSavedSearches;
using RiskAnalytics.Api.Business.Services.AssetWatchSavedSearches;
using RiskAnalytics.Api.Business.Services.AssetWatch;
using NSubstitute;
using MapsterMapper;
using RiskAnalytics.Api.Model;
using Xunit;
using RiskAnalytics.Api.Business.Services.Interfaces;

namespace RiskAnalytics.Business.Tests.Services.AssetWatch;

public class SavedSearchServiceTests
{
    private readonly ISavedSearchesRepository savedSearchesRepositoryMock;
    private readonly IAssetWatchTableService assetWatchTableServiceMock;
    private readonly IPortfolioAircraftService portfolioAircraftServiceMock;
    private readonly SavedSearchService savedSearchService;
    private readonly IMapper mapperMock;

    public SavedSearchServiceTests()
    {
        savedSearchesRepositoryMock = Substitute.For<ISavedSearchesRepository>();
        assetWatchTableServiceMock = Substitute.For<IAssetWatchTableService>();
        portfolioAircraftServiceMock = Substitute.For<IPortfolioAircraftService>();
        mapperMock = Substitute.For<IMapper>();

        savedSearchService = new SavedSearchService(savedSearchesRepositoryMock, assetWatchTableServiceMock, mapperMock,portfolioAircraftServiceMock);
    }

    [Fact]
    public async Task Get_SavedSearchExistsAndOwnedByUser_ReturnSavedSearch()
    {
        // arrange
        savedSearchesRepositoryMock.Get(Arg.Any<int>()).Returns(new Api.Repository.Entities.SavedSearch { UserId = "User1" });
        mapperMock.Map<SavedSearchModel>(Arg.Any<Api.Repository.Entities.SavedSearch>())
            .Returns(new SavedSearchModel { UserId = "User1" });

        // act
        var savedSearch = await savedSearchService.Get(1);

        // assert
        Assert.NotNull(savedSearch);
    }

    [Fact]
    public async Task Delete_SavedSearchExistsAndOwnedByUser_DeleteSavedSearch()
    {
        // arrange
        savedSearchesRepositoryMock.Get(Arg.Any<int>()).Returns(new Api.Repository.Entities.SavedSearch { UserId = "User1" });

        // act
        await savedSearchService.Delete(1, "User1");

        // assert
        await savedSearchesRepositoryMock.Received().Delete(1, "User1");
    }

    [Fact]
    public async Task GetAll_SavedSearchExistsAndOwnedByUser_ReturnsListWithOneSavedSearch()
    {
        // arrange
        mapperMock.Map<IEnumerable<SavedSearchModel>>(Arg.Any<IEnumerable<Api.Repository.Entities.SavedSearch>>())
            .Returns(new List<SavedSearchModel> {
                new SavedSearchModel { UserId = "User1" } });

        // act
        var result = await savedSearchService.GetAll("User1");

        // assert
        Assert.NotNull(result);
        Assert.True(result.Count() == 1);
    }

    [Fact]
    public async Task Create_CallsRepoCreateMethod_ReturnsNewSavedSearchId()
    {
        // arrange
        savedSearchesRepositoryMock.Create(Arg.Any<Api.Repository.Entities.SavedSearch>(), Arg.Any<string>())
            .Returns(5);

        var savedSearch = new SavedSearchModel
        {
            Name = "bob"
        };

        // act
        var result = await savedSearchService.Create(savedSearch, "xxx");

        // assert
        Assert.Equal(5, result);
        await savedSearchesRepositoryMock.Received().Create(Arg.Any<Api.Repository.Entities.SavedSearch>(), Arg.Any<string>());
    }

    [Fact]
    public async Task Create_CallsRepoGetAndSetFrequency()
    {
        // arrange
        savedSearchesRepositoryMock.Create(Arg.Any<Api.Repository.Entities.SavedSearch>(), Arg.Any<string>())
            .Returns(5);

        var savedSearch = new SavedSearchModel
        {
            Name = "bob"
        };

        // act
        await savedSearchService.Create(savedSearch, "xxx");

        // assert
        await savedSearchesRepositoryMock.Received().GetFrequency(Arg.Any<string>());
        await savedSearchesRepositoryMock.Received().SetFrequency(Arg.Any<string>(), Arg.Any<SavedSearchFrequency>());
    }

    [Fact]
    public async Task Update_CallsUpdateInSavedSearchRepository()
    {
        // act
        await savedSearchService.Update(new SavedSearchModel());

        // assert
        await savedSearchesRepositoryMock.Received().Update(Arg.Any<Api.Repository.Entities.SavedSearch>());
    }
    [Fact]
    public async Task GetAllUserSavedSearches_SavedSearchesExist_ReturnsListOfSavedSearchesForAllUsers()
    {
        // arrange
        savedSearchesRepositoryMock.GetAllActiveSavedSearches()
           .Returns(new List<Api.Repository.Entities.SavedSearch> {
                new Api.Repository.Entities.SavedSearch {
                    UserId = "User2", Id = 3,
                    Name = "Saved Search 3",
                    CountryCodes = new string[] { "1", "2" },
                    OperatorIds = new int[] { 111, 2222 } }
           });

        savedSearchesRepositoryMock.GetAssetWatchFilterValues(new Api.Repository.Entities.SavedSearch())
        .Returns(new AssetWatchFilterValues() {
            Countries = new List<string> { "China", "Japan" },
            Operators = new List<string> { "Air China", "Japan Airlines" }
        });

        // act
        var result = await savedSearchService.GetAllUserSavedSearches();

        // assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task ProcessUserSavedSearch_WhenCriteriaHasBeenMet_ReturnsListOfMatchingCriteriaAndTwoNotMatching()
    {
        // arrange
        assetWatchTableServiceMock.GetTableData(Arg.Any<int>(), Arg.Any<AssetWatchTableSearchParameters>(), Arg.Any<string>(), Arg.Any<bool>())
           .Returns(new AssetWatchListGridDataResponseModel()
           {
               AssetWatchListDataGrid = new List<AssetWatchListDataGridModel>() {
                new AssetWatchListDataGridModel { AircraftId = 1, AircraftSerialNumber = "1", NumberOfFlights = 2 },
                new AssetWatchListDataGridModel { AircraftId = 2, AircraftSerialNumber = "2", NumberOfFlights = 3 },
                new AssetWatchListDataGridModel { AircraftId = 3, AircraftSerialNumber = "3", NumberOfFlights = 5 }
            }
           });

        portfolioAircraftServiceMock.GetAll(Arg.Any<int>(), Arg.Any<string>(), true)
            .Returns(new List<AircraftModel>
            {
                new AircraftModel{ AircraftId = 1, AircraftSerialNumber="1"},
                new AircraftModel{ AircraftId = 2, AircraftSerialNumber="2"},
                new AircraftModel{ AircraftId = 3, AircraftSerialNumber="3"},

                new AircraftModel{ AircraftId = 4, AircraftSerialNumber="4"},
                new AircraftModel{ AircraftId = 5, AircraftSerialNumber="5"}
            });

        // act
        var result = await savedSearchService.ProcessUserSavedSearch(new EmailAlertsUserSavedSearchModel(), "xxx");

        // assert
        Assert.NotNull(result);
        Assert.True(result.AssetWatchListDataGrid.Count() == 3);
        Assert.True(result.NotMetCriteriaMsns.Count() == 2);
    }

    [Fact]
    public async Task TrackProcessedAlertForUser_CallsTrackProcessedAlertForUserInSavedSearchRepository()
    {

        // act
        await savedSearchService.TrackProcessedAlertForUser(1,DateTime.UtcNow);

        // assert
        await savedSearchesRepositoryMock.Received().TrackProcessedAlertForUser(Arg.Any<int>(),  Arg.Any<DateTime>());
    }


    [Fact]
    public async Task SetFrequency_CallsRelevantRepositoryMethod()
    {
        // arrange
        // act
        await savedSearchService.SetFrequency("User1", SavedSearchFrequency.Daily);

        // assert
        await savedSearchesRepositoryMock.Received().SetFrequency("User1", SavedSearchFrequency.Daily);
    }
}
