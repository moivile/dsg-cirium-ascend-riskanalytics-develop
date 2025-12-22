using Microsoft.AspNetCore.Mvc;
using RiskAnalytics.Api.Controllers;
using Xunit;

namespace RiskAnalytics.Api.Tests.Controllers
{
    public class HealthCheckControllerTests
    {
        [Fact]
        public void LoadBalancer_Should_Return_Ok_StatusCode()
        {
            // Arrange
            var controller = new HealthCheckController();

            // Act
            var result = controller.LoadBalancer() as OkResult;

            // Assert
            Assert.NotNull(result);
        }
    }
}
