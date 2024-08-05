class ModuleScrapper {
    #moduleConfiguration;
    #data;

    constructor(moduleConfiguration, data) {
        this.#moduleConfiguration = moduleConfiguration;
        this.#data = data;
    }

    Run() {
        for (const dataProperty of this.#moduleConfiguration.Data) {
            if (!dataProperty.Required || !dataProperty.Loaded)
                continue;

            const errorInfos = `Module[${this.#moduleConfiguration.Name}].Data[${dataProperty.Key}]`;
            const extractedValues = [];

            let htmlIndex = 0;
            for (const dataPropertyHtmlInfo of dataProperty.HtmlInfos) {
                let value = null;

                if (dataPropertyHtmlInfo.Loaded)
                    value = this.#extractValue(dataPropertyHtmlInfo, `${errorInfos}.HtmlInfos[${htmlIndex}]`);

                extractedValues.push(value);
            }

            const formatValue = this.#formatData(dataProperty, extractedValues, `${errorInfos}.FormatData`);
            if (formatValue !== null)
                this.#data[dataProperty.Key] = formatValue;
        }
    }

    #extractValue(dataPropertyHtmlInfo, errorInfos) {
        try {
            return ScrapInterpreter.ExtractValue(dataPropertyHtmlInfo);
        }
        catch (error) {
            ScrapReporter.SignalError(`Une erreur s'est produite lors de l'extraction des données.\n${errorInfos}\n${error.message}`);
        }
    }
    
    #formatData(dataProperty, extractedValues, errorInfos) {
        try {
            return dataProperty.FormatData(...extractedValues);
        }
        catch (error) {
            ScrapReporter.SignalError(`Une erreur s'est produite lors du formatage des données extraites.\n${errorInfos}\n${error.message}`);
        }
    }
}