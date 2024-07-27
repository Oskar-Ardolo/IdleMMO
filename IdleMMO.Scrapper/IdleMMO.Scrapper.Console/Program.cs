using IdleMMO.Scrapper.Console;
using IdleMMO.Scrapper.Console.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

var serviceCollection = new ServiceCollection();

serviceCollection.ConfigureCommands();
serviceCollection.AddLogging(configure => configure.AddConsole());

var serviceProvider = serviceCollection.BuildServiceProvider();

serviceProvider.ExecuteCommand(args);