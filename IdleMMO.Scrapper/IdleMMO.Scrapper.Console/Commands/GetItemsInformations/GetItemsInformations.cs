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

        public void Execute()
        {
            _logger.LogInformation("cc mdr = " + _options.Option);
            _behavior.Run();
            throw new NotImplementedException();
        } 
    }
}
