const careGuides = {
    flower: {
        category: "Flores",
        light: "Luz abundante; algumas horas de sol suave",
        water: "Manter o substrato ligeiramente húmido, sem encharcar",
        temperature: "15–25 °C",
        humidity: "Humidade moderada",
        toxicity: "A toxicidade depende da espécie; manter fora do alcance de animais",
        description: "Retira flores murchas e evita deixar água acumulada no prato."
    },
    indoor: {
        category: "Plantas de interior",
        light: "Luz indireta brilhante",
        water: "Regar quando a camada superior do substrato secar",
        temperature: "18–27 °C",
        humidity: "Humidade moderada a elevada",
        toxicity: "Pode ser tóxica para animais; confirmar antes de a manter ao seu alcance",
        description: "Evita correntes de ar e rodar o vaso de vez em quando ajuda o crescimento uniforme."
    },
    succulent: {
        category: "Suculentas e cactos",
        light: "Local muito luminoso, com algumas horas de sol",
        water: "Pouca água; deixar o substrato secar completamente entre regas",
        temperature: "15–30 °C",
        humidity: "Baixa a moderada",
        toxicity: "A toxicidade depende da espécie; manter fora do alcance de animais",
        description: "Usa um vaso com drenagem e nunca deixes água acumulada nas raízes."
    },
    herb: {
        category: "Ervas aromáticas",
        light: "Luz abundante e, idealmente, algumas horas de sol",
        water: "Regar quando a superfície do substrato começar a secar",
        temperature: "15–25 °C",
        humidity: "Moderada, com boa circulação de ar",
        toxicity: "Geralmente cultivada para uso culinário; confirmar a identificação antes de consumir",
        description: "Colhe as pontas regularmente para incentivar um crescimento mais cheio."
    },
    tropical: {
        category: "Plantas tropicais",
        light: "Luz indireta brilhante, sem sol direto intenso",
        water: "Manter o substrato ligeiramente húmido, sem encharcar",
        temperature: "18–28 °C",
        humidity: "Elevada",
        toxicity: "Pode ser tóxica para animais; confirmar antes de a manter ao seu alcance",
        description: "Gosta de um ambiente estável, quente e protegido de correntes de ar."
    },
    outdoor: {
        category: "Plantas de exterior",
        light: "Sol direto ou meia-sombra, conforme a variedade",
        water: "Regar junto à terra quando esta começar a secar",
        temperature: "10–28 °C",
        humidity: "Moderada e com boa ventilação",
        toxicity: "A toxicidade depende da espécie; confirmar antes de a manter ao alcance de animais",
        description: "Escolhe um local arejado e ajusta a rega à estação e à chuva."
    }
};

function makePlant(id, name, species, family, price, extra = {}) {
    return {
        id,
        name,
        species,
        price,
        photoKey: id,
        photoSearch: `${species.toLowerCase()} plant photo`,
        searchTerms: "",
        ...careGuides[family],
        ...extra
    };
}

function makeTulipGroup(id, name, species, division, price) {
    return makePlant(id, name, species, "flower", price, {
        photoKey: "tulipas",
        searchTerms: `tulipa tulip divisão grupo ${division}`,
        description: `Tulipa da divisão hortícola ${division}; os cuidados podem variar consoante a cultivar e o clima.`
    });
}

export const catalog = [
    makePlant("rosa-encarnada", "Rosa encarnada", "Rosa × hybrida", "flower", 9.90, { photoSearch: "red rose flower" }),
    makePlant("rosa-amarela", "Rosa amarela", "Rosa × hybrida", "flower", 9.90, { photoSearch: "yellow rose flower" }),
    makePlant("rosa-rosa", "Rosa cor-de-rosa", "Rosa × hybrida", "flower", 9.90, { photoSearch: "pink rose flower" }),
    makePlant("margaridas", "Margaridas", "Leucanthemum vulgare", "flower", 5.50, { photoSearch: "daisy flower" }),
    makePlant("tulipas", "Tulipas", "Tulipa gesneriana", "flower", 7.90, { photoSearch: "tulip flower" }),
    makeTulipGroup("tulipa-simples-precoce", "Tulipa simples precoce", "Tulipa gesneriana · divisão 1", 1, 7.90),
    makeTulipGroup("tulipa-dobrada-precoce", "Tulipa dobrada precoce", "Tulipa gesneriana · divisão 2", 2, 8.50),
    makeTulipGroup("tulipa-triumph", "Tulipa Triumph", "Tulipa gesneriana · divisão 3", 3, 8.90),
    makeTulipGroup("tulipa-hibrida-darwin", "Tulipa híbrida Darwin", "Tulipa gesneriana · divisão 4", 4, 9.50),
    makeTulipGroup("tulipa-simples-tardia", "Tulipa simples tardia", "Tulipa gesneriana · divisão 5", 5, 7.90),
    makeTulipGroup("tulipa-flor-de-lirio", "Tulipa flor-de-lis", "Tulipa gesneriana · divisão 6", 6, 8.90),
    makeTulipGroup("tulipa-franjada", "Tulipa franjada", "Tulipa gesneriana · divisão 7", 7, 9.50),
    makeTulipGroup("tulipa-viridiflora", "Tulipa Viridiflora", "Tulipa gesneriana · divisão 8", 8, 8.90),
    makeTulipGroup("tulipa-rembrandt", "Tulipa Rembrandt", "Tulipa gesneriana · divisão 9", 9, 9.50),
    makeTulipGroup("tulipa-papagaio", "Tulipa papagaio", "Tulipa gesneriana · divisão 10", 10, 9.90),
    makeTulipGroup("tulipa-dobrada-tardia", "Tulipa dobrada tardia", "Tulipa gesneriana · divisão 11", 11, 8.90),
    makeTulipGroup("tulipa-kaufmanniana", "Tulipa Kaufmanniana", "Tulipa kaufmanniana · divisão 12", 12, 8.50),
    makeTulipGroup("tulipa-fosteriana", "Tulipa Fosteriana", "Tulipa fosteriana · divisão 13", 13, 8.90),
    makeTulipGroup("tulipa-greigii", "Tulipa Greigii", "Tulipa greigii · divisão 14", 14, 8.90),
    makeTulipGroup("tulipas-botanicas", "Tulipas botânicas", "Tulipa spp. · divisão 15", 15, 7.50),
    makePlant("aloe-vera", "Aloe vera", "Aloe vera", "succulent", 6.50, {
        searchTerms: "aloevera babosa",
        light: "Luz abundante; adapta-se a sol suave",
        water: "Regar pouco e deixar a terra secar completamente",
        temperature: "15–30 °C",
        toxicity: "O látex pode ser tóxico para animais; não ingerir sem aconselhamento"
    }),
    makePlant("alecrim", "Alecrim", "Salvia rosmarinus", "herb", 3.90, { photoSearch: "rosemary herb" }),
    makePlant("costela-de-adao", "Costela-de-Adão", "Monstera deliciosa", "tropical", 18.90, { photoSearch: "monstera deliciosa plant" }),
    makePlant("lirio-da-paz", "Lírio-da-paz", "Spathiphyllum wallisii", "indoor", 12.50, {
        photoSearch: "peace lily plant",
        light: "Luz indireta ou meia-sombra",
        water: "Regar quando a superfície começar a secar; não deixar secar por completo",
        toxicity: "Tóxico para cães e gatos se ingerido"
    }),
    makePlant("jiboia", "Jiboia", "Epipremnum aureum", "indoor", 8.90, { photoSearch: "pothos epipremnum aureum plant" }),
    makePlant("calathea", "Calathea", "Goeppertia spp.", "tropical", 14.90, {
        searchTerms: "calthea",
        photoSearch: "calathea plant",
        light: "Luz indireta suave; evitar sol direto",
        water: "Manter a terra ligeiramente húmida; prefere água pouco calcária"
    }),
    makePlant("palmeira-areca", "Palmeira-areca", "Dypsis lutescens", "tropical", 19.90, {
        photoSearch: "areca palm plant",
        toxicity: "Considerada não tóxica para cães e gatos; evitar que mastiguem as folhas"
    }),
    makePlant("echeveria", "Echeveria", "Echeveria elegans", "succulent", 4.50, { photoSearch: "echeveria succulent" }),
    makePlant("cato-de-barril", "Cato de barril", "Echinocactus grusonii", "succulent", 5.90, {
        light: "Sol direto ou local muito luminoso",
        water: "Regar muito raramente; deixar a terra secar completamente",
        temperature: "18–32 °C"
    }),
    makePlant("orquidea", "Orquídea", "Phalaenopsis spp.", "flower", 16.90, {
        photoSearch: "phalaenopsis orchid flower",
        light: "Luz indireta brilhante",
        water: "Regar quando as raízes estiverem prateadas; deixar escorrer bem",
        temperature: "18–28 °C"
    }),
    makePlant("kalanchoe", "Kalanchoe", "Kalanchoe blossfeldiana", "succulent", 5.90, {
        photoSearch: "kalanchoe plant flower",
        light: "Luz abundante, com algum sol suave",
        water: "Deixar o substrato secar entre regas",
        toxicity: "Tóxica para cães e gatos se ingerida"
    }),
    makePlant("violeta-africana", "Violeta africana", "Streptocarpus ionanthus", "flower", 6.90, {
        searchTerms: "violenta africana",
        photoSearch: "african violet plant",
        light: "Luz indireta brilhante",
        water: "Regar a terra sem molhar as folhas; evitar água fria"
    }),
    makePlant("anturio", "Antúrio", "Anthurium andraeanum", "tropical", 14.50, {
        photoSearch: "red anthurium plant",
        toxicity: "Tóxico para pessoas e animais se ingerido"
    }),
    makePlant("manjericao", "Manjericão", "Ocimum basilicum", "herb", 2.90, {
        photoSearch: "basil herb plant",
        light: "Sol direto ou janela muito luminosa",
        water: "Regar regularmente; manter húmido sem encharcar"
    }),
    makePlant("hortela", "Hortelã", "Mentha spicata", "herb", 2.90, {
        photoSearch: "mint herb plant",
        light: "Sol suave ou meia-sombra",
        water: "Manter a terra húmida, sem água acumulada"
    }),
    makePlant("lavanda", "Lavanda", "Lavandula angustifolia", "outdoor", 5.90, {
        photoSearch: "lavender flower plant",
        light: "Sol direto durante várias horas",
        water: "Pouca água depois de estabelecida; terra bem drenada"
    }),
    makePlant("buganvilia", "Buganvília", "Bougainvillea glabra", "outdoor", 12.90, {
        photoSearch: "bougainvillea flower",
        light: "Sol direto abundante",
        water: "Regar moderadamente; deixar a superfície secar entre regas",
        temperature: "16–30 °C"
    }),
    makePlant("hortensia", "Hortênsia", "Hydrangea macrophylla", "outdoor", 11.90, {
        photoSearch: "hydrangea flower",
        light: "Meia-sombra; proteger do sol forte da tarde",
        water: "Regar regularmente; não deixar a terra secar completamente"
    }),
    makePlant("geranio", "Gerânio", "Pelargonium × hortorum", "outdoor", 4.90, { photoSearch: "geranium flower plant" }),
    makePlant("begonia", "Begónia", "Begonia semperflorens", "flower", 6.90, {
        photoSearch: "begonia flower plant",
        light: "Luz indireta brilhante ou meia-sombra",
        water: "Regar a terra quando a superfície secar; evitar molhar as folhas",
        toxicity: "Algumas variedades são tóxicas para animais se ingeridas"
    }),
    makePlant("gardenia", "Gardénia", "Gardenia jasminoides", "tropical", 14.90, {
        photoSearch: "gardenia flower plant",
        light: "Luz brilhante, sem sol intenso nas horas quentes",
        water: "Manter húmida sem encharcar; prefere água pouco calcária"
    }),
    makePlant("ciclame", "Ciclame", "Cyclamen persicum", "flower", 7.50, {
        photoSearch: "cyclamen flower plant",
        light: "Luz indireta brilhante e ambiente fresco",
        water: "Regar pela base e deixar escorrer; evitar molhar o tubérculo",
        temperature: "10–20 °C",
        toxicity: "Tóxico para animais, sobretudo o tubérculo"
    }),
    makePlant("bromelia", "Bromélia", "Guzmania lingulata", "tropical", 12.90, {
        photoSearch: "bromeliad plant",
        light: "Luz indireta brilhante",
        water: "Manter um pouco de água no copo central e renovar regularmente"
    }),
    makePlant("anturio-rosa", "Antúrio rosa", "Anthurium andraeanum", "tropical", 15.90, {
        photoSearch: "pink anthurium plant",
        toxicity: "Tóxico para pessoas e animais se ingerido"
    }),
    makePlant("medinila", "Medinila", "Medinilla magnifica", "tropical", 24.90, {
        photoSearch: "medinilla magnifica flower plant",
        light: "Luz indireta brilhante, sem sol direto",
        water: "Regar quando a superfície da terra secar ligeiramente",
        temperature: "18–27 °C"
    }),
    makePlant("petunia", "Petúnia", "Petunia × atkinsiana", "outdoor", 3.90, {
        photoSearch: "petunia flower",
        light: "Sol direto durante várias horas",
        water: "Manter a terra húmida, sem encharcar"
    }),
    makePlant("gerbera", "Gerbera", "Gerbera jamesonii", "flower", 6.90, {
        photoSearch: "gerbera flower",
        light: "Muita luz e algum sol suave",
        water: "Regar a terra sem molhar o centro da planta"
    }),
    makePlant("girassol", "Girassol", "Helianthus annuus", "outdoor", 4.90, {
        photoSearch: "sunflower flower",
        light: "Sol direto abundante",
        water: "Regar regularmente, sobretudo durante o crescimento",
        temperature: "18–30 °C"
    }),
    makePlant("pupila", "Pupila (papoula)", "Papaver spp.", "outdoor", 4.90, {
        photoSearch: "poppy flower plant",
        light: "Sol direto",
        water: "Regar moderadamente; evitar solo encharcado",
        description: "O nome «pupila» foi mantido como indicado; a fotografia e cuidados referem-se a papoulas. Confirma a espécie para maior precisão."
    }),
    makePlant("dalia", "Dália", "Dahlia pinnata", "flower", 6.90, {
        photoSearch: "dahlia flower",
        light: "Sol direto ou luz abundante",
        water: "Regar regularmente na época de crescimento, sem encharcar"
    }),
    makePlant("crisantemo", "Crisântemo", "Chrysanthemum × morifolium", "flower", 5.90, {
        photoSearch: "chrysanthemum flower",
        light: "Luz abundante; algumas horas de sol suave",
        water: "Manter a terra húmida durante a floração",
        toxicity: "Tóxico para cães e gatos se ingerido"
    }),
    makePlant("hibisco", "Hibisco", "Hibiscus rosa-sinensis", "outdoor", 12.90, {
        photoSearch: "hibiscus flower plant",
        light: "Sol direto ou luz abundante",
        water: "Regar regularmente durante o crescimento, sem encharcar",
        temperature: "18–30 °C"
    }),
    makePlant("cravo", "Cravo", "Dianthus caryophyllus", "flower", 5.90, {
        photoSearch: "carnation flower",
        light: "Sol direto ou luz abundante",
        water: "Regar junto à terra quando a superfície começar a secar"
    }),
    makePlant("copo-de-leite", "Copo-de-leite", "Zantedeschia aethiopica", "flower", 9.90, {
        photoSearch: "calla lily flower",
        light: "Sol suave ou meia-sombra",
        water: "Manter húmida durante o crescimento",
        toxicity: "Tóxico para pessoas e animais se ingerido"
    }),
    makePlant("peonia", "Peónia", "Paeonia lactiflora", "flower", 14.90, {
        photoSearch: "peony flower",
        light: "Sol direto ou meia-sombra",
        water: "Regar junto à terra quando a superfície começar a secar",
        temperature: "10–24 °C"
    }),
    makePlant("iris", "Íris", "Iris germanica", "outdoor", 7.90, {
        photoSearch: "iris flower",
        light: "Sol direto abundante",
        water: "Regar moderadamente; prefere solo bem drenado",
        toxicity: "Algumas partes podem ser tóxicas para animais se ingeridas"
    }),
    makePlant("delfinio", "Delfínio", "Delphinium elatum", "outdoor", 8.90, {
        photoSearch: "delphinium flower",
        light: "Sol ou meia-sombra em local fresco",
        water: "Manter a terra húmida, sem encharcar",
        toxicity: "Tóxico para pessoas e animais se ingerido"
    }),
    makePlant("astromelia", "Astromélia", "Alstroemeria aurea", "flower", 8.50, {
        photoSearch: "alstroemeria flower",
        light: "Luz abundante ou sol suave",
        water: "Manter a terra ligeiramente húmida",
        toxicity: "Pode causar irritação e é tóxica para gatos"
    }),
    makePlant("lisianthus", "Lisianthus", "Eustoma grandiflorum", "flower", 8.90, {
        photoSearch: "lisianthus flower",
        light: "Luz abundante, evitando o sol mais intenso",
        water: "Regar junto à terra quando a superfície começar a secar"
    })
];

export function getPlantById(id) {
    return catalog.find((plant) => plant.id === id);
}
