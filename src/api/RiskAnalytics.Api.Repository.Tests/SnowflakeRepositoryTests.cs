using System.Reflection;
using Tomlyn.Model;

namespace RiskAnalytics.Api.Repository.Tests;

public class SnowflakeRepositoryTests
{
    private readonly string testTomlPath;
    private readonly string testConnectionName;

    private void CreateTestTomlFile(string content)
    {
        File.WriteAllText(testTomlPath, content);
    }

    private static TomlTable InvokeGetTomlTableFromConfig(string tomlPath, string connectionName)
    {
        var method = typeof(SnowflakeRepository).GetMethod("GetTomlTableFromConfig",
            BindingFlags.NonPublic | BindingFlags.Static);

        return (TomlTable)method.Invoke(null, new object[] { tomlPath, connectionName });
    }

    private static string InvokeGetConnectionStringFromTomlTable(TomlTable tomlTable)
    {
        var method = typeof(SnowflakeRepository).GetMethod("GetConnectionStringFromTomlTable",
            BindingFlags.NonPublic | BindingFlags.Static);

        return (string)method.Invoke(null, new object[] { tomlTable });
    }

    public void Dispose()
    {
        if (File.Exists(testTomlPath))
        {
            File.Delete(testTomlPath);
        }
    }

    public SnowflakeRepositoryTests()
    {
        testTomlPath = Path.Combine(Path.GetTempPath(), $"test_connections_{Guid.NewGuid()}.toml");
        testConnectionName = "test_connection";
    }


    [Fact]
    public void GetTomlTableFromConfig_ValidConnection_ReturnsTomlTable()
    {
        // Arrange
        CreateTestTomlFile($"{testConnectionName} = {{ user = \"test_user\", key = \"test_key\" }}");

        // Act
        var result = InvokeGetTomlTableFromConfig(testTomlPath, testConnectionName);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("test_user", result["user"]);
        Assert.Equal("test_key", result["key"]);
    }

    [Fact]
    public void GetConnectionStringFromTomlTable_WithValidTable_ReturnsConnectionString()
    {
        // Arrange
        var tomlTable = new TomlTable
        {
            ["user"] = "test user",
            ["key"] = "test key",
            ["host"] = "example.com",
        };

        // Act
        var result = InvokeGetConnectionStringFromTomlTable(tomlTable);

        // Assert
        Assert.Contains("user=test user;", result);
        Assert.Contains("key=test key;", result);
        Assert.Contains("host=example.com;", result);
    }

    [Fact]
    public void GetConnectionStringFromTomlTable_WithPrivateKeyFile_ReplacesPath()
    {
        // Arrange
        var tomlTable = new TomlTable
        {
            ["private key"] = "/home/ubuntu/privatekey.p8"
        };

        // Act
        var result = InvokeGetConnectionStringFromTomlTable(tomlTable);

        // Assert
        Assert.Contains("private key=/home/ubuntu/privatekey.p8;", result);
    }
}
