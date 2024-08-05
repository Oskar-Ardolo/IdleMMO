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