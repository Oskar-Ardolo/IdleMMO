using IdleMMO.Scrapper.Models.Configuration;
using IdleMMO.Scrapper.Models.IdleMMO;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PuppeteerSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Behaviors

{
    public class UtilsHelper
    {
        private readonly Settings _settings;
        private readonly ILogger _logger;
        public UtilsHelper(IOptions<Settings> settings, ILogger<UtilsHelper> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task LoginAsync(IPage page)
        {
            await page.GoToAsync("https://web.idle-mmo.com/login", WaitUntilNavigation.Networkidle2);
            await page.TypeAsync("#email", _settings.IdleMMO.Login.Username);
            await page.TypeAsync("#password", _settings.IdleMMO.Login.Password);
            await page.ClickAsync("button[type='submit']");
            await Task.Delay(_settings.IdleMMO.Login.WaitTime);
            return;
        }

        public async Task<List<Item>> GetItemListPageData(IPage page, List<Item> itemsToGet)
        {
            var list = new List<Item>();
            foreach (var item in itemsToGet)
            {
                await page.GoToAsync($"https://web.idle-mmo.com/item/inspect/{item.Id}?same_window=true", WaitUntilNavigation.Networkidle2);
                await Task.Delay(_settings.IdleMMO.PageDelay);

                string jsCode = File.ReadAllText("JS/itemScrape.js");
                Item result = null;
                bool resultCode = true;
                try
                {
                    result = await page.EvaluateExpressionAsync<Item>(jsCode);
                }
                catch (Exception e)
                {
                    _logger.LogError($"Erreur sur l'id {item.Id}");
                    resultCode = false;
                }

                if (!resultCode)
                    continue;

                result.Id = item.Id;
                list.Add(result);
            }
            return list;
        }
    }
}
