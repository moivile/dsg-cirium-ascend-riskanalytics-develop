using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using RiskAnalytics.Api.IoC;
using log4net;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Mvc.Authorization;
using RiskAnalytics.Api;
using RiskAnalytics.Api.Authorization;
using RiskAnalytics.Api.Interfaces;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using RiskAnalytics.Api.Repository;
using RiskAnalytics.Api.Services;
using System.Reflection;
using System.Security.Claims;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var configuration = LoadConfiguration(new RuntimeEnvironment());

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.LoadApplicationServices(configuration);
builder.Services.AddMemoryCache();
var riskanalyticsRepositoryConfiguration = configuration.GetSection("SnowflakeRepository").Get<RiskanalyticsRepositoryConfiguration>();

RiskAnalyticsHealthCheck.ConfigureHealthCheck(builder.Services, riskanalyticsRepositoryConfiguration);

builder.WebHost.ConfigureKestrel(options => { options.ListenAnyIP(8054); });

// Authorization and authentication
var defaultAuthorizationPolicy = new AuthorizationPolicyBuilder()
    .AddRequirements(new RiskAnalyticsUserRequirement()).Build();

builder.Services.AddControllers(mvcOptions => { mvcOptions.Filters.Add(new AuthorizeFilter(defaultAuthorizationPolicy)); });

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{configuration.GetValue<string>("Auth0:Domain")}/";
        options.Audience = configuration.GetValue<string>("Auth0:Audience");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            NameClaimType = ClaimTypes.NameIdentifier
        };
    });

// Logging
var buildVersion = builder.Configuration.GetValue<string>("BUILD_VERSION");
GlobalContext.Properties["build_version"] = string.IsNullOrWhiteSpace(buildVersion)
    ? Assembly.GetEntryAssembly()?.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion
    : buildVersion;
GlobalContext.Properties["environment_name"] = builder.Configuration.GetValue<string>("DOTNET_ENVIRONMENT");

builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddLog4Net(log4NetConfigFile: "log4net.config");
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        corsPolicyBuilder =>
        {
            corsPolicyBuilder
                .SetIsOriginAllowed(_ => true)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

builder.Services.AddResponseCompression(options => { options.EnableForHttps = true; });

builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.HttpOnly = HttpOnlyPolicy.Always;
    options.Secure = CookieSecurePolicy.Always;
});

builder.Services.AddHsts(options =>
{
    options.Preload = false;
    options.IncludeSubDomains = false;
    options.MaxAge = TimeSpan.FromHours(1);
});

var app = builder.Build();

app.MapHealthChecks("/api/riskanalytics/healthcheck/status",
    new HealthCheckOptions
    {
        Predicate = (check) => check.Tags.Contains("dotnet"),
        ResponseWriter = RiskAnalyticsHealthCheck.WriteResponse
    });

app.UseHttpsRedirection();
app.UseCookiePolicy();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseResponseCompression();

app.UseMiddleware<RiskAnalyticsExceptionMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.Run();

IConfiguration LoadConfiguration(IRuntimeEnvironment runtimeEnvironment)
{
    var configurationBuilder = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
        .AddJsonFile($"appsettings.{runtimeEnvironment.EnvironmentName}.json", optional: true, reloadOnChange: true)
        .AddEnvironmentVariables();

    return configurationBuilder.Build();
}
