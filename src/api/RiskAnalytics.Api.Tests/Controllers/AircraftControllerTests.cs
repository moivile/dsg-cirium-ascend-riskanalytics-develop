using MapsterMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using NSubstitute;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Controllers;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Requests;
using RiskAnalytics.Api.Responses;
using System.Security.Claims;
using Xunit;

namespace RiskAnalytics.Api.Tests.Controllers
{
    public class AircraftControllerTests
    {
        private readonly IAircraftService aircraftServiceMock;
        private readonly AircraftController aircraftController;
        private readonly IMapper mapper;

        public AircraftControllerTests()
        {
            aircraftServiceMock = Substitute.For<IAircraftService>();
            mapper = new Mapper();

            aircraftController = new AircraftController(aircraftServiceMock, mapper);
        }

        [Fact]
        public async Task Search_WithoutKeyword_CalledServiceWithNullKeyword()
        {
            // Arrange
            var request = new Dictionary<string, StringValues>() 
                            {
                                {"keyword", new StringValues("") }
                            };

            var searchAircraftRequest = new SearchAircraftRequest();

            aircraftController.ControllerContext = new TestControllerContextBuilder().GetContextWithQuery(request);

            // Act
            var result = (await aircraftController.Search(searchAircraftRequest)).Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            await aircraftServiceMock.Received().Search(Arg.Any<SearchAircraftParameters>());
        }

        [Fact]
        public async Task Search_WithAKeyword_CalledServiceWithTheKeyword()
        {
            // Arrange
            var request = new Dictionary<string, StringValues>()
                            {
                                {"keyword", new StringValues("boeing") }
                            };

            var searchAircraftRequest = new SearchAircraftRequest
            {
                Keyword= "boeing"
            };

            aircraftController.ControllerContext = new TestControllerContextBuilder().GetContextWithQuery(request);

            // Act
            var result = (await aircraftController.Search(searchAircraftRequest)).Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            await aircraftServiceMock.Received().Search(Arg.Is<SearchAircraftParameters>(i => i.Keyword == "boeing"));
        }

        [Fact]
        public async Task Search_SkipSetTo10_CallServiceWith10ToSkip()
        {
            // Arrange
            aircraftController.ControllerContext = new TestControllerContextBuilder().GetContext();

            var searchAircraftRequest = new SearchAircraftRequest
            {
                Skip = 10
            };

            // Act
            var result = (await aircraftController.Search(searchAircraftRequest)).Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            await aircraftServiceMock.Received().Search(Arg.Is<SearchAircraftParameters>(i => i.Skip == 10));
        }

        [Fact]
        public async Task Search_TakeSetTo10_CallServiceWith10ToTake()
        {
            // Arrange
            aircraftController.ControllerContext = new TestControllerContextBuilder().GetContext();

            var searchAircraftRequest = new SearchAircraftRequest
            {
                Take= 10
            };

            // Act
            var result = (await aircraftController.Search(searchAircraftRequest)).Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            await aircraftServiceMock.Received().Search(Arg.Is<SearchAircraftParameters>(i => i.Take == 10));
        }
                
        [Fact]
        public async Task Search_Successful_TwoAircraft()
        {
            // Arrange
            var searchResult = new AircraftSearchModel
            {
                AircraftList = new List<AircraftModel>
                        {
                            new()
                            {
                                AircraftId = 123
                            },
                            new()
                            {
                                AircraftId = 55
                            }
                        }
            };

            var searchAircraftRequest = new SearchAircraftRequest();

            aircraftServiceMock.Search(Arg.Any<SearchAircraftParameters>()).Returns(searchResult);

            var claimsIdentity = new ClaimsIdentity(new Claim[] { new(ClaimTypes.NameIdentifier, SharedTestConsts.User) });
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
            var context = new DefaultHttpContext
            {
                User = claimsPrincipal
            };

            var controllerContext = new ControllerContext { HttpContext = context };

            aircraftController.ControllerContext = controllerContext;

            // Act
            var result = (await aircraftController.Search(searchAircraftRequest)).Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            var value = result.Value as AircraftSearchResponse;
            Assert.NotNull(value);
            Assert.NotNull(value.AircraftList);
            Assert.Equal(2, value.AircraftList.Count());
        }
    }
}
