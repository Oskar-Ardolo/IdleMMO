using IdleMMO.Scrapper.Models.Configuration;
using IdleMMO.Scrapper.Models.IdleMMO;
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
        public DBHelper(IOptions<Settings> settings)
        {
            _settings = settings.Value;
            var options = new RestClientOptions(_settings.Database.Url);
            _client = new RestClient(options);
        }

        public async Task<List<Item>> GetItemListAsync(int limit)
        {
            var request = new RestRequest("/items", Method.Get);
            request.AddParameter("limit", limit);

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
                        { "Name", item.Name }
                    };
                request.AddJsonBody(data);
                var cancellationTokenSource = new CancellationTokenSource();
                await _client.ExecuteAsync(request, cancellationTokenSource.Token);
            }
        }


    }

    public class ResponseData
    {
        public List<Item> data { get; set; }
    }
}
