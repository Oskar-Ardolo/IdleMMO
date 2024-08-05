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