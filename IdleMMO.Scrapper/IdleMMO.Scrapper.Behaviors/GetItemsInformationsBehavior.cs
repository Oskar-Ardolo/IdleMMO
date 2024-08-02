using IdleMMO.Scrapper.Behaviors.DI;
using IdleMMO.Scrapper.Models.Configuration;
using IdleMMO.Scrapper.Models.IdleMMO;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PuppeteerSharp;
using System.Runtime.Intrinsics.X86;

namespace IdleMMO.Scrapper.Behaviors
{
    public class GetItemsInformationsBehavior : IScrapBehavior<GetItemsInformationsBehavior>
    {
        private readonly Settings _settings;
        private readonly ILogger<GetItemsInformationsBehavior> _logger;
        private readonly UtilsHelper _helper;
        private readonly DBHelper _dbHelper;
        public GetItemsInformationsBehavior(IOptions<Settings> settings, ILogger<GetItemsInformationsBehavior> logger, UtilsHelper helper, DBHelper dBHelper) 
        { 
            _settings = settings.Value;
            _logger = logger;
            _helper = helper;
            _dbHelper = dBHelper;
        }
        
        public async Task Run(string[] args)
        {
            _logger.LogInformation("Starting behavior GetItemsInformationsBehavior");
            string limit = args[0];
            string offset = args[1];
            string filter = "filter[Name][_null]=true";

            List<Item> itemList = await _dbHelper.GetItemListAsync(limit, offset, filter);
            _logger.LogInformation($"{itemList.Count}/{limit} items retrieved from database.");

            List<Item> updatedList = await GetItemsInformationsFromGameAsync(itemList);
            _logger.LogInformation($"{updatedList.Count}/{itemList.Count} items information retrieved from IdleMMO.");

            await _dbHelper.UpdateItemListAsync(updatedList);
            _logger.LogInformation("Update finished.");
        }

        public async Task<List<Item>> GetItemsInformationsFromGameAsync(List<Item> originalList)
        {
            List<Item> returnList = new List<Item>();
            try
            {
                var browserFetcher = new BrowserFetcher();
                await browserFetcher.DownloadAsync();
                var browser = await Puppeteer.LaunchAsync(new LaunchOptions
                {
                    Headless = false,
                    ExecutablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
                });

                var page = await browser.NewPageAsync();
                await _helper.LoginAsync(page);

                returnList = await _helper.GetItemListPageData(page, originalList);

                await page.DisposeAsync();
                await browser.DisposeAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return returnList;
        }
    }


    

    
}
