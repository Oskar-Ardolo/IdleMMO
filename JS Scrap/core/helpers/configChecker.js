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