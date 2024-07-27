using CommandLine;
using IdleMMO.Scrapper.Console.Commands;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Reflection;

namespace IdleMMO.Scrapper.Console
{
    public interface ICommandOptions { }

    internal static class DI
    {
        public static IServiceCollection ConfigureCommands(this IServiceCollection services)
        {
            // Register all commands and their options dynamically
            var commandTypes = Assembly.GetExecutingAssembly().GetTypes()
                .Where(t => typeof(ICommand).IsAssignableFrom(t) && !t.IsInterface);
            foreach (var commandType in commandTypes)
            {
                services.AddTransient(commandType);
            }

            return services;
        }

        public static void ExecuteCommand(this IServiceProvider serviceProvider, string[] args)
        {
            var parser = new CommandLine.Parser(with => with.HelpWriter = System.Console.Out);

            // Get all ICommandOptions types
            var optionTypes = Assembly.GetExecutingAssembly().GetTypes()
                .Where(t => typeof(ICommandOptions).IsAssignableFrom(t) && !t.IsInterface).ToArray();

            var result = parser.ParseArguments(args, optionTypes);
            result.WithParsed(option =>
            {
                // Find the corresponding command type
                var commandType = Assembly.GetExecutingAssembly().GetTypes()
                    .FirstOrDefault(t => typeof(ICommand).IsAssignableFrom(t) && !t.IsInterface &&
                                         t.GetConstructors().Any(c => c.GetParameters().Any(p => p.ParameterType == option.GetType())));
                if (commandType != null)
                {
                    var command = (ICommand)ActivatorUtilities.CreateInstance(serviceProvider, commandType, option);
                    command.Execute();
                }
                else
                {
                    System.Console.WriteLine("No command found for the provided options.");
                }
            });
        }
    }
}
