using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace IdleMMO.Scrapper.Behaviors.DI
{
    public static class DI
    {
        public static IServiceCollection AddBehaviors(this IServiceCollection services)
        {
            var genericInterfaceType = typeof(IScrapBehavior<>);
            var implementations = Assembly.GetExecutingAssembly().GetTypes()
                .Where(t => t.GetInterfaces()
                    .Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == genericInterfaceType)
                    && t.IsClass && !t.IsAbstract);

            foreach (var implementation in implementations)
            {
                var interfaceType = implementation.GetInterfaces()
                    .First(i => i.IsGenericType && i.GetGenericTypeDefinition() == genericInterfaceType);
                services.AddSingleton(interfaceType, implementation);
            }

            return services;
        }
    }
}
