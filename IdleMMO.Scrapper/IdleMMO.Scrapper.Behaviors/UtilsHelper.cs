using IdleMMO.Scrapper.Models.Configuration;
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
        public UtilsHelper(IOptions<Settings> settings)
        {
            _settings = settings.Value;
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
    }
}
