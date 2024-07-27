(async () => {
    var HTML = {};
    HTML.container = document.getElementById('game-container').children[0];
    HTML.bannerContainer = HTML.container.children[0];
    HTML.sideContainer = HTML.container.children[1].children[0];
    HTML.marketContainer = HTML.container.children[1].children[1].querySelector('ul.divide-y');

    // récupération des éléments HTML (sideContainer)
    let lastSideElementTitle = '';
    for (let i = 0; i < HTML.sideContainer.children.length; i++) {
        let sideElement = HTML.sideContainer.children[i];

        // titre
        if (sideElement.classList.length === 0) {
            lastSideElementTitle = sideElement.children[0].children[1].children[0].textContent.trim().toLowerCase();
        }
        // contenu
        else {
            if (lastSideElementTitle === 'information') {
                HTML.infosContainer = sideElement.children[0];
            }
            lastSideElementTitle = '';
        }
    }

    var DATA = {};
    DATA.firstPrice = HTML.marketContainer.children[1].children[0].children[2].children[1].textContent;

    DATA.informations = {};
    for (let i = 0; i < HTML.infosContainer.children.length; i++) {
        let infosElement = HTML.infosContainer.children[i];

        // titre
        let title = infosElement.children[0].children[0].children[1].textContent.replace(/\n/g, '').trim().replace(' ', '');

        // valeur
        let value = '???';
        switch (title) {
            case 'Rarity':
                value = infosElement.children[1].children[0].textContent.replace(/\n/g, '').trim();
                break;

            case 'VendorValue':
                value = infosElement.children[1].textContent.replace(/\n/g, '').trim();
                break;

            default:
                if (infosElement.children[1].children.length === 0) {
                    value = infosElement.children[1].textContent.replace(/\n/g, '').trim();
                }
                break;
        }

        DATA.informations[title] = value;
    }

    return {
        DATA
    };
})();
