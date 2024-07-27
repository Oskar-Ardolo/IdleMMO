using IdleMMO.Scrapper.Behaviors.DI;
using IdleMMO.Scrapper.Models.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IdleMMO.Scrapper.Behaviors
{
    public class GetItemsInformationsBehavior : IScrapBehavior<GetItemsInformationsBehavior>
    {
        private readonly Settings _settings;
        private readonly ILogger<GetItemsInformationsBehavior> _logger;
        public GetItemsInformationsBehavior(IOptions<Settings> settings, ILogger<GetItemsInformationsBehavior> logger) 
        { 
            _settings = settings.Value;
            _logger = logger;
        }
        
        public void Run()
        {
            _logger.LogInformation("Starting behavior GetItemsInformationsBehavior");
            throw new NotImplementedException();
        }
    }
}
