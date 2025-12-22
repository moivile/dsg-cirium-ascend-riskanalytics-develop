using NSubstitute;
using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository;
using RiskAnalytics.Api.Repository.Entities;
using Xunit;

namespace RiskAnalytics.Business.Tests.Services;

public class SavedSearchRunReportsServiceTests
{
    private ISavedSearchRunReportsService savedSearchRunReportsService;
    private ISavedSearchRunReportsRepository savedSearchRunReportsRepositoryMock;

    public SavedSearchRunReportsServiceTests()
    {
        savedSearchRunReportsRepositoryMock = Substitute.For<ISavedSearchRunReportsRepository>();
        savedSearchRunReportsService = new SavedSearchRunReportsService(savedSearchRunReportsRepositoryMock);
    }

    [Fact]
    public async Task Save_CallsSaveInRepository()
    {
        // act
        await savedSearchRunReportsService.Save(new List<SavedSearchRunReport>
        {
            new SavedSearchRunReport()
        });

        // assert
        await savedSearchRunReportsRepositoryMock.Received().Save(Arg.Any<SavedSearchRunReport>());
    }

    [Fact]
    public async Task GetTheLatestRunResults_CallsGetTheLatestRunResultsInRepository()
    {
        // act
        await savedSearchRunReportsService.GetTheLatestRunResults();

        // assert
        await savedSearchRunReportsRepositoryMock.Received().GetTheLatestRunResults();
    }
}
