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
        [Option('o', "option", Required = true, HelpText = "Option for Command A.")]
        public string Option { get; set; }
    }
}
