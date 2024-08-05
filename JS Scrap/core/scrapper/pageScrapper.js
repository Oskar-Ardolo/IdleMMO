class PageScrapper {
    #pageConfiguration = new PageConfiguration();
    #modulesScrappers = [];
    #data = {};
    #checkConfiguration = false;

    constructor(checkConfiguration = false) {
        this.#checkConfiguration = checkConfiguration;
    }

    async Run() {
        const isConfigurationLoaded = await ConfigLoader.Run(this.#pageConfiguration, this.#checkConfiguration);
        const configurationErrorsCount = ScrapReporter.ErrorsCount;

        if (isConfigurationLoaded) {
            ScrapReporter.Log(`Démarrage de l'extraction.`);
            
            try {
                this.#setModulesScrappers();
                this.#runModulesScrappers();
            }
            catch (error) {
                ScrapReporter.SignalError(`Une erreur inattendue s'est produite lors de l'extraction.\n${error.message}`);
            }

            const extractionErrorsCount = ScrapReporter.ErrorsCount - configurationErrorsCount;
            ScrapReporter.Log(`L'extraction est terminée. Nombre d'erreurs rencontrées : ${extractionErrorsCount}`);
        }

        return this.#constructResponse();
    }

    #constructResponse() {
        return {
            Complete: ScrapReporter.ErrorsCount === 0,
            Data: this.#data,
            Logs: ScrapReporter.Logs,
            Configuration: this.#pageConfiguration
        };
    }

    #setModulesScrappers() {
        for (const moduleConfiguration of this.#pageConfiguration.Modules) {
            if (moduleConfiguration.Required && moduleConfiguration.Loaded)
                this.#modulesScrappers.push(new ModuleScrapper(moduleConfiguration, this.#data));
        }
    }

    #runModulesScrappers() {
        for (const moduleScrapper of this.#modulesScrappers) {
            moduleScrapper.Run();
        }
    }
}