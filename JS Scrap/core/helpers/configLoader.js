class ConfigLoader {

    static async Run(configuration, checkProperties) {
        ScrapReporter.Log(`Chargement de la configuration.`);

        try {
            if (checkProperties) 
                ConfigChecker.Properties(configuration);

            await this.#loadHtml(configuration);
        }
        catch(error) {
            ScrapReporter.SignalError(`Une erreur inattendue s'est produite lors du chargement de la configuration.\n${error.message}`);
            return false;
        }

        ScrapReporter.Log(`Le chargement de la configuration est terminé. Nombre d'erreurs rencontrées : ${ScrapReporter.ErrorsCount}`);
        return true;
    }

    static async #loadHtml(configuration) {
        configuration.HtmlInfo = await this.#runHtmlCallback(configuration.HtmlInfo, [configuration.CallbackHelpers], `HtmlInfo`);
        const pageRoot = ConfigChecker.PageHtmlInfoReturned(configuration.HtmlInfo);

        for (const module of configuration.Modules) {
            if (!module.Required)
                continue;

            const moduleProperty = `Modules[${module.Name}]`;

            try {
                module.HtmlInfos = await this.#runHtmlCallback(module.HtmlInfos, [pageRoot, configuration.CallbackHelpers], `${moduleProperty}.HtmlInfos`);
                const moduleRoots = ConfigChecker.ModuleHtmlInfosReturned(module.HtmlInfos, moduleProperty);

                for (const moduleData of module.Data) {
                    if (!moduleData.Required)
                        continue;

                    const moduleDataProperty = `Modules[${module.Name}].Data[${moduleData.Key}]`;
    
                    try {
                        moduleData.HtmlInfos = await this.#runHtmlCallback(moduleData.HtmlInfos, [moduleRoots, configuration.CallbackHelpers], `${moduleDataProperty}.HtmlInfos`);
                        ConfigChecker.ModuleDataHtmlInfosReturned(moduleData.HtmlInfos, moduleDataProperty);

                        moduleData.Loaded = true;
                    }
                    catch (error) {
                        if (error._warnOnly === true)
                            moduleData.Loaded = true;
                        else {
                            moduleData.Loaded = false;
                            const message = `La propriété 'Data[${moduleData.Key}]' n'a pas pu charger correctement.\n${error.message}`;
                            
                            if (module.Optional === true || moduleData.Optional === true)
                                ScrapReporter.SignalWarning("Optionel: " + message);
                            else
                                ScrapReporter.SignalError(message);
                        }

                        if (Array.isArray(error._warnsCatched)) {
                            for (const warnMessage of error._warnsCatched) {
                                ScrapReporter.SignalWarning(warnMessage);
                            }
                        }
                    }
    
                }
    
                module.Loaded = true;
            }
            catch (error) {
                module.Loaded = false;
                const message = `Le module '${module.Name}' n'a pas pu charger correctement.\n${error.message}`
                
                if (module.Optional === true)
                    ScrapReporter.SignalWarning("Optionel: " + message);
                else
                    ScrapReporter.SignalError(message);
            }
        }
    }

    static async #runHtmlCallback(htmlInfos, callbackArguments, propertyName) {
        try {
            return await htmlInfos(...callbackArguments);
        }
        catch (error) {
            throw new Error(`Propriété concernée: '${propertyName}'\nUne erreur est survenue lors de l'exécution du callback.\n${error.message}`);
        }
    }
}