using RiskAnalytics.Api.Mappers;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Responses;
using Xunit;

namespace RiskAnalytics.Api.Tests.Mappers
{
    public class AssetWatchListDataGridResponseMappingConfigTests
    {
        [Fact]
        public void Map_MapsFromAssetWatchListDataGridModel() { 
            // arrange
            const int numberOfHours = 3;

            var mapper = MapsterForUnitTests.GetMapper<AssetWatchListDataGridResponseMappingConfig>();

            // act
            var response = mapper.Map<AssetWatchListDataGridResponse> (new AssetWatchListGridDataResponseModel
            {
                AssetWatchListDataGrid = new List<AssetWatchListDataGridModel>
                {
                    new()
                    {
                        CurrentGroundEventDurationMinutes = 3 * 60
                    }
                }                
            });

            // assert
            Assert.NotNull(response);
            Assert.NotNull(response.AssetWatchListDataGrid);
            Assert.Equal(numberOfHours, response.AssetWatchListDataGrid.First().CurrentGroundEventDurationHours);
        }
    }
}
