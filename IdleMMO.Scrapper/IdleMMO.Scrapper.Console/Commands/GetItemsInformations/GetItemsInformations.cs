using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Console.Commands.GetItemsInformations
{
    public class GetItemsInformations : ICommand
    {
        private GetItemsInformationsOptions _options;
        private readonly ILogger<GetItemsInformations> _logger;

        public GetItemsInformations(GetItemsInformationsOptions options, ILogger<GetItemsInformations> logger)
        {
            _options = options;
            _logger = logger;
        }

        public void Execute()
        {
            _logger.LogInformation("cc mdr = " + _options.Option);
            throw new NotImplementedException();
        } 
    }
}
