﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Console.Commands
{
    public interface ICommand
    {
        public Task ExecuteAsync();
    }
   
}
