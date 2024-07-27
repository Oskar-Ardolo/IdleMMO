using IdleMMO.Scrapper.Console;
using IdleMMO.Scrapper.Console.Commands;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using IdleMMO.Scrapper.Models.Configuration;
using IdleMMO.Scrapper.Behaviors.DI;

var serviceCollection = new ServiceCollection();

serviceCollection.ConfigureCommands();
serviceCollection.AddBehaviors();

serviceCollection.AddLogging(configure => configure.AddConsole());


var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();
serviceCollection.Configure<Settings>(configuration.GetSection("Settings"));

var serviceProvider = serviceCollection.BuildServiceProvider();

serviceProvider.ExecuteCommand(args);