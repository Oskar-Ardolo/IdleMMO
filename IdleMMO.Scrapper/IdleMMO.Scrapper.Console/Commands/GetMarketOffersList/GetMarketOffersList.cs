using IdleMMO.Scrapper.Models.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IdleMMO.Scrapper.Behaviors.DI;
using IdleMMO.Scrapper.Behaviors;

namespace IdleMMO.Scrapper.Console.Commands.GetMarketOffersList
{
    public class GetMarketOffersList : ICommand
    {
        private GetMarketOffersListOptions _options;
        private readonly ILogger<GetMarketOffersList> _logger;
        private readonly Settings _settings;
        private readonly IScrapBehavior<GetMarketOffersListBehavior> _behavior;

        public GetMarketOffersList(GetMarketOffersListOptions options, 
                                    ILogger<GetMarketOffersList> logger, 
                                    IOptions<Settings> settings,
                                    IScrapBehavior<GetMarketOffersListBehavior> behavior)
        {
            _options = options;
            _logger = logger;
            _settings = settings.Value;
            _behavior = behavior;

        }

        public async Task ExecuteAsync()
        {
            _logger.LogInformation("Running GetMarketOffersList with options : ");
            _logger.LogInformation($"Limit = {_options.Limit}");
            _logger.LogInformation($"Offset = {_options.Offset}");
            string[] args = [_options.Limit, _options.Offset];
            await _behavior.Run(args);
        } 
    }
}
