function safelyGetHtmlElement(element, expectedTag, elementName="", throwError = false) {
    try {
        if (element instanceof HTMLElement) {
            if (expectedTag === "all" || expectedTag === element.tagName)
                return element;
            else if (throwError === false)
                return null;
            else
                throw new Error(`tags incohérents - attendu: "${expectedTag}" - résultat: "${element.tagName}"`);
        }
        else if (throwError === false)
            return null;
        else
            throw new Error(`aucun élément HTML trouvé - élément: "${element}"`);
    }
    catch (error) {
        throw new Error(`erreur lors de la recherche de l'élément HTML : "${elementName}"\n${error.message}`);
    }
}

function safelyExtractFromHtmlElement(dataName, element, type, valueCheck = false) {
    try {
        let value = null;
        let validValue = false;
        switch (type) {
            case "string":
                value = element.textContent.replace(/\n/g, "").trim();
                validValue = true;
                break;
            case "not_empty_string":
                value = element.textContent.replace(/\n/g, "").trim();
                if (value !== "")
                    validValue = true;
                break;
            case "unsigned_int":
                value = element.textContent.replace(/\n/g, "").trim();
                if (/^\d+$/.test(value)) {
                    value = parseInt(value, 10);
                    if (value > 0)
                        validValue = true;
                }
                break;
            default:
                throw new Error(`type de retour inconnu - type: "${type}"`);
        }

        if (!validValue && valueCheck !== false)
            throw new Error(`aucune valeur valide trouvée - element: "${element}" - value: "${value}"`);
        return value;
    }
    catch (error) {
        throw new Error(`erreur lors de l'extraction de données  : "${dataName}"\n${error.message}`);
    }
}


((config) => {
    const avertissements = [];
    const DATA = {};
    const HTML = {
        banner: {},
        side: {categories: []},
        market: {offers: []}
    };
    
    try {
        /// conteneurs principaux
        HTML.container = safelyGetHtmlElement(document.getElementById("game-container").children[0], "DIV", "HTML.container", true);
        HTML.banner.container = safelyGetHtmlElement(HTML.container.children[0], "DIV", "HTML.banner.container", config.modules.banner.required);
        HTML.side.container = safelyGetHtmlElement(HTML.container.children[1].children[0], "DIV", "HTML.side.container", config.modules.side.required);
        HTML.market.container = safelyGetHtmlElement(HTML.container.children[1].children[1].querySelector("ul.divide-y"), "UL", "HTML.market.container", config.modules.market.required);

        /// conteneur - banner
        if (HTML.banner.container !== null) {
            HTML.banner.itemName = safelyGetHtmlElement(HTML.banner.container.children[0].querySelector("div > h2 > span > span"), "SPAN", "HTML.banner.itemName", config.modules.banner.required);
            DATA.Name = safelyExtractFromHtmlElement("DATA.Name", HTML.banner.itemName, "string", (config.modules.banner.required && config.modules.banner.dataCheck));

            HTML.banner.itemDescription = safelyGetHtmlElement(HTML.banner.container.children[0].querySelector("div > span"), "SPAN", "HTML.banner.itemDescription", config.modules.banner.required);
            DATA.Description = safelyExtractFromHtmlElement("DATA.Description", HTML.banner.itemDescription, "string", (config.modules.banner.required && config.modules.banner.dataCheck));

            config.modules.banner.loaded = true;
        }

        /// conteneur - side
        if (HTML.sideContainer !== null) {
            let category = null;

            const sideElements = HTML.side.container.children;
            for (let i = 0; i < sideElements.length; i++) {
                const sideElement = safelyGetHtmlElement(sideElements[i], "all", `HTML.side.categories[${HTML.side.categories.length}].containers[${i}]`, config.modules.side.required);

                if (sideElement.classList.length === 0) {
                    if (category !== null) {
                        HTML.side.categories.push(category.HTML);
                        if (category.status === "used")
                            DATA[category.key] = category.DATA;
                    }

                    let categoryNameElement = null;
                    if (sideElement.children.length === 1) {
                        categoryNameElement = safelyGetHtmlElement(sideElement.children[0].children[1].children[0], "SPAN", `HTML.side.categories[${HTML.side.categories.length}].name`, config.modules.side.required);
                    }
                    else if (sideElement.children.length > 1) {
                        categoryNameElement = safelyGetHtmlElement(sideElement.children[0].children[0].children[1].children[0], "SPAN", `HTML.side.categories[${HTML.side.categories.length}].name`, config.modules.side.required);
                    }
                    else {
                        avertissements.push(`HTML.side - sideElement incohérent - element: "${sideElement}"`);
                        continue;
                    }

                    category = {
                        name: safelyExtractFromHtmlElement("DATA key (category name)", categoryNameElement, "not_empty_string", (config.modules.side.required && config.modules.side.dataCheck)),
                        HTML: {
                            containers: [sideElement],
                            name: categoryNameElement
                        },
                        DATA: []
                    };

                    switch (category.name) {
                        case "Information":
                            category.status = "used";
                            category.key = "Informations";
                            break;
                        case "Actions":
                        case "Your Character":
                        case "Stats and Effects":
                        case "Craftable Item":
                        case "Requirements":
                        case "Effects":
                        case "Pet":
                        case "Stats":
                        case "Stats Growth":
                            category.status = "unused";
                            avertissements.push(`HTML.side - catégorie non utilisée - nom: "${category.name}"`);
                            break;
                        default:
                            category.status = "unknown";
                            avertissements.push(`HTML.side - catégorie non référencée - nom: "${category.name}"`);
                            break;
                    }
                }
                else {
                    category.HTML.containers.push(sideElement);

                    if (category.status === "used") {
                        switch (category.name) {
                            case "Information":
                                if (category.HTML.containers.length === 2) {
                                    category.HTML.infos = [];

                                    const infosContainer = category.HTML.containers[1].children[0];
                                    for (let o = 0; o < infosContainer.children.length; o++) {
                                        const infosElement = infosContainer.children[o];

                                        const categoryDataNameElement = safelyGetHtmlElement(infosElement.children[0].children[0].children[1], "SPAN", `HTML.side.categories[${HTML.side.categories.length}].infos[${o}].name`, config.modules.side.required);
                                        const categoryData = {
                                            Name: safelyExtractFromHtmlElement("DATA.Informations[${o}].Name", categoryDataNameElement, "not_empty_string", (config.modules.side.required && config.modules.side.dataCheck))
                                        };
                                    
                                        let categoryDataValueElement = null;
                                        let categoryDataValueType;
                                        switch (categoryData.Name) {
                                            case "Rarity":
                                                categoryDataValueElement = safelyGetHtmlElement(infosElement.children[1].children[0], "SPAN", `HTML.side.categories[${HTML.side.categories.length}].infos[${o}].value`, config.modules.side.required);
                                                categoryDataValueType = "not_empty_string";
                                                break;
                                            case "Quality":
                                            case "Type":
                                                categoryDataValueElement = safelyGetHtmlElement(infosElement.children[1], "DIV", `HTML.side.categories[${HTML.side.categories.length}].infos[${o}].value`, config.modules.side.required);
                                                categoryDataValueType = "not_empty_string";
                                                break;
                                            case "Level":
                                            case "Vendor Value":
                                            case "Forge Level Required":
                                            case "Maximum Uses":
                                                categoryDataValueElement = safelyGetHtmlElement(infosElement.children[1], "DIV", `HTML.side.categories[${HTML.side.categories.length}].infos[${o}].value`, config.modules.side.required);
                                                categoryDataValueType = "unsigned_int";
                                                break;
                                            default:
                                                avertissements.push(`HTML.side - catégorie "${category.name}" - information non référencée - nom: "${categoryData.Name}"`);
                                                break;
                                        }

                                        category.HTML.infos.push({
                                            name: categoryDataNameElement,
                                            value: categoryDataValueElement
                                        });
                                        if (categoryDataValueElement !== null) {                            
                                            categoryData.Value = safelyExtractFromHtmlElement("DATA.Informations[${o}].Value", categoryDataValueElement, categoryDataValueType, (config.modules.side.required && config.modules.side.dataCheck));
                                            category.DATA.push(categoryData);
                                        }
                                    }
                                }
                                break;
                        }
                    }
                }

                if ((i + 1) === sideElements.length) {
                    if (category !== null) {
                        HTML.side.categories.push(category.HTML);
                        if (category.status === "used")
                            DATA[category.key] = category.DATA;
                    }
                }
            }

            config.modules.side.loaded = true;
        }
        
        /// conteneur - market
        if (HTML.marketContainer !== null) {
            DATA.MarketOffers = [];

            const marketOffers = HTML.market.container.querySelectorAll("li");
            for (let i = 0; i < marketOffers.length; i++) {
                const marketOffer = marketOffers[i];

                const offerElements = {
                    stock: safelyGetHtmlElement(marketOffer.children[0].children[1].querySelector("h2 > span > :first-child"), "SPAN", `HTML.market.offers[${i}].stock`, config.modules.market.required),
                    price: safelyGetHtmlElement(marketOffer.children[0].children[2].querySelector("span"), "SPAN", `HTML.market.offers[${i}].price`, config.modules.market.required)
                };
                HTML.market.offers.push(offerElements);
                DATA.MarketOffers.push({
                    Stock: safelyExtractFromHtmlElement(`DATA.MarketOffers[${i}].Stock`, offerElements.stock, "unsigned_int", (config.modules.market.required && config.modules.market.dataCheck)),
                    Price: safelyExtractFromHtmlElement(`DATA.MarketOffers[${i}].Price`, offerElements.price, "unsigned_int", (config.modules.market.required && config.modules.market.dataCheck))
                });
            }

            config.modules.market.loaded = true;
        }


        if (config.devEnvironment) {
            console.log("--- DEBUT DU RAPPORT DE SUCCES ---");
            console.log("Informations sur les modules :");
            console.log(config.modules);
            console.log("Elements HTML :");
            console.log(HTML);
            if (avertissements.length > 0) {
                console.log("--- AVERTISSEMENTS ---");
                for (let i = 0; i < avertissements.length; i++) {
                    console.log(avertissements[i]);
                }
            }
            console.log("--- FIN DU RAPPORT DE SUCCES ---");
        }

        return DATA;
    }
    catch (error) {
        if (config.devEnvironment) {
            console.log("--- DEBUT DU RAPPORT D'ERREUR ---");
            if (avertissements.length > 0) {
                console.log("Avertissements :");
                for (let i = 0; i < avertissements.length; i++) {
                    console.log(avertissements[i]);
                }
            }
            console.log("Informations sur les modules :");
            console.log(config.modules);
            console.log("Elements HTML :");
            console.log(HTML);
            console.log("Données récupérées :");
            console.log(DATA);
            console.log("Erreur rencontrée :");
            console.error(error);
            console.log("--- FIN DU RAPPORT D'ERREUR ---");
        }

        return false;
    }
})({
    /// configuration
    modules: {
        banner: { required: true, dataCheck: true },
        side: { required: true, dataCheck: true },
        market: { required: true, dataCheck: true }
    },
    devEnvironment: true
});