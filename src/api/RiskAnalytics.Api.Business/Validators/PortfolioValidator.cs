using RiskAnalytics.Api.Business.Validators.Interfaces;
using RiskAnalytics.Api.Repository.Interfaces;
using RiskAnalytics.Api.Common.Exceptions;
using RiskAnalytics.Api.Common.Messages;
using RiskAnalytics.Api.Repository.Entities.Portfolios;
using System.Text.RegularExpressions;

namespace RiskAnalytics.Api.Business.Validators;
public class PortfolioValidator : IPortfolioValidator
{
    private readonly IPortfoliosRepository portfoliosRepository;

    public PortfolioValidator(
    IPortfoliosRepository portfoliosRepository)
    {
        this.portfoliosRepository = portfoliosRepository;
    }

    public async Task IsValidOrThrow(Portfolio portfolio)
    {
        if (!await IsNameUnique(portfolio.Name, portfolio.UserId))
        {
            throw new EntityValidationException(ValidationMessages.PortfolioNameIsNotUnique);
        }

        if (portfolio.Name.Length > 100)
        {
            throw new EntityValidationException(ValidationMessages.PortfolioNameIsGreaterThen100);
        }

        var htmlTagRegex = new Regex(@"<\s*([^ >]+)[^>]*>.*?<\s*/\s*\1\s*>");

        if(htmlTagRegex.IsMatch(portfolio.Name))
        {
            throw new EntityValidationException(ValidationMessages.PortfolioNameContainsHtmlTags);
        }
    }

    private async Task<bool> IsNameUnique(string name, string userId)
    {
        return await portfoliosRepository.IsNameUnique(name, userId);
    }
}
