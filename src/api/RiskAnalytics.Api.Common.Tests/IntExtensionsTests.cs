
using Xunit;

namespace RiskAnalytics.Api.Common.Tests;

public class IntExtensionsTests
{

    [Fact]
    public void RoundOffGroundStayHours_WithPostiveIntegerInput()
    {
        int? positiveInteger = 120;
        var result = positiveInteger.ConvertMinutesIntoHoursAndRoundOff();
        // assert
        Assert.True(result > 0);
    }

    [Fact]
    public void RoundOffGroundStayHours_WithNullInput()
    {
        int? positiveInteger = null;
        var result = positiveInteger.ConvertMinutesIntoHoursAndRoundOff();
        // assert
        Assert.True(result == 0);
    }

    [Fact]
    public void RoundOffGroundStayHours_ToReturnFloorRounding()
    {
        int? positiveInteger = 122;
        var actualValue = (double)positiveInteger / 60;
        var result = positiveInteger.ConvertMinutesIntoHoursAndRoundOff();
        // assert
        Assert.True(result < actualValue);
    }

    [Fact]
    public void RoundOffGroundStayHours_ToReturnCeilingRounding()
    {
        int? positiveInteger = 177;
        var actualValue = (double)positiveInteger / 60;
        var result = positiveInteger.ConvertMinutesIntoHoursAndRoundOff();
        // assert
        Assert.True(result > actualValue);
    }
}
