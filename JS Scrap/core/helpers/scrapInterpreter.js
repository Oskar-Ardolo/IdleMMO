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