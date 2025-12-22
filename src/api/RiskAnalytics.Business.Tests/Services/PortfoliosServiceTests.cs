using Microsoft.Extensions.Caching.Memory;
using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;
using RiskAnalytics.Api.Common.Exceptions;
using NSubstitute;

namespace RiskAnalytics.Api.Repository.Entities.Portfolios;
public class PortfoliosServiceTests
{
    private readonly IPortfoliosRepository portfoliosRepositoryMock;
    private readonly IPortfolioAuthorizationService portfolioAuthorizationServiceMock;
    private readonly PortfoliosService portfoliosService;
    private readonly IMemoryCache memoryCacheMock;
    private readonly ICacheKeyBuilder cacheKeyBuilderMock;

    public PortfoliosServiceTests()
    {
        portfoliosRepositoryMock = Substitute.For<IPortfoliosRepository>();
        portfolioAuthorizationServiceMock = Substitute.For<IPortfolioAuthorizationService>();
        memoryCacheMock = Substitute.For<IMemoryCache>();
        cacheKeyBuilderMock = Substitute.For<ICacheKeyBuilder>();

        portfoliosService = new PortfoliosService(
            portfoliosRepositoryMock,
            portfolioAuthorizationServiceMock,
            memoryCacheMock,
            cacheKeyBuilderMock);
    }

    [Fact]
    public async Task Get_PortfolioDoesNotExist_ThrowNotFound()
    {
        // arrange
        portfolioAuthorizationServiceMock
            .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new NotFoundException(); });

        // act & assert
        await Assert.ThrowsAsync<NotFoundException>(async () => await portfoliosService.Get(1, "blah"));
    }

    [Fact]
    public async Task Get_UserDoesNotOwnPortfolio_ThrowForbidden()
    {
        // arrange
        portfolioAuthorizationServiceMock
            .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<Portfolio>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

        // act & assert
        await Assert.ThrowsAsync<ForbiddenException>(async () => await portfoliosService.Get(1, "User1"));
    }

    [Fact]
    public async Task Get_PortfolioExistsAndOwnedByUser_ReturnPortfolio()
    {
        // arrange
        portfoliosRepositoryMock.Get(Arg.Any<int>()).Returns(new Portfolio { UserId = "User1" });

        // act
        var portfolio = await portfoliosService.Get(1, "User1");

        // assert
        Assert.NotNull(portfolio);
    }

    [Fact]
    public async Task Delete_PortfolioDoesNotExist_ThrowNotFound()
    {
        // arrange
        portfolioAuthorizationServiceMock
            .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), Arg.Any<string>()))
            .Do(x => { throw new NotFoundException(); });

        // act & assert
        await Assert.ThrowsAsync<NotFoundException>(async () => await portfoliosService.Delete(1, "blah"));
        await portfoliosRepositoryMock.DidNotReceive().Delete(Arg.Any<int>(), Arg.Any<string>());
    }

    [Fact]
    public async Task Delete_UserDoesNotOwnPortfolio_ThrowForbidden()
    {
        // arrange
        portfolioAuthorizationServiceMock.When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

        // act & assert
        await Assert.ThrowsAsync<ForbiddenException>(async () => await portfoliosService.Delete(1, "User1"));
        await portfoliosRepositoryMock.DidNotReceive().Delete(Arg.Any<int>(), Arg.Any<string>());
    }

    [Fact]
    public async Task Delete_PortfolioExistsAndOwnedByUser_DeletePortfolio()
    {
        // arrange
        portfoliosRepositoryMock.Get(Arg.Any<int>()).Returns(new Portfolio { UserId = "User1" });

        // act
        await portfoliosService.Delete(1, "User1");

        // assert
        await portfoliosRepositoryMock.Received().Delete(1, "User1");
    }

    [Fact]
    public async Task GetAll_ReturnsListWithOnePortfolio()
    {
        // arrange
        portfoliosRepositoryMock.GetAll(Arg.Any<string>()).Returns(new List<Portfolio> { new Portfolio { UserId = "User1" } });

        // act
        var result = await portfoliosService.GetAll("User1");

        // assert
        Assert.NotNull(result);
        Assert.True(result.Count() == 1);
    }

    [Fact]
    public async Task Create_CallsRepoCreateMethod_ReturnsNewPortfolioId()
    {
        // arrange
        portfoliosRepositoryMock.Create(Arg.Any<Portfolio>())
            .Returns(5);

        var portfolio = new Portfolio
        {
            Name = "bob"
        };

        // act
        var result = await portfoliosService.Create(portfolio);

        // assert
        Assert.Equal(5, result);
        await portfoliosRepositoryMock.Received().Create(Arg.Any<Portfolio>());
    }

    [Fact]
    public async Task Update_CallsValidateAccessToPortfolioOrThrow()
    {
        var testPortfolio = new Portfolio(){ Id = 123 };

        // act
        await portfoliosService.Update(testPortfolio, "xxx");

        // assert
        await portfolioAuthorizationServiceMock.Received().ValidateAccessToPortfolioOrThrow(testPortfolio.Id, "xxx");
    }

    [Fact]
    public async Task Update_CallsUpdateInPortfolioRepository()
    {
        // act
        await portfoliosService.Update(new Portfolio(), "xxx");

        // assert
        await portfoliosRepositoryMock.Received().Update(Arg.Any<Portfolio>());
    }

    [Fact]
    public async Task Update_ClearsAnyCachedResultsRelatedToPortfolio()
    {
        // arrange
        var portfolio = new Portfolio() { Id = 123 };

        var cacheKey = $"RiskAnalytics_Portfolio_Aircraft_Results_{portfolio.Id}";
        cacheKeyBuilderMock.BuildPortfolioCacheKey(Arg.Is<int>(portfolio.Id)).Returns(cacheKey);

        // act
        await portfoliosService.Update(portfolio, "xxx");

        // assert
        memoryCacheMock.Received().Remove(cacheKey);
    }

    [Fact]
    public async Task Update_CallsBuildPortfolioCacheKey()
    {
        // arrange
        var portfolio = new Portfolio() { Id = 123 };

        var cacheKey = $"RiskAnalytics_Portfolio_Aircraft_Results_{portfolio.Id}";
        cacheKeyBuilderMock.BuildPortfolioCacheKey(Arg.Is<int>(portfolio.Id)).Returns(cacheKey);

        // act
        await portfoliosService.Update(portfolio, "xxx");

        // assert
        cacheKeyBuilderMock.Received().BuildPortfolioCacheKey(portfolio.Id).Equals(cacheKey);
    }
}
