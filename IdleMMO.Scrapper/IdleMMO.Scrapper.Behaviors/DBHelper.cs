using IdleMMO.Scrapper.Models.Configuration;
using IdleMMO.Scrapper.Models.IdleMMO;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Behaviors
{
    public class DBHelper
    {
        private readonly Settings _settings;
        private RestClient _client;
        ILogger<DBHelper> _logger;
        public DBHelper(IOptions<Settings> settings, ILogger<DBHelper> logger)
        {
            _settings = settings.Value;
            _logger = logger;
            var options = new RestClientOptions(_settings.Database.Url);
            _client = new RestClient(options);
            _client.AddDefaultHeader("Authorization", "Bearer "+_settings.Database.Token);
        }

        public async Task<List<Item>> GetItemListAsync(int limit)
        {
            var request = new RestRequest("/items?filter[Name][_null]=true", Method.Get);
            request.AddParameter("limit", limit);
            //request.AddHeader("Authorization", "Bearer " + _settings.Database.Token);

            using (var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30)))
            {
                ResponseData data = await _client.GetAsync<ResponseData>(request, cts.Token);
                return data.data;
            }
        }

        public async Task UpdateItemListAsync(List<Item> itemsToUpdate)
        {
            foreach (var item in itemsToUpdate)
            {
                var request = new RestRequest("/items/{id}", Method.Patch);
                request.AddUrlSegment("id", item.Id);
                var data = new Dictionary<string, object>
                    {
                        { "VendorValue", item.VendorValue },
                        { "Type", item.Type },
                        { "Quality", item.Quality },
                        { "Rarity", item.Rarity },
                        { "Name", item.Name },
                        { "RecipeResult", null },
                        { "MaximumUses", item.MaximumUses },
                        { "ForgeLevelRequired", item.ForgeLevelRequired }
                    };
                request.AddJsonBody(data);
                var cancellationTokenSource = new CancellationTokenSource();
                var resp = await _client.ExecuteAsync(request, cancellationTokenSource.Token);

                if (resp.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    _logger.LogInformation($"Item {item.Name} OK");
                }
                else
                {
                    _logger.LogError($"Erreur sur l'Item {item.Name} avec ID = {item.Id}");
                }
            }
        }


    }

    public class ResponseData
    {
        public List<Item> data { get; set; }
    }
}
