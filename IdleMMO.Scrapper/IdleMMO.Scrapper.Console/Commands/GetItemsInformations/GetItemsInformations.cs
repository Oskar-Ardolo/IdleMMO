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

namespace IdleMMO.Scrapper.Console.Commands.GetItemsInformations
{
    public class GetItemsInformations : ICommand
    {
        private GetItemsInformationsOptions _options;
        private readonly ILogger<GetItemsInformations> _logger;
        private readonly Settings _settings;
        private readonly IScrapBehavior<GetItemsInformationsBehavior> _behavior;

        public GetItemsInformations(GetItemsInformationsOptions options, 
                                    ILogger<GetItemsInformations> logger, 
                                    IOptions<Settings> settings,
                                    IScrapBehavior<GetItemsInformationsBehavior> behavior)
        {
            _options = options;
            _logger = logger;
            _settings = settings.Value;
            _behavior = behavior;

        }

        public async Task ExecuteAsync()
        {
            _logger.LogInformation("Running GetItemsInformations with options : ");
            _logger.LogInformation($"Limit = {_options.Limit}");
            _logger.LogInformation($"Offset = {_options.Offset}");
            string[] args = [_options.Limit, _options.Offset];
            await _behavior.Run(args);
        } 
    }
}
