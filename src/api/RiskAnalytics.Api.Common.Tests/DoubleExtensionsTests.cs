using Xunit;

namespace RiskAnalytics.Api.Common.Tests;

public class DoubleExtensionsTests
{
    [Theory]
    [InlineData(0.5,0)]
    [InlineData(0.6, 1)]
    public void RoundDown_ReturnExpectedValue(double inputValue, int expectedValue)
    {
        // act & assert
        var result = inputValue.RoundDown();
        Assert.Equal(expectedValue, result);
    }

    [Theory]
    [InlineData(90.0,1.5)]
    [InlineData(120.0, 2.0)]
    public void ConvertMinutesIntoHoursAndRoundOff_ReturnExpectedValue(double inputValue, double expectedValue)
    {
        // act & assert
        var result = DoubleExtensions.ConvertMinutesIntoHoursAndRoundOff(inputValue);
        Assert.Equal(expectedValue, result);
    }
}
