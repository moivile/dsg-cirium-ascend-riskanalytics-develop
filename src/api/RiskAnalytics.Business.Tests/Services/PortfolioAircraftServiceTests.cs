
using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Repository.Interfaces;
using Xunit;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using MapsterMapper;
using RiskAnalytics.Api.Model;
using NSubstitute;

namespace RiskAnalytics.Business.Tests.Services
{
    public class PortfolioAircraftServiceTests
    {
        private readonly IPortfolioAircraftRepository portfolioAircraftRepositoryMock;
        private readonly IPortfolioAuthorizationService portfolioAuthorizationServiceMock;
        private readonly PortfolioAircraftService portfolioAircraftService;
        private readonly IMapper mapperMock;

        public PortfolioAircraftServiceTests()
        {
            portfolioAircraftRepositoryMock = Substitute.For<IPortfolioAircraftRepository>();
            portfolioAuthorizationServiceMock = Substitute.For<IPortfolioAuthorizationService>();
            mapperMock = Substitute.For<IMapper>();

            portfolioAircraftService = new PortfolioAircraftService(portfolioAuthorizationServiceMock, portfolioAircraftRepositoryMock, mapperMock);
        }

        [Fact]
        public async Task GetAll_PortfolioDoesNotExist_ThrowNotFound()
        {
            // arrange
            portfolioAuthorizationServiceMock
                .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), Arg.Any<string>()))
            .Do(x => { throw new NotFoundException(); });

            // act & assert
            await Assert.ThrowsAsync<NotFoundException>(async () => await portfolioAircraftService.GetAll(1, "blah"));
        }

        [Fact]
        public async Task GetAll_NotServiceUser_DoesNotCallValidateAccessToPortfolioOrThrow()
        {
            // arrange

            // act
            await portfolioAircraftService.GetAll(1, "User1", false);

            // assert
            portfolioAuthorizationServiceMock.Received(1).ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), Arg.Any<string>());
        }

        [Fact]
        public async Task GetAll_ServiceUser_DoesNotCallValidateAccessToPortfolioOrThrow()
        {
            // arrange

            // act
           await portfolioAircraftService.GetAll(1, "User1", true);

            // assert
            portfolioAuthorizationServiceMock.Received(0).ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), Arg.Any<string>());
        }

        [Fact]
        public async Task GetAll_UserDoesNotOwnPortfolio_ThrowForbidden()
        {
            // arrange
            portfolioAuthorizationServiceMock
                .When(x => x.ValidateAccessToPortfolioOrThrow(Arg.Any<int>(), Arg.Any<string>()))
            .Do(x => { throw new ForbiddenException(); });

            // act & assert
            await Assert.ThrowsAsync<ForbiddenException>(async () => await portfolioAircraftService.GetAll(1, "User1"));
        }

        [Fact]
        public async Task GetAll_PortfolioExistsAndOwnedByUser_ReturnPortfolio()
        {
            // arrange
            var response = new List<AircraftModel> { new() { AircraftId = 5 } };
            mapperMock.Map<List<AircraftModel>>(Arg.Any<IEnumerable<Aircraft>>()).Returns(response);

            // act
            var result = await portfolioAircraftService.GetAll(1, "User1");

            // assert
            Assert.NotNull(result);
            Assert.Equal(5, result.First().AircraftId);
        }
    }
}
