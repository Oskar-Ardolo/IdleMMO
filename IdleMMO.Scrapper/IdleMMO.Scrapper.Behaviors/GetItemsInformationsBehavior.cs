using IdleMMO.Scrapper.Behaviors.DI;
using IdleMMO.Scrapper.Models.Configuration;
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
        public GetItemsInformationsBehavior(IOptions<Settings> settings, ILogger<GetItemsInformationsBehavior> logger, UtilsHelper helper) 
        { 
            _settings = settings.Value;
            _logger = logger;
            _helper = helper;
        }
        
        public async Task Run()
        {
            _logger.LogInformation("Starting behavior GetItemsInformationsBehavior");
            try
            {
                var browserFetcher = new BrowserFetcher();
                await browserFetcher.DownloadAsync();
                var browser = await Puppeteer.LaunchAsync(new LaunchOptions
                {
                    Headless = false,
                    //Devtools = true,
                    ExecutablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
                });

                // page is crashed in Chromium and timeout after 5 mins
                var page = await browser.NewPageAsync();
                await _helper.LoginAsync(page);

                await page.GoToAsync($"https://web.idle-mmo.com/item/inspect/Ro31P7kZL6AYveGxXOy5?same_window=true", WaitUntilNavigation.Networkidle2);

                string jsCode = File.ReadAllText("JS/itemScrape.js");
                var result = await page.EvaluateExpressionAsync<ResponseData>(jsCode);

                await page.DisposeAsync();
                await browser.DisposeAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            
            return;
        }
    }


    public class ResponseData
    {
        public Item DATA { get; set; }
    }

    public class Item
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int VendorValue {  get; set; }
        public string Type { get; set; }
        public string Quality {  get; set; }
        public string Rarity { get; set; }
        public List<MarketOffer> MarketOffers { get; set; }
    }

    public class MarketOffer
    {
        public int Stock { get; set; }
        public int Price { get; set; }
    }
}
