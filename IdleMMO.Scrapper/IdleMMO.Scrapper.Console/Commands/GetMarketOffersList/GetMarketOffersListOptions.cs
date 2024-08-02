using CommandLine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Console.Commands.GetMarketOffersList
{
    [Verb("GetMarketOffersList", HelpText = "Execute GetMarketOffersList")]
    public class GetMarketOffersListOptions : ICommandOptions
    {
        [Option('l', "limit", Required = false, HelpText = "Item limit")]
        public string Limit { get; set; } = "-1";

        [Option('o', "offset", Required = false, HelpText = "Item limit offset")]
        public string Offset { get; set; } = "0";
    }
}
