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