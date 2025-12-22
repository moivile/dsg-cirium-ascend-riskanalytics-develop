using MapsterMapper;
using Microsoft.Extensions.Caching.Memory;
using NSubstitute;
using RiskAnalytics.Api.Business.Services;
using RiskAnalytics.Api.Business.Services.Interfaces;
using RiskAnalytics.Api.Common;
using RiskAnalytics.Api.Model;
using RiskAnalytics.Api.Repository;
using RiskAnalytics.Api.Repository.Entities.DataPlatform;
using RiskAnalytics.Api.Repository.Models;
using System.Security.Claims;
using Xunit;

namespace RiskAnalytics.Business.Tests.Services;

public class AircraftServiceTests
{
    private Api.Repository.Dataplatform.Interfaces.IAircraftRepository aircraftRepositoryMock;
    private readonly IAircraftService aircraftService;
    private readonly IMapper mapperMock;
    private readonly List<Aircraft> aircraft;
    private readonly IMemoryCache memoryCacheMock;
    public AircraftServiceTests()
    {
        aircraftRepositoryMock = Substitute.For<Api.Repository.Dataplatform.Interfaces.IAircraftRepository>();
        mapperMock = Substitute.For<IMapper>();
        memoryCacheMock = Substitute.For<IMemoryCache>();

        aircraftService = new AircraftService(aircraftRepositoryMock, mapperMock, memoryCacheMock);

        aircraft = new List<Aircraft>
        {
            new Aircraft
            {
                AircraftId = 1,
                AircraftAgeYears = 5,
                AircraftSerialNumber = "xxx",
                AircraftAllHistory = new List<AircraftHistory>
            {
                new AircraftHistory
                {
                    IsCurrent = true,
                    Operator = "BA",
                    OperatorCountry = "UK",
                    OperatorCountryId =1,
                    OperatorOrganizationId = 9,
                    AircraftStatusHistory = new AircraftStatusHistory
                    {
                        Status = "Retired"
                    },
                    AircraftConfiguration = new AircraftConfiguration
                    {
                        AircraftFamily = "787",
                        AircraftManufacturer = "Boeing",
                        AircraftManufacturerOrganizationId = 5,
                        AircraftType = "Test Wing",
                        AircraftTypeId = 4,
                        AircraftSeries = "AAA",
                        AircraftSeriesId = 6
                    }
                }
            }
            },

            new Aircraft
            {
                AircraftId = 2,
                AircraftAgeYears = 5,
                AircraftSerialNumber = "xxx",
                AircraftAllHistory = new List<AircraftHistory>
            {
                new AircraftHistory
                {
                    IsCurrent = true,
                    Operator = "TUI",
                    OperatorCountry = "Spain",
                    OperatorCountryId =2,
                    OperatorOrganizationId = 2,
                    AircraftStatusHistory = new AircraftStatusHistory
                    {
                        Status = "Retired"
                    },
                    AircraftConfiguration = new AircraftConfiguration
                    {
                        AircraftFamily = "787",
                        AircraftManufacturer = "Boeing",
                        AircraftManufacturerOrganizationId = 5,
                        AircraftType = "Single Wing",
                        AircraftTypeId = 2,
                        AircraftSeries = "XXX",
                        AircraftSeriesId = 4
                    }
                }
            }
            },

            new Aircraft
            {
                AircraftId = 3,
                AircraftAgeYears = 5,
                AircraftSerialNumber = "xxx",
                AircraftAllHistory = new List<AircraftHistory>
            {
                new AircraftHistory
                {
                    IsCurrent = true,
                    Operator = "AA",
                    AircraftRegistrationNumber = "xxx",
                    AircraftStatusHistory = new AircraftStatusHistory
                    {
                        Status = "Retired"
                    },
                    OperatorCountry = "Belgium",
                    OperatorCountryId =3,
                    OperatorOrganizationId = 1,
                    AircraftConfiguration = new AircraftConfiguration
                    {
                        AircraftFamily = "787",
                        AircraftManufacturer = "Airbus",
                        AircraftManufacturerOrganizationId = 7,
                        AircraftType = "Single Wing",
                        AircraftTypeId = 2,
                        AircraftSeries = "XXX",
                        AircraftSeriesId = 4
                    }
                }
            }
            }
        };
    }

    [Fact]
    public async Task Search_NoParams_ThreeAircraft()
    {
        // arrange

        var mappedAircraft = new List<AircraftModel>
        {
            new AircraftModel
            {
                AircraftId = 1
            },
            new AircraftModel
            {
                AircraftId = 2
            },
            new AircraftModel
            {
                AircraftId = 3
            }
        };

        object? cachedResult = new AircraftSearchModel();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        mapperMock.Map<List<AircraftModel>>(Arg.Any<IEnumerable<Aircraft>>())
            .Returns(mappedAircraft);

        var searchAircraftRequest = new SearchAircraftParameters();

        // act
        var result = await aircraftService.Search(searchAircraftRequest);

        // assert
        Assert.Equal(3, result.AircraftList?.Count());
    }

    [Fact]
    public async Task Search_NoParams_PopulatedManufacturersWith2Options()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>
        {
            new AircraftSearchFilterOption
            (
                1,
                "xxx",
                AircraftSearchFilterOptionType.Manufacturer
            ),
            new AircraftSearchFilterOption
            (
                2,
                "bbb",
                AircraftSearchFilterOptionType.Manufacturer
            )
        };

        var request = new SearchAircraftParameters();
        aircraftRepositoryMock.GetSearchFilterOptions(request).Returns(options);

        object? cachedResult = new AircraftSearchModel();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.Equal(2, result.Manufacturers?.Count());
    }

    [Fact]
    public async Task Search_NoParams_PopulatedAircraftTypesWith2Options()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>
        {
            new AircraftSearchFilterOption
            (
                1,
                "xxx",
                AircraftSearchFilterOptionType.Type
            ),
            new AircraftSearchFilterOption
            (
                2,
                "bbb",
                AircraftSearchFilterOptionType.Type
            )
        };

        var request = new SearchAircraftParameters();

        aircraftRepositoryMock.GetSearchFilterOptions(request).Returns(options);

        object? cachedResult = new AircraftSearchModel();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.Equal(2, result.AircraftTypes?.Count());
    }

    [Fact]
    public async Task Search_NoParams_PopulatedAircraftSeriesWith2Options()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>
        {
            new AircraftSearchFilterOption
            (
                1,
                "xxx",
                AircraftSearchFilterOptionType.MasterSeries
            ),
            new AircraftSearchFilterOption
            (
                2,
                "bbb",
                AircraftSearchFilterOptionType.MasterSeries
            )
        };

        var request = new SearchAircraftParameters();
        aircraftRepositoryMock.GetSearchFilterOptions(request).Returns(options);

        object? cachedResult = new AircraftSearchModel();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.Equal(2, result.AircraftMasterSeries?.Count());
    }

    [Fact]
    public async Task Search_NoParams_PopulatedLessorsWith2Options()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>
        {
            new AircraftSearchFilterOption
            (
                1,
                "xxx",
                AircraftSearchFilterOptionType.Lessor
            ),
            new AircraftSearchFilterOption
            (
                2,
                "bbb",
                AircraftSearchFilterOptionType.Lessor
            )
        };

        var request = new SearchAircraftParameters();
        aircraftRepositoryMock.GetSearchFilterOptions(request).Returns(options);

        object? cachedResult = new AircraftSearchModel();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.Equal(2, result.Lessors?.Count());
    }

    [Fact]
    public async Task Search_NoParams_PopulatedAircraftOperatorsWith3Options()
    {
        var options = new List<AircraftSearchFilterOption>
        {
            new AircraftSearchFilterOption
            (
                1,
                "xxx",
                AircraftSearchFilterOptionType.Operator
            ),
            new AircraftSearchFilterOption
            (
                2,
                "bbb",
                AircraftSearchFilterOptionType.Operator
            ),
            new AircraftSearchFilterOption
            (
                3,
                "ccc",
                AircraftSearchFilterOptionType.Operator
            )
        };

        // arrange
        var request = new SearchAircraftParameters();

        aircraftRepositoryMock.GetSearchFilterOptions(request).Returns(options);

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.Equal(3, result.AircraftOperators?.Count());
    }

    [Fact]
    public async Task Search_NoParams_PopulatedAircraftOperatorCountriesWith2Options()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>
        {
            new AircraftSearchFilterOption
            (
                1,
                "xxx",
                AircraftSearchFilterOptionType.OperatorCountry
            ),
            new AircraftSearchFilterOption
            (
                2,
                "bbb",
                AircraftSearchFilterOptionType.OperatorCountry
            )
        };

        object? cachedResult = new AircraftSearchModel();
        var request = new SearchAircraftParameters();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        aircraftRepositoryMock.GetSearchFilterOptions(request).Returns(options);

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.Equal(2, result.OperatorCountries?.Count());
    }

    [Fact]
    public async Task Search_NoParams_PopulatedTotalCount()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>
        {
            new AircraftSearchFilterOption
            (
                0,
                "9999",
                AircraftSearchFilterOptionType.TotalCount
            )
        };

        var request = new SearchAircraftParameters();
        aircraftRepositoryMock.GetSearchFilterOptions(request).Returns(options);

        object? cachedResult = new AircraftSearchModel();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());


        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.Equal(9999, result.TotalCount);
    }

    [Fact]
    public async Task Search_NoTotalCountReturned_TotalCountSetToZero()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>();
        var request = new SearchAircraftParameters();

        aircraftRepositoryMock.GetSearchFilterOptions(request).Returns(options);

        object? cachedResult = new AircraftSearchModel();

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());


        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task Search_KeywordIsNullAndSearchRequestIsCached_GetResponseFromCache()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>();
        var anyListArg = Arg.Any<List<Claim>>();

        object? cachedResult = new AircraftSearchModel
        {
            AircraftList = new List<AircraftModel>
            {
                new AircraftModel()
            }
        };

        var cacheKey = "RiskAnalytics_AircraftSearch_Results_skip0_take200";

        memoryCacheMock.TryGetValue(cacheKey, out anyListArg).Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        var request = new SearchAircraftParameters();

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.NotNull(result.AircraftList);
        Assert.Single(result.AircraftList);
        await aircraftRepositoryMock.DidNotReceive().Search(Arg.Any<SearchAircraftParameters>());
    }

    [Fact]
    public async Task Search_KeywordIsNullAllOtherParametersAreSetAndSearchRequestIsCached_GetResponseFromCacheWithExpectedCacheKey()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>();
        var anyListArg = Arg.Any<List<Claim>>();

        object? cachedResult = new AircraftSearchModel
        {
            AircraftList = new List<AircraftModel>
            {
                new AircraftModel()
            }
        };

        var expectedCacheKey = $"{CacheSettings.CacheUnitPrefixForAircraftSearchResults}m1_s5_t4_c3_o2_l6_as7_skip0_take200";

        memoryCacheMock.TryGetValue(expectedCacheKey, out anyListArg).Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        var request = new SearchAircraftParameters
        {
            ManufacturerIds = new List<int> { 1 },
            AircraftOperatorIds = new List<int> { 2 },
            OperatorCountryIds = new List<int> { 3 },
            AircraftTypeIds = new List<int> { 4 },
            AircraftMasterSeriesIds = new List<int> { 5 },
            LessorIds = new List<int> { 6 },
            StatusIds = new List<int> { 7 }
        };

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.NotNull(result.AircraftList);
        Assert.Single(result.AircraftList);
        await aircraftRepositoryMock.DidNotReceive().Search(Arg.Any<SearchAircraftParameters>());
    }

    [Fact]
    public async Task Search_KeywordIsNullSkipIs5AllOtherParametersAreSetAndSearchRequestIsCached_GetResponseFromCacheWithExpectedCacheKey()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>();
        var anyListArg = Arg.Any<List<Claim>>();

        object? cachedResult = new AircraftSearchModel
        {
            AircraftList = new List<AircraftModel>
            {
                new AircraftModel()
            }
        };

        var expectedCacheKey = $"{CacheSettings.CacheUnitPrefixForAircraftSearchResults}m1_s5_t4_c3_o2_skip5_take10";

        memoryCacheMock.TryGetValue(expectedCacheKey, out anyListArg).Returns(x =>
        {
            x[1] = cachedResult;
            return true;
        });

        var request = new SearchAircraftParameters
        {
            ManufacturerIds = new List<int> { 1 },
            AircraftOperatorIds = new List<int> { 2 },
            OperatorCountryIds = new List<int> { 3 },
            AircraftTypeIds = new List<int> { 4 },
            AircraftMasterSeriesIds = new List<int> { 5 },
            Skip = 5,
            Take = 10
        };

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.NotNull(result.AircraftList);
        Assert.Single(result.AircraftList);
        await aircraftRepositoryMock.DidNotReceive().Search(Arg.Any<SearchAircraftParameters>());
    }

    [Fact]
    public async Task Search_KeywordIsNotNull_GetResponseFromRepositorySkippingCache()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>();

        object? cachedResult = new AircraftSearchModel
        {
            AircraftList = new List<AircraftModel>
            {
                new AircraftModel
                {
                    AircraftId = 1
                }
            }
        };

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(true);

        var mappedAircraft = new List<AircraftModel>
        {
            new AircraftModel
            {
                AircraftId = 2
            }
        };

        mapperMock.Map<List<AircraftModel>>(Arg.Any<IEnumerable<Aircraft>>())
            .Returns(mappedAircraft);

        var request = new SearchAircraftParameters
        {
            Keyword = "air"
        };

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.NotNull(result.AircraftList);
        Assert.Single(result.AircraftList);
        Assert.Equal(mappedAircraft.First().AircraftId, result.AircraftList.First().AircraftId);
        await aircraftRepositoryMock.Received().Search(Arg.Any<SearchAircraftParameters>());
    }

    [Fact]
    public async Task Search_KeywordIsNullAndSearchRequestIsNotCached_GetResponseFromRepository()
    {
        // arrange
        var options = new List<AircraftSearchFilterOption>();

        object? cachedResult = new AircraftSearchModel
        {
            AircraftList = new List<AircraftModel>
            {
                new AircraftModel
                {
                    AircraftId = 1
                }
            }
        };

        memoryCacheMock.TryGetValue(Arg.Any<string>(), out cachedResult).Returns(false);
        memoryCacheMock.CreateEntry(Arg.Any<object>()).Returns(Substitute.For<ICacheEntry>());

        var mappedAircraft = new List<AircraftModel>
        {
            new AircraftModel
            {
                AircraftId = 2
            }
        };

        mapperMock.Map<List<AircraftModel>>(Arg.Any<IEnumerable<Aircraft>>())
            .Returns(mappedAircraft);

        var request = new SearchAircraftParameters();

        // act
        var result = await aircraftService.Search(request);

        // assert
        Assert.NotNull(result.AircraftList);
        Assert.Single(result.AircraftList);
        Assert.Equal(mappedAircraft.First().AircraftId, result.AircraftList.First().AircraftId);
        await aircraftRepositoryMock.Received().Search(Arg.Any<SearchAircraftParameters>());
    }

}
