using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Behaviors.DI
{
    public interface IScrapBehavior<T>
    {
        public Task Run(string[] args);
    }
}
