using CommandLine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Console.Commands.GetItemsInformations
{
    [Verb("GetItemsInformations", HelpText = "Execute GetItemsInformations")]
    public class GetItemsInformationsOptions : ICommandOptions
    {
        [Option('l', "limit", Required = false, HelpText = "Item limit")]
        public string Limit { get; set; }

        [Option('o', "offset", Required = false, HelpText = "Item limit offset")]
        public string Offset { get; set; }
    }
}
