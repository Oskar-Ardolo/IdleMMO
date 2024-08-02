using IdleMMO.Scrapper.Behaviors.DI;
using IdleMMO.Scrapper.Models.Configuration;
using IdleMMO.Scrapper.Models.IdleMMO;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IdleMMO.Scrapper.Behaviors
{
    public class GetMarketOffersListBehavior : IScrapBehavior<GetMarketOffersListBehavior>
    {
        private readonly Settings _settings;
        private readonly ILogger<GetMarketOffersListBehavior> _logger;
        private readonly UtilsHelper _helper;
        private readonly DBHelper _dbHelper;
        public GetMarketOffersListBehavior(IOptions<Settings> settings, ILogger<GetMarketOffersListBehavior> logger, UtilsHelper helper, DBHelper dBHelper) 
        { 
            _settings = settings.Value;
            _logger = logger;
            _helper = helper;
            _dbHelper = dBHelper;
        }
        
        public async Task Run(string[] args)
        {
            _logger.LogInformation("Starting behavior GetMarketOffersListBehavior");
            string limit = args[0];
            string offset = args[1];
            string filter = "";

            List<Item> itemList = await _dbHelper.GetItemListAsync(limit, offset, filter);
            _logger.LogInformation($"{itemList.Count}/{limit} items retrieved from database.");

            List<Item> updatedList = await _helper.GetItemsInformationsFromGameAsync(itemList);
            _logger.LogInformation($"{updatedList.Count}/{itemList.Count} offers information retrieved from IdleMMO.");

            await _dbHelper.UpdateMarketList(updatedList);
            _logger.LogInformation("Update finished.");
        }
    }


    

    
}
