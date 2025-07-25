﻿using IdleMMO.Scrapper.Models.Configuration;
using IdleMMO.Scrapper.Models.IdleMMO;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using PuppeteerSharp;
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

        public async Task<List<Item>> GetItemListAsync(string limit, string offset, string filter)
        {
            var request = new RestRequest("/items?"+ filter, Method.Get);
            request.AddParameter("limit", limit);
            request.AddParameter("offset", offset);

            using (var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30)))
            {
                ResponseItemList data = await _client.GetAsync<ResponseItemList>(request, cts.Token);
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
                        { "RecipeResult", item.RecipeInfos.Result.Id },
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

        public async Task UpdateRecipeList(List<Item> itemsToUpdate)
        {
            foreach (var item in itemsToUpdate)
            {
                foreach (RecipeIngredients ing in item.RecipeInfos.Ingredients) 
                {
                    var conditions = new JObject
                    {
                        { "ItemId", ing.Id },
                        { "RecipeId", item.Id }
                    };
                    var data = new JObject
                    {
                        { "ItemId", ing.Id },
                        { "Count", ing.Count },
                        { "RecipeId", item.Id },
                    };
                    await UpsertDirectusItem("ingredients", conditions, data);
                }
            }
        }

        internal async Task UpdateMarketList(List<Item> itemsToUpdate)
        {
            foreach (var item in itemsToUpdate)
            {
                var conditions = new JObject
                    {
                        { "ItemId", item.Id },
                    };
                await DeleteItems("MarketOffers", conditions);
                foreach (MarketOffer offer in item.MarketOffers)
                {
                    var data = new JObject
                    {
                        { "ItemId", item.Id },
                        { "Count", offer.Stock },
                        { "Price", offer.Price },
                    };
                    var createRequest = new RestRequest($"/MarketOffers", Method.Post);
                    createRequest.AddHeader("Content-Type", "application/json");
                    createRequest.AddJsonBody(data.ToString());
                    var response = await _client.ExecuteAsync(createRequest);
                    if (response.StatusCode == System.Net.HttpStatusCode.OK)
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

        async Task UpsertDirectusItem(string collection, JObject conditions, JObject data)
        {
            var request = new RestRequest($"/{collection}", Method.Get);

            foreach (var condition in conditions)
            {
                request.AddParameter($"filter[{condition.Key}][_eq]", condition.Value.ToString());
            }

            var response = await _client.ExecuteAsync(request);

            if (response.IsSuccessful)
            {
                var items = JObject.Parse(response.Content)["data"];
                if (items.HasValues)
                {
                    string itemId = items[0]["id"].ToString();
                    var updateRequest = new RestRequest($"/{collection}/{itemId}", Method.Patch);
                    updateRequest.AddHeader("Content-Type", "application/json");
                    updateRequest.AddJsonBody(data.ToString());
                    response = await _client.ExecuteAsync(updateRequest);
                }
                else
                {
                    foreach (var condition in conditions)
                    {
                        data[condition.Key] = condition.Value;
                    }
                    var createRequest = new RestRequest($"/{collection}", Method.Post);
                    createRequest.AddHeader("Content-Type", "application/json");
                    createRequest.AddJsonBody(data.ToString());
                    response = await _client.ExecuteAsync(createRequest);
                }
            }
            else
            {
                foreach (var condition in conditions)
                {
                    data[condition.Key] = condition.Value;
                }
                var createRequest = new RestRequest($"/{collection}", Method.Post);
                createRequest.AddHeader("Content-Type", "application/json");
                createRequest.AddJsonBody(data.ToString());
                response = await _client.ExecuteAsync(createRequest);
            }

            _logger.LogInformation(response.Content);
        }

        private async Task DeleteItems(string collection, JObject conditions)
        {
            var request = new RestRequest($"/{collection}", Method.Get);

            foreach (var condition in conditions)
            {
                request.AddParameter($"filter[{condition.Key}][_eq]", condition.Value.ToString());
            }

            var response = await _client.ExecuteAsync(request);

            if (response.IsSuccessful)
            {
                var items = JObject.Parse(response.Content)["data"];
                foreach (var item in items)
                {
                    string itemId = item["id"].ToString();
                    var deleteRequest = new RestRequest($"/{collection}/{itemId}", Method.Delete);
                    var deleteResponse = await _client.ExecuteAsync(deleteRequest);

                    if (deleteResponse.IsSuccessful)
                    {
                        _logger.LogInformation($"Deleted item with ID: {itemId}");
                    }
                    else
                    {
                        _logger.LogInformation($"Failed to delete item with ID: {itemId}");
                    }
                }
            }
            else
            {
                _logger.LogInformation("Failed to retrieve items");
            }
        }
    }

    public class ResponseItemList
    {
        public List<Item> data { get; set; }
    }
}
