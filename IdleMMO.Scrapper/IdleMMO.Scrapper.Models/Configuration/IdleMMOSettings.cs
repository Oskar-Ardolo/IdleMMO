using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Models.Configuration
{
    public class IdleMMOSettings
    {
        public IdleMMOLogin Login { get; set; }

        public int PageDelay { get; set; } = 1000;
    }
}
