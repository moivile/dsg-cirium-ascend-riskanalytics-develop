using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Business.Validators;
using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Repository.Interfaces;
using System.Net;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using Xunit;
using NSubstitute;

namespace RiskAnalytics.Business.Tests.Validators
{
    public class PortfolioValidatorTests
    {
        private readonly IPortfoliosRepository portfoliosRepositoryMock;
        private readonly IPortfolioValidator portfolioValidator;

        public PortfolioValidatorTests()
        {
            portfoliosRepositoryMock = Substitute.For<IPortfoliosRepository>();
            portfolioValidator = new PortfolioValidator(portfoliosRepositoryMock);
        }

        [Fact]
        public async Task IsValidOrThrow_NameNotUnique_EntityValidationException()
        {
            // arrange
            portfoliosRepositoryMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
                .Returns(false);

            var portfolio = new Portfolio();

            // act & assert
            var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await portfolioValidator.IsValidOrThrow(portfolio));
            Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
            Assert.Equal(ValidationMessages.PortfolioNameIsNotUnique, exception.Message);
        }

        [Fact]
        public async Task IsValidOrThrow_NameUniqueOneAircraft_ThrowsNoException()
        {
            // arrange
            portfoliosRepositoryMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
                .Returns(true);

            var portfolio = new Portfolio
            {
                Name = "TestPortfolio",
                Aircraft = new List<PortfolioAircraft>
                {
                   new PortfolioAircraft()
                }
            };

            // act & assert
            var exception = await Record.ExceptionAsync(async () => await portfolioValidator.IsValidOrThrow(portfolio));
            Assert.Null(exception);
        }

        [Fact]
        public async Task IsValidOrThrow_NameGreaterThen100_EntityValidationException()
        {
            // arrange
            portfoliosRepositoryMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
                .Returns(true);

            var portfolio = new Portfolio
            {
                Name = "blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah",
                Aircraft = new List<PortfolioAircraft>
                {
                   new PortfolioAircraft()
                }
            };

            // act & assert
            var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await portfolioValidator.IsValidOrThrow(portfolio));
            Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
            Assert.Equal(ValidationMessages.PortfolioNameIsGreaterThen100, exception.Message);
        }

        [Fact]
        public async Task IsValidOrThrow_NameContainsHtmlTag_EntityValidationException()
        {
            // arrange
            portfoliosRepositoryMock.IsNameUnique(Arg.Any<string>(), Arg.Any<string>())
                .Returns(true);

            var portfolio = new Portfolio
            {
                Name = "A <a href>Name</a>",
                Aircraft = new List<PortfolioAircraft>
                {
                   new PortfolioAircraft()
                }
            };

            // act & assert
            var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await portfolioValidator.IsValidOrThrow(portfolio));
            Assert.Equal(HttpStatusCode.UnprocessableEntity, exception.HttpStatusCode);
            Assert.Equal(ValidationMessages.PortfolioNameContainsHtmlTags, exception.Message);
        }
    }
}
