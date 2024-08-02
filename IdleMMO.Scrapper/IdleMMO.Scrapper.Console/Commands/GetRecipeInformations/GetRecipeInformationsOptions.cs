using CommandLine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Console.Commands.GetRecipeInformations
{
    [Verb("GetRecipeInformations", HelpText = "Execute GetRecipeInformations")]
    public class GetRecipeInformationsOptions : ICommandOptions
    {
        [Option('l', "limit", Required = false, HelpText = "Item limit")]
        public string Limit { get; set; } = "-1";

        [Option('o', "offset", Required = false, HelpText = "Item limit offset")]
        public string Offset { get; set; } = "0";
    }
}
