using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Models.IdleMMO
{
    public class Item
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int? VendorValue { get; set; }
        public string Type { get; set; }
        public string Quality { get; set; }
        public string Rarity { get; set; }
        public string? Level { get; set; }
        public int? ForgeLevelRequired {  get; set; }
        public int? MaximumUses { get; set; }


        public List<MarketOffer> MarketOffers { get; set; }
    }
}
