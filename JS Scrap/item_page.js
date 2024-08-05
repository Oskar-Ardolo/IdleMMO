class DataTypes {

    /// DEBUT - LISTE DES TYPES DE DONNEES
    static #collection = {
        STRING: {
            Test: (value) => {
                return typeof value === "string";
            }
        },
        NOT_EMPTY_STRING: {
            Test: (value) => {
                return typeof value === "string" && value !== "";
            }
        },
        NOT_SPACED_STRING: {
            Test: (value) => {
                return typeof value === "string" && value !== "" && !value.includes(" ");
            }
        },
        UNSIGNED_INT: {
            Test: (value) => {
                return !isNaN(value) && parseInt(Number(value), 10) === value && value > 0;
            },
            ConvertRawData: (value) => {
                return parseInt(value, 10);
            }
        },
        COMMA_SPACED_UNSIGNED_INT: {
            Test: (value) => {
                return !isNaN(value) && parseInt(Number(value), 10) === value && value > 0;
            },
            ConvertRawData: (value) => {
                return parseInt(value.replace(",", ""), 10);
            }
        },

        // TYPES CUSTOM
        CUSTOM_ITEM_MAXIMUM_USES: {
            Test: (value) => {
                return (!isNaN(value) && parseInt(Number(value), 10) === value && value > 0)
                    || value === "Unlimited";
            },
            ConvertRawData: (value) => {
                if (value !== "Unlimited")
                    return parseInt(value, 10);
                return value;
            }
        }
    }
    /// FIN - LISTE DES TYPES DE DONNEES


    static Has(type) {
        const Type = this.#getType(type);

        if (this.#isTypeValid(Type))
            return true;
        
        return false;
    }

    static Test(type, value) {
        const Type = this.#getType(type);

        if (!this.#isTypeValid(Type))
            throw new Error(`Type inconnu. Impossible de vérifier le type "${type}".`);
        
        return Type.Test(value);
    }

    static ConvertRawData(type, value) {
        const Type = this.#getType(type);

        if (!this.#isTypeValid(Type))
            throw new Error(`Type inconnu. Impossible de convertir les données brutes pour le type "${type}".`);

        if (typeof Type.ConvertRawData === "function")
            return Type.ConvertRawData(value);
        else
            return value;
    }

    static #getType(type) {
        return this.#collection[type];
    }

    static #isTypeValid(Type) {
        if (Object.prototype.toString.call(Type) !== "[object Object]" || typeof Type.Test !== "function")
            return false;

        return true;
    }   
}
class ConfigChecker {

    static Properties(pageConfiguration) {
        try {
            this.#checkPageProperties(pageConfiguration);
            this.#checkModulesProperties(pageConfiguration);
        } catch (error) {
            throw new Error(`La configuration n'est pas valide.\n${error.message}`);
        }
    }

    static #checkPageProperties(pageConfiguration) {
        this.#checkProperty(pageConfiguration, "Name", TypeChecker.CheckNotEmptyString);
        this.#checkProperty(pageConfiguration, "Modules", TypeChecker.CheckObjectArray);
        this.#checkProperty(pageConfiguration, "HtmlInfo", TypeChecker.CheckFunction);
        this.#checkProperty(pageConfiguration, "CallbackHelpers", TypeChecker.CheckObject);
    }

    static #checkModulesProperties(pageConfiguration) {
        const modulesNames = new Set();
        const dataKeys = new Set();

        pageConfiguration.Modules.forEach((module, moduleIndex) => {
            let modulePropertyPrefix = `Modules[${moduleIndex}]`;

            this.#checkProperty(module, "Name", TypeChecker.CheckNotEmptyString, modulePropertyPrefix);
            if (modulesNames.has(module.Name)) {
                throw new Error(`Les modules doivent avoir un nom unique.\nNom partagé: '${module.Name}'`);
            }

            modulesNames.add(module.Name);
            modulePropertyPrefix = `Modules[${module.Name}]`;

            this.#checkProperty(module, "Required", TypeChecker.CheckBoolean, modulePropertyPrefix);
            this.#checkProperty(module, "HtmlInfos", TypeChecker.CheckFunction, modulePropertyPrefix);
            this.#checkProperty(module, "Data", TypeChecker.CheckObjectArray, modulePropertyPrefix);

            module.Data.forEach((moduleData, moduleDataIndex) => {
                let moduleDataPropertyPrefix = `${modulePropertyPrefix}.Data[${moduleDataIndex}]`;

                this.#checkProperty(moduleData, "Key", TypeChecker.CheckNotEmptyString, moduleDataPropertyPrefix);
                if (dataKeys.has(moduleData.Key)) {
                    throw new Error(`Les données retournées doivent avoir une clé unique.\nClé partagée: '${moduleData.Key}'`);
                }

                dataKeys.add(moduleData.Key);
                moduleDataPropertyPrefix = `${modulePropertyPrefix}.Data[${moduleData.Key}]`;

                this.#checkProperty(moduleData, "Required", TypeChecker.CheckBoolean, moduleDataPropertyPrefix);
                this.#checkProperty(moduleData, "HtmlInfos", TypeChecker.CheckFunction, moduleDataPropertyPrefix);
                this.#checkProperty(moduleData, "FormatData", TypeChecker.CheckFunction, moduleDataPropertyPrefix);
            });
        });
    }

    static PageHtmlInfoReturned(htmlInfo) {
        const htmlProperty = "HtmlInfo";
        this.#checkProperty({HtmlInfo: htmlInfo}, htmlProperty, TypeChecker.CheckObject);
        this.#checkHtmlInfo(htmlInfo, htmlProperty);
        
        return htmlInfo.Element;
    }

    static ModuleHtmlInfosReturned(htmlInfos, basePropertyName) {
        const elements = [];
        this.#checkProperty({HtmlInfos: htmlInfos}, "HtmlInfos", TypeChecker.CheckObjectArray, basePropertyName);

        htmlInfos.forEach((htmlInfo, htmlInfoIndex) => {
            this.#checkHtmlInfo(htmlInfo, `${basePropertyName}.HtmlInfos[${htmlInfoIndex}]`);
            elements.push(htmlInfo.Element);
        });

        return elements;
    }

    static ModuleDataHtmlInfosReturned(htmlInfos, basePropertyName) {
        const elements = [];
        this.#checkProperty({HtmlInfos: htmlInfos}, "HtmlInfos", TypeChecker.CheckObjectArray, basePropertyName);

        const htmlError = new Error();
        htmlError._warnsCatched = [];
        htmlInfos.forEach((htmlInfo, htmlInfoIndex) => {
            const moduleDataHtmlProperty = `${basePropertyName}.HtmlInfos[${htmlInfoIndex}]`;

            try {
                if (htmlInfo.ListElement === true)
                    this.#checkHtmlInfoList(htmlInfo, `Type: 'List'\n${moduleDataHtmlProperty}`);
                else if (htmlInfo.GroupElement === true)
                    this.#checkHtmlInfoGroup(htmlInfo, `Type: 'Group'\n${moduleDataHtmlProperty}`);
                else if (htmlInfo.GroupListElement === true)
                    this.#checkHtmlInfoGroupList(htmlInfo, `Type: 'GroupList'\n${moduleDataHtmlProperty}`);
                else if (htmlInfo.MultiListElement === true)
                    this.#checkHtmlInfoMultiList(htmlInfo, `Type: 'MultiList'\n${moduleDataHtmlProperty}`);
                else {
                    this.#checkHtmlInfo(htmlInfo, moduleDataHtmlProperty);
                    this.#checkProperty(htmlInfo, "ExpectedType", TypeChecker.CheckDataType, moduleDataHtmlProperty);
                }
    
                elements.push(htmlInfo.Element);
                htmlInfo.Loaded = true;
            }
            catch (error) {
                htmlInfo.Loaded = false;
                const message = `La propriété '${moduleDataHtmlProperty}' n'a pas pu charger correctement.\n${error.message}`;

                if (htmlInfo.Optional === true)
                    htmlError._warnsCatched.push("Optionel: " + message);
                else {
                    htmlError.message = message;
                    throw htmlError;
                }
            }
        });

        if (htmlError._warnsCatched.length > 0) {
            htmlError._warnOnly = true;
            throw htmlError;
        }

        return elements;
    }

    static #checkHtmlInfo(htmlInfo, propertyName) {
        this.#checkProperty(htmlInfo, "Element", TypeChecker.CheckHtmlElement, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedTag", TypeChecker.CheckNotEmptyString, propertyName);

        if (htmlInfo.ExpectedTag !== htmlInfo.Element.tagName)
            throw new Error(`Propriété concernée: '${propertyName}'\nLe tag de l'élément ne correspond pas.\nTag attendu: '${htmlInfo.ExpectedTag}' - Tag de l'élément: '${htmlInfo.Element.tagName}'`);
    }

    static #checkHtmlInfoList(htmlInfo, propertyName) {
        this.#checkProperty(htmlInfo, "Element", TypeChecker.CheckHtmlElementArray, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedTag", TypeChecker.CheckNotEmptyString, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedType", TypeChecker.CheckDataType, propertyName);

        if (htmlInfo.ExpectedTag !== htmlInfo.Element[0].tagName)
            throw new Error(`Propriété concernée: '${propertyName}.Element[0]'\nLe tag de l'élément ne correspond pas.\nTag attendu: '${htmlInfo.ExpectedTag}' - Tag de l'élément: '${htmlInfo.Element[0].tagName}'`);
    }

    static #checkHtmlInfoGroup(htmlInfo, propertyName) {
        this.#checkProperty(htmlInfo, "Element", TypeChecker.CheckHtmlElementArray, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedTag", TypeChecker.CheckNotEmptyStringArray, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedType", TypeChecker.CheckDataTypeArray, propertyName);

        const expectedLength = htmlInfo.Element.length;
        if (expectedLength !== htmlInfo.ExpectedTag.length && expectedLength !== htmlInfo.ExpectedType.length)
            throw new Error(`Propriété concernée: '${propertyName}'\nLe nombre d'éléments dans 'Element' 'ExpectedTag' 'ExpectedTtype' doit être le même.`);

        htmlInfo.Element.forEach((element, elementIndex) => {
            if (htmlInfo.ExpectedTag[elementIndex] !== element.tagName)
                throw new Error(`Propriété concernée: '${propertyName}.Element[${elementIndex}]'\nLe tag de l'élément ne correspond pas.\nTag attendu: '${htmlInfo.ExpectedTag[elementIndex]}' - Tag de l'élément: '${element.tagName}'`);
        });
    }

    static #checkHtmlInfoGroupList(htmlInfo, propertyName) {
        this.#checkProperty(htmlInfo, "Element", TypeChecker.CheckHtmlElementMultiArray, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedTag", TypeChecker.CheckNotEmptyStringArray, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedType", TypeChecker.CheckDataTypeArray, propertyName);

        const expectedLength = htmlInfo.Element[0].length;
        if (expectedLength !== htmlInfo.ExpectedTag.length && expectedLength !== htmlInfo.ExpectedType.length)
            throw new Error(`Propriété concernée: '${propertyName}'\nLe nombre d'éléments dans 'Element[0]' 'ExpectedTag' 'ExpectedTtype' doit être le même.`);

        htmlInfo.Element[0].forEach((element, elementIndex) => {
            if (htmlInfo.ExpectedTag[elementIndex] !== element.tagName)
                throw new Error(`Propriété concernée: '${propertyName}.Element[0][${elementIndex}]'\nLe tag de l'élément ne correspond pas.\nTag attendu: '${htmlInfo.ExpectedTag[elementIndex]}' - Tag de l'élément: '${element.tagName}'`);
        });
    }

    static #checkHtmlInfoMultiList(htmlInfo, propertyName) {
        this.#checkProperty(htmlInfo, "Element", TypeChecker.CheckHtmlElementMultiArray, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedTag", TypeChecker.CheckNotEmptyStringArray, propertyName);
        this.#checkProperty(htmlInfo, "ExpectedType", TypeChecker.CheckDataTypeArray, propertyName);

        const expectedLength = htmlInfo.Element.length;
        if (expectedLength !== htmlInfo.ExpectedTag.length && expectedLength !== htmlInfo.ExpectedType.length)
            throw new Error(`Propriété concernée: '${propertyName}'\nLe nombre d'éléments dans 'Element' 'ExpectedTag' 'ExpectedTtype' doit être le même.`);

        htmlInfo.Element.forEach((element, elementIndex) => {
            if (htmlInfo.ExpectedTag[elementIndex] !== element[0].tagName)
                throw new Error(`Propriété concernée: '${propertyName}.Element[${elementIndex}][0]'\nLe tag de l'élément ne correspond pas.\nTag attendu: '${htmlInfo.ExpectedTag[elementIndex]}' - Tag de l'élément: '${element[0].tagName}'`);
        });
    }

    static #checkProperty(configurationObject, propertyName, typeCheck, propertyNamePrefix = "") {
        try {
            typeCheck.bind(TypeChecker)(configurationObject[propertyName]);
        }
        catch (error) {
            const fullPropertyName = (!propertyNamePrefix) ? propertyName : `${propertyNamePrefix}.${propertyName}`;
            throw new Error(`Propriété concernée: '${fullPropertyName}'\n${error.message}`);
        }
    }
}
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
class ScrapInterpreter {

    static ExtractValue(htmlInfos) {
        if (htmlInfos.ListElement === true)
            return this.#extractValueFromElementArray(htmlInfos);
        else if (htmlInfos.GroupElement === true)
            return this.#extractValueFromElementArray(htmlInfos, true);
        else if (htmlInfos.GroupListElement === true)
            return this.#extractValueFromElementMultiArray(htmlInfos, true);
        else if (htmlInfos.MultiListElement === true)
            return this.#extractValueFromElementMultiArray(htmlInfos);
        else 
            return this.#extractValueFromElement(htmlInfos);
    }

    static #extractValueFromElement(htmlInfos) {
        const rawValue = htmlInfos.Element.textContent.replace(/\n/g, " ").trim();
        const value = DataTypes.ConvertRawData(htmlInfos.ExpectedType, rawValue);

        if (!DataTypes.Test(htmlInfos.ExpectedType, value))
            throw new Error(`La valeur extraite ne correpond pas au type attendu.\nType attendu: '${htmlInfos.ExpectedType}' - Valeur: '${value}'`);

        return value;
    }

    static #extractValueFromElementArray(htmlInfos, isGroup = false) {
        const groupedValues = [];

        for (let i = 0; i < htmlInfos.Element.length; i++) {
            let expectedType;
            if (isGroup)
                expectedType = htmlInfos.ExpectedType[i];
            else
                expectedType = htmlInfos.ExpectedType;

            try {
                groupedValues.push(this.#extractValueFromElement({
                    Element: htmlInfos.Element[i],
                    ExpectedType: expectedType
                }));
            }
            catch (error) {
                let typeMessage = "Type: ";
                if (isGroup)
                    typeMessage += `'Group'`;
                else
                    typeMessage += `'List'`;

                throw new Error(`${typeMessage} - Index: '[${i}]'\n${error.message}`);
            }
        }

        return groupedValues;
    }

    static #extractValueFromElementMultiArray(htmlInfos, isGroup = false) {
        const groupedValues = [];

        for (let i = 0; i < htmlInfos.Element.length; i++) {
            const valueGroup = [];

            let expectedType;
            if (!isGroup)
                expectedType = htmlInfos.ExpectedType[i];

            try {
                for (let o = 0; o < htmlInfos.Element[i].length; o++) {
                    if (isGroup)
                        expectedType = htmlInfos.ExpectedType[o];

                    valueGroup.push(this.#extractValueFromElement({
                        Element: htmlInfos.Element[i][o],
                        ExpectedType: expectedType
                    }));
                }
            }
            catch (error) {
                let typeMessage = "Type: ";
                if (isGroup)
                    typeMessage += `'GroupList'`;
                else
                    typeMessage += `'MultiList'`;

                throw new Error(`${typeMessage} - Index: '[${i}][${o}]'\n${error.message}`);
            }

            groupedValues.push(valueGroup);
        }

        return groupedValues;
    }
}
class ScrapReporter {
    static Logs = [];
    static ErrorsCount = 0;

    static Log(message) {
        this.Logs.push({
            Type: "log",
            Message: message
        });
    }

    static SignalWarning(message) {
        this.Logs.push({
            Type: "warning",
            Message: message
        });
    }

    static SignalError(message) {
        this.Logs.push({
            Type: "error",
            Message: message
        });
        this.ErrorsCount++;
    }
}
class TypeChecker {
    
    static CheckFunction(value) {
        if (typeof value !== "function")
            this.#throwTypeError(value, "function");
    }

    static CheckObject(value) {
        if (typeof value !== 'object' || Array.isArray(value) || value === null)
            this.#throwTypeError(value, "object");
    }
    
    static CheckHtmlElement(value) {
        if (!(value instanceof HTMLElement))
            this.#throwTypeError(value, "HTMLElement");
    }

    static CheckHtmlElementArray(value) {
        if (!Array.isArray(value) || value.length === 0)
            this.#throwTypeError(value, "not empty array of HTMLElement");

        for (let i = 0; i < value.length; i++) {
            if (!(value[i] instanceof HTMLElement))
                this.#throwTypeError(value[i], "not empty array of HTMLElement", i);
        }
    }

    static CheckHtmlElementMultiArray(value) {
        if (!Array.isArray(value) || value.length === 0)
            this.#throwTypeError(value, "not empty array of not empty array of HTMLElement");

        for (let i = 0; i < value.length; i++) {
            if (!Array.isArray(value[i]) || value[i].length === 0)
                this.#throwTypeError(value[i], "not empty array of not empty array of HTMLElement", i);
    
            for (let o = 0; o < value[i].length; o++) {
                if (!(value[i][o] instanceof HTMLElement))
                    this.#throwTypeError(value[i][o], "not empty array of not empty array of HTMLElement", i, o);
            }
        }
    }

    static CheckNotEmptyArray(value) {
        if (!Array.isArray(value) || value.length === 0)
            this.#throwTypeError(value, "not empty array");
    }

    static CheckObjectArray(value) {
        if (!Array.isArray(value) || value.length === 0)
            this.#throwTypeError(value, "not empty array of object");

        for (let i = 0; i < value.length; i++) {
            if (typeof value[i] !== 'object' || Array.isArray(value[i]) || value[i] === null)
                this.#throwTypeError(value[i], "not empty array of object", i);
        }
    }

    static CheckDataTypeArray(value) {
        if (!Array.isArray(value) || value.length === 0)
            this.#throwTypeError(value, "not empty array of string: name in DataTypes collection");

        for (let i = 0; i < value.length; i++) {
            if (!DataTypes.Has(value[i]))
                this.#throwTypeError(value[i], "not empty array of string: name in DataTypes collection", i);
        }
    }

    static CheckNotEmptyStringArray(value) {
        if (!Array.isArray(value) || value.length === 0)
            this.#throwTypeError(value, "not empty array of not empty string");

        for (let i = 0; i < value.length; i++) {
            if (typeof value[i] !== "string" || value[i] === "")
                this.#throwTypeError(value[i], "not empty array of not empty string", i);
        }
    }

    static CheckDataType(value) {
        if (!DataTypes.Has(value))
            this.#throwTypeError(value, "string: name in DataTypes collection");
    }

    static CheckNotEmptyString(value) {
        if (typeof value !== "string" || value === "")
            this.#throwTypeError(value, "not empty string");
    }

    static CheckBoolean(value) {
        if (typeof value !== "boolean")
            this.#throwTypeError(value, "bool");
    }

    static #throwTypeError(value, expectedType, primaryIndex = false, secondaryIndex = false) {
        let indexMessage = "";
        if (primaryIndex !== false) {
            indexMessage += `Index: [${primaryIndex}]`;
            if (secondaryIndex !== false)
                indexMessage += `[${secondaryIndex}]`;
            indexMessage += "\n";
        }
            
        throw new Error(`La vérification du type '${expectedType}' a échoué.\n${indexMessage}Valeur: '${value}' - Type: '${typeof value}'`);
    }
}
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
class PageConfiguration {
    Name = "Item";

    HtmlInfo = () => {
        return {
            Element: document.getElementById("game-container").children[0],
            ExpectedTag: "DIV"
        };
    };

    Modules = [
        {
            Required: true,
            Name: "Banner",
            HtmlInfos: (pageRoot) => {
                return [
                    {
                        Element: pageRoot.children[0],
                        ExpectedTag: "DIV"
                    }
                ];
            },
            Data: [
                {
                    Required: true,
                    Key: "Name",
                    HtmlInfos: (moduleRoots) => {
                        return [
                            {
                                Element: moduleRoots[0].children[0].querySelector("div > h2 > span > span"),
                                ExpectedTag: "SPAN",
                                ExpectedType: "NOT_EMPTY_STRING"
                            }
                        ];
                    },
                    FormatData: (name) => {
                        return name;
                    }
                },
                {
                    Required: true,
                    Key: "Description",
                    HtmlInfos: (moduleRoots) => {
                        return [
                            {
                                Element: moduleRoots[0].children[0].querySelector("div > span"),
                                ExpectedTag: "SPAN",
                                ExpectedType: "STRING"
                            }
                        ];
                    },
                    FormatData: (description) => {
                        return description;
                    }
                }
            ]
        },
        {
            Required: true,
            Name: "Market",
            HtmlInfos: (pageRoot) => {
                return [
                    {
                        Element: pageRoot.children[1].children[1].querySelector("ul.divide-y"),
                        ExpectedTag: "UL"
                    }
                ];
            },
            Data: [
                {
                    Required: true,
                    Key: "MarketOffers",
                    HtmlInfos: (moduleRoots) => {
                        const elements = [];
                        const lines =  moduleRoots[0].querySelectorAll('li');
                        for (const line of lines) {
                            elements.push([
                                line.children[0].children[1].querySelector("h2 > span > :first-child"),
                                line.children[0].children[2].querySelector("span")
                            ]);
                        }
                        return [
                            {
                                GroupListElement: true,
                                Element: elements,
                                ExpectedTag: ["SPAN", "SPAN"],
                                ExpectedType: ["NOT_EMPTY_STRING", "NOT_EMPTY_STRING"]
                            }
                        ];
                    },
                    FormatData: (offers) => {
                        const marketOffers = [];
                        for (const offer of offers) {
                            marketOffers.push({
                                Stock: offer[0],
                                Price: offer[1]
                            });
                        }
                        return marketOffers;
                    }
                }
            ]
        },
        {
            Required: true,
            Name: "Informations",
            HtmlInfos: (pageRoot, helpers) => {
                return [
                    {
                        Element: helpers.SearchSidebar(pageRoot, "Information"),
                        ExpectedTag: "DIV"
                    }
                ];
            },
            Data: [
                {
                    Required: true,
                    Key: "Rarity",
                    HtmlInfos: (moduleRoots, helpers) => {
                        return [
                            {
                                Element: helpers.SearchSidebarInformations(moduleRoots[0], "Rarity"),
                                ExpectedTag: "SPAN",
                                ExpectedType: "NOT_EMPTY_STRING"
                            }
                        ];
                    },
                    FormatData: (rarity) => {
                        return rarity;
                    }
                },
                {
                    Required: true,
                    Key: "Quality",
                    HtmlInfos: (moduleRoots, helpers) => {
                        return [
                            {
                                Element: helpers.SearchSidebarInformations(moduleRoots[0], "Quality"),
                                ExpectedTag: "DIV",
                                ExpectedType: "NOT_EMPTY_STRING"
                            }
                        ];
                    },
                    FormatData: (quality) => {
                        return quality;
                    }
                },
                {
                    Required: true,
                    Key: "Type",
                    HtmlInfos: (moduleRoots, helpers) => {
                        return [
                            {
                                Element: helpers.SearchSidebarInformations(moduleRoots[0], "Type"),
                                ExpectedTag: "DIV",
                                ExpectedType: "NOT_EMPTY_STRING"
                            }
                        ];
                    },
                    FormatData: (type) => {
                        return type;
                    }
                },
                {
                    Required: true,
                    Key: "Level",
                    HtmlInfos: (moduleRoots, helpers) => {
                        return [
                            {
                                Optional: true,
                                Element: helpers.SearchSidebarInformations(moduleRoots[0], "Level"),
                                ExpectedTag: "DIV",
                                ExpectedType: "UNSIGNED_INT"
                            }
                        ];
                    },
                    FormatData: (level) => {
                        return level;
                    }
                },
                {
                    Required: true,
                    Key: "VendorValue",
                    HtmlInfos: (moduleRoots, helpers) => {
                        return [
                            {
                                Element: helpers.SearchSidebarInformations(moduleRoots[0], "Vendor Value"),
                                ExpectedTag: "DIV",
                                ExpectedType: "COMMA_SPACED_UNSIGNED_INT"
                            }
                        ];
                    },
                    FormatData: (vendorValue) => {
                        return vendorValue;
                    }
                },
                {
                    Required: true,
                    Key: "MaximumUses",
                    HtmlInfos: (moduleRoots, helpers) => {
                        return [
                            {
                                Optional: true,
                                Element: helpers.SearchSidebarInformations(moduleRoots[0], "Max Uses"),
                                ExpectedTag: "DIV",
                                ExpectedType: "CUSTOM_ITEM_MAXIMUM_USES"
                            }
                        ];
                    },
                    FormatData: (maximumUses) => {
                        if (maximumUses === "Unlimited")
                            return 0;
                        else
                            return maximumUses;
                    }
                }
            ]
        },
        {
            Required: true,
            Name: "Recipe",
            Optional: true,
            HtmlInfos: (pageRoot, helpers) => {
                return [
                    {
                        Element: helpers.SearchSidebar(pageRoot, "Craftable Item"),
                        ExpectedTag: "DIV"
                    },
                    {
                        Element: helpers.SearchSidebar(pageRoot, "Information"),
                        ExpectedTag: "DIV"
                    }
                ];
            },
            Data: [
                {
                    Required: true,
                    Key: "RecipeInfos",
                    HtmlInfos: (moduleRoots) => {
                        const link = moduleRoots[0].children[1].children[0].children[1].children[0];
                        const linkId = document.createElement("a");
                        const match = link.href.match(/\/item\/inspect\/([^\/?]+)/);
                        if (match) {
                            linkId.textContent = match[1];
                        }

                        const infosIngredients = [];
                        const ingredients = moduleRoots[0].children[3].children[0];
                        for (const ingredient of ingredients.children) {
                            const infosIngredient = [];
                            const ingredientId = ingredient.children[0].children[0].children[1].children[0].href;
                            const regexId = /\/item\/inspect\/([^\/?]+)/;
                            const matchId = ingredientId.match(regexId);
                            if (matchId) {
                                const ingredientIdHtml = document.createElement("a");
                                ingredientIdHtml.textContent = matchId[1];
                                infosIngredient.push(ingredientIdHtml);
                            }
                            else
                                infosIngredient.push(false);
                                

                            const ingredientInfos = ingredient.children[0].children[0].children[1].textContent;
                            const regexInfos = /^x(\d+)\s*(.*)$/;
                            const matchInfos = ingredientInfos.replace(/\n/g, "").trim().match(regexInfos);
                            if (matchInfos) {
                                const ingredientNameHtml = document.createElement("span");
                                const ingredientCountHtml = document.createElement("span");
                                ingredientNameHtml.textContent = matchInfos[2];
                                ingredientCountHtml.textContent = matchInfos[1];
                                infosIngredient.push(ingredientNameHtml);
                                infosIngredient.push(ingredientCountHtml);
                            }
                            else {
                                infosIngredient.push(false);
                                infosIngredient.push(false);
                            }

                            infosIngredients.push(infosIngredient);
                        }
                        
                        const infosSkill = [];
                        const infosList = moduleRoots[1].children[0].children;
                        for (const info of infosList) {
                            const infoName = info.children[0].children[0].children[1].textContent.replace(/\n/g, "").trim();
                            if (infoName.includes("Lv. Required")) {
                                const skill = document.createElement("div");
                                skill.textContent = infoName.replace("Lv. Required", "");
                                infosSkill.push(skill);
                                infosSkill.push(info.children[1]);
                            }
                        }

                        return [
                            {
                                GroupElement: true,
                                Element: [link, linkId],
                                ExpectedTag: ["A", "A"],
                                ExpectedType: ["NOT_EMPTY_STRING", "NOT_EMPTY_STRING"]
                            },
                            {
                                GroupListElement: true,
                                Element: infosIngredients,
                                ExpectedTag: ["A", "SPAN", "SPAN"],
                                ExpectedType: ["NOT_EMPTY_STRING", "NOT_EMPTY_STRING", "UNSIGNED_INT"]
                            },
                            {
                                GroupElement: true,
                                Element: infosSkill,
                                ExpectedTag: ["DIV", "DIV"],
                                ExpectedType: ["NOT_EMPTY_STRING", "UNSIGNED_INT"]
                            }
                        ];
                    },
                    FormatData: (result, ingredients, requirements) => {
                        const recipeIngredients = [];
                        for (const ingredient of ingredients) {
                            recipeIngredients.push({
                                Id: ingredient[0],
                                Name: ingredient[1],
                                Count: ingredient[2]
                            });
                        }
                        return {
                            Id: result[1],
                            Name: result[0],
                            Ingredients: recipeIngredients,
                            Skill: requirements[0],
                            LevelRequired: requirements[1]
                        };
                    }
                }
            ]
        },
        {
            Required: false,
            Name: "Pet",
            Optional: true,
            HtmlInfos: (pageRoot, helpers) => {
                const elements = [];
                const infoNames = ["Pet", "Stats", "Stats Growth"];
                for (const name of infoNames) {
                    elements.push({
                        Element: helpers.SearchSidebar(pageRoot, name),
                        ExpectedTag: "DIV"
                    });
                }
                return elements;
            },
            Data: [
                {
                    Required: true,
                    Key: "PetInfos",
                    HtmlInfos: (moduleRoots, helpers) => {
                        return [
                            {
                                Element: moduleRoots[0],
                                ExpectedTag: "DIV",
                                ExpectedType: "STRING"
                            }
                        ];
                    },
                    FormatData: (values) => {
                        return values;
                    }
                }
            ]
        },
        {
            Required: true,
            Name: "Location",
            Optional: true,
            HtmlInfos: async (pageRoot, helpers) => {
                const buttons = helpers.SearchSidebar(pageRoot, "Where to find");
                const elements = [];
                for (const button of buttons.children) {
                    elements.push({
                        Element: await helpers.ExtractRessourceLocation(button),
                        ExpectedTag: "DIV"
                    });
                }
                return elements;
            },
            Data: [
                {
                    Required: true,
                    Key: "RessourceLocations",
                    HtmlInfos: (moduleRoots) => {
                        const infosList = [];
                        const typeList = [];
                        const descriptionList = [];
                        const mapList = [];

                        for (let i = 0; i < moduleRoots.length; i++) {
                            const moduleRoot = moduleRoots[i];

                            const infosContainer = moduleRoot.children[0].children[0].children[0];
                            const name = infosContainer.children[1].children[0];
                            const level = infosContainer.children[2].children[1];
                            const experience = infosContainer.children[2].children[2];
                            const formatLevel = document.createElement("span");
                            const formatExperience = document.createElement("span");
                            formatLevel.textContent = level.textContent.replace("Level", "");
                            formatExperience.textContent = experience.textContent.replace("EXP", "");
                            infosList.push([name, formatLevel, formatExperience]);

                            const typeContainer = moduleRoot.children[1];
                            const type = document.createElement("span");
                            const typeContent = typeContainer.getAttribute("x-if").split(".")[0];
                            type.textContent = typeContent.charAt(0).toUpperCase() + typeContent.slice(1);
                            typeList.push(type);
                            
                            const description = document.createElement("div");
                            const descriptionContainer = moduleRoot.children[2];
                            if (descriptionContainer.classList.length === 1 && descriptionContainer.classList.contains("mx-4"))
                                description.textContent = descriptionContainer.children[0].children[0].textContent;
                            descriptionList.push(description);
                            
                            const mapContainer = moduleRoot.lastElementChild;
                            const map = mapContainer.children[0].children[0].lastElementChild;
                            mapList.push(map);
                        }
                        return [
                            {
                                GroupListElement: true,
                                Element: infosList,
                                ExpectedTag: ["H2", "SPAN", "SPAN"],
                                ExpectedType: ["NOT_EMPTY_STRING", "UNSIGNED_INT", "UNSIGNED_INT"]
                            },
                            {
                                ListElement: true,
                                Element: typeList,
                                ExpectedTag: "SPAN",
                                ExpectedType: "NOT_EMPTY_STRING"
                            },
                            {
                                ListElement: true,
                                Element: descriptionList,
                                ExpectedTag: "DIV",
                                ExpectedType: "STRING"
                            },
                            {
                                ListElement: true,
                                Element: mapList,
                                ExpectedTag: "BUTTON",
                                ExpectedType: "NOT_EMPTY_STRING"
                            }
                        ];
                    },
                    FormatData: (locationInfos, type, description, mapLocation) => {
                        const infos = [];
                        for (let i = 0; i < locationInfos.length; i++) {
                            infos.push({
                                Type: type[i],
                                Name: locationInfos[i][0],
                                Level: locationInfos[i][1],
                                Experience: locationInfos[i][2],
                                Description: description[i],
                                MapLocation: mapLocation[i]
                            });
                        }
                        return infos;
                    }
                }
            ]
        }
    ];

    CallbackHelpers = {

        SearchSidebar: (pageRoot, category) => {
            let returnNextElement = false;
            for (const element of pageRoot.children[1].children[0].children) {
                if (returnNextElement)
                    return element;

                switch (category) {
                    case "Information":
                    case "Pet":
                    case "Stats":
                    case "Stats Growth":
                        if (element.classList.length !== 0 || element.children.length !== 1)
                            continue;
                        if (element.children[0].children[1].children[0].textContent === category)
                            returnNextElement = true;
                        break;
                    case "Craftable Item":
                        if (element.classList.length !== 0 || element.children.length <= 1)
                            continue;
                        if (element.children[0].children[0].children[1].children[0].textContent === category)
                            return element;
                        break;
                    case "Where to find":
                        if (!element.classList.contains("my-4") || element.children.length !== 2)
                            continue;
                        if (element.children[0].children[0].children[1].children[0].textContent === category)
                            return element.children[1];
                        break;
                }
            }
        },

        SearchSidebarInformations: (moduleRoot, category) => {
            const infosList = moduleRoot.children[0].children;
            let returnValue; 
            for (const info of infosList) {
                if (info.children[0].children[0].children[1].textContent.replace(/\n/g, "").trim() !== category)
                    continue;
                
                switch (category) {
                    case "Rarity":
                        returnValue = info.children[1].children[0];
                        break;
                    case "Max Uses":
                    case "Quality":
                    case "Type":
                    case "Level":
                    case "Vendor Value":
                        returnValue = info.children[1];
                        break;
                }
            }
            return returnValue;
        },

        ExtractRessourceLocation: async (button) => {
            const buttonText = button.getAttribute("x-on:click");

            const match = buttonText.match(/quick-view-(.*)'/);
            if (match && match[1]) {
                const elementType = match[1];
                const query = `[x-data~="quick_view_${elementType}"] > :nth-child(1) > :nth-child(1) > :nth-child(2) > :nth-child(3)`;
                let elementModal = document.body.querySelector(query);

                if (!!elementModal)
                    elementModal.parentNode.removeChild(elementModal);

                button.click();

                let found = false;
                let loopCount = 0;
                while (!found || loopCount < 20) {
                    const returnElement = document.body.querySelector(query);
                    if (!!returnElement)
                        return returnElement.cloneNode(true);
                    
                    loopCount++;
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
    };
}
const checkConfiguration = false;
const tool = new PageScrapper(checkConfiguration);
const answer = await tool.Run();
return answer;