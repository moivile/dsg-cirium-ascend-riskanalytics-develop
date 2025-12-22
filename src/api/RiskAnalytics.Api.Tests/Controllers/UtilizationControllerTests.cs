using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Controllers;
using System.Security.Claims;
using Xunit;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository.Models;
using RiskAnalytics.Api.Requests;
using NSubstitute;
using RiskAnalytics.Api.Business.Validators.Interfaces;

namespace RiskAnalytics.Api.Tests.Controllers
{
    public class UtilizationControllerTests
    {
        private readonly IUtilizationService utilizationServiceMock;
        private readonly IMonthlyUtilizationPerAircraftRequestValidator monthlyUtilizationPerAircraftRequestValidator;
        private readonly IPortfolioAuthorizationService portfolioAuthorizationService;

        private readonly UtilizationController utilizationController;

        public UtilizationControllerTests()
        {
            utilizationServiceMock = Substitute.For<IUtilizationService>();
            monthlyUtilizationPerAircraftRequestValidator = Substitute.For<IMonthlyUtilizationPerAircraftRequestValidator>();
            portfolioAuthorizationService = Substitute.For<IPortfolioAuthorizationService>();

            utilizationController = new UtilizationController(utilizationServiceMock, monthlyUtilizationPerAircraftRequestValidator, portfolioAuthorizationService);
        }

        [Fact]
        public async Task GetMonthlyUtilization_ShouldReturnOk()
        {
            // Arrange
            const int portfolioId = 1;
            const string user = "user1";
            const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
            IReadOnlyCollection<int> groupByFilterIds = new[] { 1, 2, 3 };
            const int operatorId = 1;
            const int lessorId = 1;
            const bool isEmissions = true;
            const bool isHoursAndCycle = false;

            var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, user) });
            var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(claimsIdentity) } };
            utilizationController.ControllerContext = controllerContext;

            var portfolioAircraftServiceMonthlyUtilization = new List<IEnumerable<MonthlyUtilization>>
            {
                new List<MonthlyUtilization>(),
                new List<MonthlyUtilization>()
            };

            utilizationServiceMock.GetMonthlyUtilization(
                portfolioId,
                controllerContext.HttpContext.User,
                groupBy,
                groupByFilterIds,
                operatorId,
                lessorId,
                true, isEmissions, isHoursAndCycle).Returns(portfolioAircraftServiceMonthlyUtilization);

            // Act
            var monthlyUtilizationResult = (await utilizationController.GetMonthlyUtilization(new GetMonthlyUtilizationRequest
            {
                PortfolioId = portfolioId,
                GroupBy = groupBy,
                GroupByFilterIds = groupByFilterIds,
                OperatorId = operatorId,
                LessorId = lessorId,
                IncludeBaseline = true,
                IsEmissions = isEmissions,
                IsHoursAndCycle = isHoursAndCycle
            })).Result as OkObjectResult;

            // Assert
            Assert.NotNull(monthlyUtilizationResult);
            Assert.IsType<OkObjectResult>(monthlyUtilizationResult);

            await utilizationServiceMock.Received().GetMonthlyUtilization(
                portfolioId,
                controllerContext.HttpContext.User,
                groupBy,
                groupByFilterIds,
                operatorId,
                lessorId,
                true, isEmissions, isHoursAndCycle);

            var monthlyUtilization = monthlyUtilizationResult.Value as IEnumerable<IEnumerable<MonthlyUtilization>>;
            Assert.NotNull(monthlyUtilization);
            Assert.Equal(portfolioAircraftServiceMonthlyUtilization, monthlyUtilization);
        }

        [Fact]
        public async Task GetMonthlyUtilization_WithOnlyEmissionData_ShouldReturnOk()
        {
            // Arrange
            const int portfolioId = 1;
            const string user = "user1";
            const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
            IReadOnlyCollection<int> groupByFilterIds = new[] { 1, 2, 3 };
            const int operatorId = 1;
            const int lessorId = 1;
            const bool isEmissions = true;
            const bool isHoursAndCycle = false;

            var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, user) });
            var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(claimsIdentity) } };
            utilizationController.ControllerContext = controllerContext;

            var portfolioAircraftServiceMonthlyUtilization = new List<IEnumerable<MonthlyUtilization>>
            {
                new List<MonthlyUtilization>(),
                new List<MonthlyUtilization>()
            };

            utilizationServiceMock.GetMonthlyUtilization(
                portfolioId,
                controllerContext.HttpContext.User,
                groupBy,
                groupByFilterIds,
                operatorId,
                lessorId,
                true, isEmissions, isHoursAndCycle).Returns(portfolioAircraftServiceMonthlyUtilization);

            // Act
            var monthlyUtilizationResult = (await utilizationController.GetMonthlyUtilization(new GetMonthlyUtilizationRequest
            {
                PortfolioId = portfolioId,
                GroupBy = groupBy,
                GroupByFilterIds = groupByFilterIds,
                OperatorId = operatorId,
                LessorId = lessorId,
                IncludeBaseline = true,
                IsEmissions = isEmissions,
                IsHoursAndCycle = isHoursAndCycle
            })).Result as OkObjectResult;

            // Assert
            Assert.NotNull(monthlyUtilizationResult);
            Assert.IsType<OkObjectResult>(monthlyUtilizationResult);

            await utilizationServiceMock.Received().GetMonthlyUtilization(
                portfolioId,
                controllerContext.HttpContext.User,
                groupBy,
                groupByFilterIds,
                operatorId,
                lessorId,
                true, isEmissions, isHoursAndCycle);

            var monthlyUtilization = monthlyUtilizationResult.Value as IEnumerable<IEnumerable<MonthlyUtilization>>;
            Assert.NotNull(monthlyUtilization);
            Assert.Equal(portfolioAircraftServiceMonthlyUtilization, monthlyUtilization);
        }

        [Fact]
        public async Task GetMonthlyUtilization_WithOnlyHoursAndCycleData_ShouldReturnOk()
        {
            // Arrange
            const int portfolioId = 1;
            const string user = "user1";
            const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
            IReadOnlyCollection<int> groupByFilterIds = new[] { 1, 2, 3 };
            const int operatorId = 1;
            const int lessorId = 1;
            const bool isEmissions = false;
            const bool isHoursAndCycle = true;

            var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, user) });
            var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(claimsIdentity) } };
            utilizationController.ControllerContext = controllerContext;

            var portfolioAircraftServiceMonthlyUtilization = new List<IEnumerable<MonthlyUtilization>>
            {
                new List<MonthlyUtilization>(),
                new List<MonthlyUtilization>()
            };

            utilizationServiceMock.GetMonthlyUtilization(
                portfolioId,
                controllerContext.HttpContext.User,
                groupBy,
                groupByFilterIds,
                operatorId,
                lessorId,
                true, isEmissions, isHoursAndCycle).Returns(portfolioAircraftServiceMonthlyUtilization);

            // Act
            var monthlyUtilizationResult = (await utilizationController.GetMonthlyUtilization(new GetMonthlyUtilizationRequest
            {
                PortfolioId = portfolioId,
                GroupBy = groupBy,
                GroupByFilterIds = groupByFilterIds,
                OperatorId = operatorId,
                LessorId = lessorId,
                IncludeBaseline = true,
                IsEmissions = isEmissions,
                IsHoursAndCycle = isHoursAndCycle
            })).Result as OkObjectResult;

            // Assert
            Assert.NotNull(monthlyUtilizationResult);
            Assert.IsType<OkObjectResult>(monthlyUtilizationResult);

            await utilizationServiceMock.Received().GetMonthlyUtilization(
                portfolioId,
                controllerContext.HttpContext.User,
                groupBy,
                groupByFilterIds,
                operatorId,
                lessorId,
                true, isEmissions, isHoursAndCycle);

            var monthlyUtilization = monthlyUtilizationResult.Value as IEnumerable<IEnumerable<MonthlyUtilization>>;
            Assert.NotNull(monthlyUtilization);
            Assert.Equal(portfolioAircraftServiceMonthlyUtilization, monthlyUtilization);
        }

        [Fact]
        public async Task GetMonthlyUtilization_GroupByIsNullAndIncludeBaselineIsFalse_Throw()
        {
            // Arrange
            MonthlyUtilizationGroup? groupBy = null;
            IReadOnlyCollection<int> groupByFilterIds = new[] { 1, 2, 3 };
            const bool includeBaseLine = false;

            // Act & Assert
            var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await utilizationController.GetMonthlyUtilization(
                new GetMonthlyUtilizationRequest
                {
                    PortfolioId = 1,
                    GroupBy = groupBy,
                    GroupByFilterIds = groupByFilterIds,
                    OperatorId = 2,
                    LessorId = 1,
                    IncludeBaseline = includeBaseLine
                }));

            Assert.Equal(ValidationMessages.GetMonthlyUtilizationRequestRequiresGroupByOrIncludeBaseLine, exception.Message);
        }

        [Fact]
        public async Task GetMonthlyUtilization_GroupByIsNotNullGroupByFilterIdsIsEmpty_Throw()
        {
            // Arrange
            const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
            IReadOnlyCollection<int> groupByFilterIds = Array.Empty<int>();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await utilizationController.GetMonthlyUtilization(
                new GetMonthlyUtilizationRequest
                {
                    PortfolioId = 1,
                    GroupBy = groupBy,
                    GroupByFilterIds = groupByFilterIds,
                    OperatorId = 2,
                    LessorId = 1,
                    IncludeBaseline = false
                }));

            Assert.Equal(ValidationMessages.GetMonthlyUtilizationRequestRequiresGroupByFilterIds, exception.Message);
        }

        [Fact]
        public async Task GetMonthlyUtilization_GroupByIsNotNullGroupByFilterIdsIsNull_Throw()
        {
            // Arrange
            const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
            IReadOnlyCollection<int>? groupByFilterIds = null;

            // Act & Assert
            var exception = await Assert.ThrowsAsync<EntityValidationException>(async () => await utilizationController.GetMonthlyUtilization(
                new GetMonthlyUtilizationRequest
                {
                    PortfolioId = 1,
                    GroupBy = groupBy,
                    GroupByFilterIds = groupByFilterIds,
                    OperatorId = 2,
                    LessorId = 1,
                    IncludeBaseline = false
                }));

            Assert.Equal(ValidationMessages.GetMonthlyUtilizationRequestRequiresGroupByFilterIds, exception.Message);
        }

        [Fact]
        public async Task GetGroupOptions_ShouldReturnOk()
        {
            // Arrange
            const int portfolioId = 1;
            const string user = "user1";
            const int operatorId = 1;
            const int lessorId = 1;

            var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, user) });
            var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(claimsIdentity) } };
            utilizationController.ControllerContext = controllerContext;

            var serviceGroupOptionsModel = new UtilizationGroupOptionsModel();

            utilizationServiceMock.GetGroupOptions(portfolioId, operatorId, lessorId, user).Returns(serviceGroupOptionsModel);

            // Act
            var groupOptionsResult = (await utilizationController.GetGroupOptions(portfolioId, operatorId, lessorId)).Result as OkObjectResult;

            // Assert
            Assert.NotNull(groupOptionsResult);
            Assert.IsType<OkObjectResult>(groupOptionsResult);

            await utilizationServiceMock.Received().GetGroupOptions(portfolioId, operatorId, lessorId, user);

            var groupOptionsModelResult = groupOptionsResult.Value as UtilizationGroupOptionsModel;
            Assert.NotNull(groupOptionsModelResult);
            Assert.Equal(serviceGroupOptionsModel, groupOptionsModelResult);
        }

        [Fact]
        public async Task GetMonthlyUtilizationPerAircraft_ShouldReturnOk()
        {
            // Arrange
            const int portfolioId = 1;
            const int endMonthIndex = 1;
            const int startMonthIndex = 1;
            const int endYear = 2021;
            const int startYear = 2021;
            const int operatorId = 1;
            const int lessorId = 1;
            const string user = "user1";
            const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
            IReadOnlyCollection<int> groupByFilterIds = new[] { 1, 2, 3 };

            var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, user) });
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
            var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(claimsIdentity) } };
            var serviceMonthlyUtilizationPerAircraft = new List<MSNUtilizationPerAircraft>(); // Declare and initialize the variable

            utilizationController.ControllerContext = controllerContext;
            // Act
            var monthlyUtilizationPerAircraftResult = (await utilizationController.GetMonthlyUtilizationPerAircraft(new MonthlyUtilizationPerAircraftRequest
            {
                PortfolioId = portfolioId,
                EndMonthIndex = endMonthIndex,
                StartMonthIndex = startMonthIndex,
                EndYear = endYear,
                StartYear = startYear,
                OperatorId = operatorId,
                LessorId = lessorId,
                GroupBy = groupBy,
                GroupByFilterIds = groupByFilterIds
            })).Result as OkObjectResult;

            Assert.IsType<OkObjectResult>(monthlyUtilizationPerAircraftResult);
        }

        [Fact]
        public async Task GetOperators_ShouldReturnOk()
        {
            // Arrange
            const int portfolioId = 1;
            const int lessorId = 1;
            const string user = "user1";
            const MonthlyUtilizationGroup groupBy = MonthlyUtilizationGroup.AircraftFamily;
            IReadOnlyCollection<int> groupByFilterIds = new[] { 1, 2, 3 };

            var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, user) });
            var controllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(claimsIdentity) } };
            utilizationController.ControllerContext = controllerContext;

            var serviceOperators = new List<IdNamePairModel>
            {
                new(1, "blah"),
                new(2, "wooo")
            };

            utilizationServiceMock.GetOperators(portfolioId, lessorId, groupBy, groupByFilterIds, user).Returns(serviceOperators);

            // Act
            var operatorsResult = (await utilizationController.GetOperators(portfolioId, groupBy, groupByFilterIds, lessorId)).Result as OkObjectResult;

            // Assert
            Assert.NotNull(operatorsResult);
            Assert.IsType<OkObjectResult>(operatorsResult);

            await utilizationServiceMock.Received().GetOperators(portfolioId, lessorId, groupBy, groupByFilterIds, user);

            var operators = operatorsResult.Value as IEnumerable<IdNamePairModel>;
            Assert.NotNull(operators);
            Assert.Equal(serviceOperators, operators);
        }

        [Theory]
        [InlineData(null)]
        [InlineData(new int[0])]
        public async Task GetOperators_GroupByIsNotNullAndGroupByFilterIdsIsNullOrEmpty_ShouldThrow(int[] groupByFilterIds)
        {
            // Act
            var exception = await Assert.ThrowsAsync<EntityValidationException>(async () =>
                await utilizationController.GetOperators(1, MonthlyUtilizationGroup.AircraftFamily, groupByFilterIds, 1));

            // Assert
            Assert.Equal(ValidationMessages.GetMonthlyUtilizationRequestRequiresGroupByFilterIds, exception.Message);
        }
    }
}
