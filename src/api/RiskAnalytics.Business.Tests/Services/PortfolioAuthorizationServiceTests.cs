
using NSubstitute;
using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;

namespace RiskAnalytics.Business.Tests.Services;

public class PortfolioAuthorizationServiceTests
{
    private readonly IPortfoliosRepository portfoliosRepositoryMock;
    private readonly PortfolioAuthorizationService portfolioAuthorizationService;

    public PortfolioAuthorizationServiceTests()
    {
        portfoliosRepositoryMock = Substitute.For<IPortfoliosRepository>();
        portfolioAuthorizationService = new PortfolioAuthorizationService(portfoliosRepositoryMock);
    }

    [Fact]
    public async Task ValidateAccessToPortfolioOrThrow_ByIdAndAndPortfolioDoesNotExist_ThrowNotFound()
    {
        // arrange
        portfoliosRepositoryMock.Get(Arg.Any<int>()).Returns((Portfolio?)null);

        // act & assert
        await Assert.ThrowsAsync<NotFoundException>(async () => await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(1, "blah"));
    }

    [Fact]
    public async Task ValidateAccessToPortfolioOrThrow_ByIdAndUserDoesNotOwnPortfolio_ThrowForbidden()
    {
        // arrange
        portfoliosRepositoryMock.Get(Arg.Any<int>()).Returns(new Portfolio { UserId = "bob"});

        // act & assert
        await Assert.ThrowsAsync<ForbiddenException>(async () => await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(1, "blah"));
    }

    [Fact]
    public async Task ValidateAccessToPortfolioOrThrow_ByIdAndPortfolioExistsAndOwnedByUser_ThrowsNoException()
    {
        // arrange
        portfoliosRepositoryMock.Get(Arg.Any<int>()).Returns(new Portfolio { UserId = "User1" });

        // act & assert
        var exception = await Record.ExceptionAsync(async () => await portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(1, "User1"));
        Assert.Null(exception);
    }

    [Fact]
    public void ValidateAccessToPortfolioOrThrow_ByPortfolioAndPortfolioDoesNotExist_ThrowNotFound()
    {
        // arrange
        Portfolio? portfolio = null;

        // act & assert
        Assert.Throws<NotFoundException>(() => portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolio, "blah"));
    }

    [Fact]
    public void ValidateAccessToPortfolioOrThrow_ByPortfolioAndUserDoesNotOwnPortfolio_ThrowForbidden()
    {
        // arrange
        var portfolio = new Portfolio { UserId = "bob" };

        // act & assert
        Assert.Throws<ForbiddenException>(() => portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolio, "blah"));
    }

    [Fact]
    public void ValidateAccessToPortfolioOrThrow_ByPortfolioAndPortfolioExistsAndOwnedByUser_ThrowsNoException()
    {
        // arrange
        var portfolio = new Portfolio { UserId = "User1" };

        // act & assert
        var exception = Record.Exception(() => portfolioAuthorizationService.ValidateAccessToPortfolioOrThrow(portfolio, "User1"));
        Assert.Null(exception);
    }
}
