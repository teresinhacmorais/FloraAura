import {
    addCareLog,
    addPlant,
    getAccount,
    getCart,
    getCareLogs,
    getFavorites,
    getPlants,
    openDatabase,
    saveCart,
    saveFavorites,
    updateAccount,
    updatePlant
} from "./db.js";
import { catalog, getPlantById } from "./catalog.js";
import {
    getSessionAccount,
    loginAccount,
    registerAccount,
    signOut
} from "./auth.js";

const statusElement = document.querySelector("#app-status");
const dialog = document.querySelector("#add-plant-dialog");
const form = document.querySelector("#add-plant-form");
const catalogSearch = document.querySelector("#catalog-search");
const authScreen = document.querySelector("#auth-screen");
const applicationShell = document.querySelector("#application-shell");
const authStatus = document.querySelector("#auth-status");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const cartList = document.querySelector("#cart-list");
const cartSummary = document.querySelector("#cart-summary");
const identifySelect = document.querySelector("#identify-plant");
const photoPreview = document.querySelector("#photo-preview");
const profilePhotoInput = document.querySelector("#profile-photo-input");

let plants = [];
let careLogs = [];
let currentAccount = null;
let cartItems = [];
let favoriteIds = [];
let plantPhotos = new Map();
let photoPreviewUrl = "";

const currencyFormatter = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR"
});

function todayAsDateInputValue() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
}

function showAuthStatus(message, isError = false) {
    authStatus.textContent = message;
    authStatus.classList.toggle("is-error", isError);
    authStatus.hidden = !message;
}

function setAuthMode(mode) {
    document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
        const isActive = tab.dataset.authMode === mode;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
    });

    document.querySelectorAll("[data-auth-form]").forEach((authForm) => {
        authForm.hidden = authForm.dataset.authForm !== mode;
    });
    showAuthStatus("");
}

async function enterApplication(account) {
    currentAccount = account;
    document.querySelector("#account-name").textContent = account.name;
    renderProfile();
    const savedCart = await getCart(account.email);
    cartItems = savedCart?.items || [];
    const savedFavorites = await getFavorites(account.email);
    favoriteIds = savedFavorites?.ids || [];
    await refreshData();
    renderCart();
    renderFavorites();
    authScreen.hidden = true;
    applicationShell.hidden = false;
    navigate();
}

function initialsFor(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("pt-PT");
}

function renderProfile() {
    const profileImage = currentAccount.profileImage || "";
    const initials = initialsFor(currentAccount.name);
    const accountAvatar = document.querySelector("#account-avatar");
    const profilePhoto = document.querySelector("#profile-photo");

    accountAvatar.hidden = !profileImage;
    if (profileImage) {
        accountAvatar.src = profileImage;
    } else {
        accountAvatar.removeAttribute("src");
    }
    document.querySelector("#account-avatar-fallback").hidden = Boolean(profileImage);
    document.querySelector("#account-avatar-fallback").textContent = initials;
    document.querySelector(".account-avatar-link").setAttribute("aria-label", `Abrir perfil de ${currentAccount.name}`);

    profilePhoto.hidden = !profileImage;
    if (profileImage) {
        profilePhoto.src = profileImage;
    } else {
        profilePhoto.removeAttribute("src");
    }
    profilePhoto.alt = profileImage ? `Fotografia de perfil de ${currentAccount.name}` : "";
    document.querySelector("#profile-photo-fallback").hidden = Boolean(profileImage);
    document.querySelector("#profile-photo-fallback").textContent = initials;
    document.querySelector("#profile-name").textContent = currentAccount.name;
    document.querySelector("#profile-email").textContent = currentAccount.email;
    document.querySelector("#profile-birthdate").textContent = currentAccount.birthdate
        ? new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" })
            .format(new Date(`${currentAccount.birthdate}T00:00:00`))
        : "Não indicada";
    document.querySelector("#profile-photo-remove").hidden = !profileImage;
}

async function saveProfileImage(profileImage) {
    const account = await getAccount(currentAccount.email);
    if (!account) {
        throw new Error("Não foi possível encontrar a conta neste dispositivo.");
    }

    await updateAccount({ ...account, profileImage });
    currentAccount = { ...currentAccount, profileImage };
    renderProfile();
}

async function resizeProfileImage(file) {
    if (!file.type.startsWith("image/")) {
        throw new Error("Escolhe um ficheiro de imagem válido.");
    }
    if (file.size > 10 * 1024 * 1024) {
        throw new Error("A fotografia tem de ter menos de 10 MB.");
    }

    const bitmap = await createImageBitmap(file);
    try {
        const cropSize = Math.min(bitmap.width, bitmap.height);
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Não foi possível preparar a fotografia neste navegador.");
        }
        context.drawImage(
            bitmap,
            (bitmap.width - cropSize) / 2,
            (bitmap.height - cropSize) / 2,
            cropSize,
            cropSize,
            0,
            0,
            canvas.width,
            canvas.height
        );
        return canvas.toDataURL("image/jpeg", 0.84);
    } finally {
        bitmap.close();
    }
}

function showStatus(message, isError = false) {
    if (!statusElement) {
        return;
    }

    statusElement.textContent = message;
    statusElement.classList.toggle("is-error", isError);
    statusElement.hidden = !message;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function formatDate(value) {
    return new Intl.DateTimeFormat("pt-PT", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value));
}

function navigate() {
    const screenName = window.location.hash.slice(1) || "painel";
    const screen = document.querySelector(`[data-screen="${screenName}"]`);
    const activeScreen = screen || document.querySelector('[data-screen="painel"]');

    document.querySelectorAll("[data-screen]").forEach((item) => {
        item.hidden = item !== activeScreen;
    });

    document.querySelectorAll(".nav-links a[href^='#']").forEach((link) => {
        const isActive = link.hash === `#${activeScreen.id}`;
        link.classList.toggle("active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    const heading = activeScreen.querySelector("h1");
    if (heading) {
        document.title = `${heading.textContent} · FloraAura`;
    }
}

function plantPhotoMarkup(plant, className = "catalog-photo") {
    const photo = plantPhotos.get(plant.id);
    if (!photo) {
        return `<div class="photo-unavailable" role="img" aria-label="Fotografia indisponível: ${escapeHtml(plant.name)}">Fotografia indisponível</div>`;
    }

    const photographer = photo.credit && photo.credit !== "Wikimedia Commons"
        ? ` · ${photo.credit}`
        : "";
    const license = photo.license ? ` · ${photo.license}` : "";

    return `
        <img class="${className}" src="${escapeHtml(photo.src)}" alt="Fotografia real de ${escapeHtml(plant.name)}"
            loading="lazy" decoding="async">
        <a class="photo-credit" href="${escapeHtml(photo.source)}" target="_blank" rel="noreferrer">
            Fotografia: ${escapeHtml(photo.title)}${escapeHtml(photographer)} · Wikimedia Commons${escapeHtml(license)}
        </a>
    `;
}

function careDetailsMarkup(plant) {
    return `
        <dl class="care-details">
            <div><dt>Nome científico</dt><dd>${escapeHtml(plant.species)}</dd></div>
            <div><dt>Luz</dt><dd>${escapeHtml(plant.light)}</dd></div>
            <div><dt>Rega</dt><dd>${escapeHtml(plant.water)}</dd></div>
            <div><dt>Temperatura</dt><dd>${escapeHtml(plant.temperature)}</dd></div>
            <div><dt>Humidade</dt><dd>${escapeHtml(plant.humidity)}</dd></div>
            <div><dt>Atenção</dt><dd>${escapeHtml(plant.toxicity)}</dd></div>
        </dl>
        <p class="care-description">${escapeHtml(plant.description)}</p>
        <p class="care-note">Os cuidados são orientações gerais e podem variar com a estação, a variedade e o ambiente.</p>
    `;
}

function normalizeSearch(value) {
    return value.trim().toLocaleLowerCase("pt-PT")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function catalogCardMarkup(plant) {
    const isFavorite = favoriteIds.includes(plant.id);
    const favoriteLabel = isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
    return `
        <article class="catalog-card">
            <div class="catalog-photo-wrap">
                ${plantPhotoMarkup(plant)}
                <button class="favorite-button${isFavorite ? " is-favorite" : ""}" type="button"
                    data-favorite-toggle="${escapeHtml(plant.id)}" aria-label="${favoriteLabel}" aria-pressed="${isFavorite}">
                    ${isFavorite ? "♥" : "♡"}
                </button>
            </div>
            <div class="catalog-card-content">
                <span class="plant-category">${escapeHtml(plant.category)}</span>
                <h2>${escapeHtml(plant.name)}</h2>
                <p class="plant-species">${escapeHtml(plant.species)}</p>
                <strong class="product-price">${currencyFormatter.format(plant.price)}</strong>
                <details class="catalog-care">
                    <summary>Ver características e cuidados</summary>
                    ${careDetailsMarkup(plant)}
                </details>
                <button class="btn-card" type="button" data-cart-add="${escapeHtml(plant.id)}">🛒 Adicionar ao carrinho</button>
                <button class="btn-garden" type="button" data-catalog-add="${escapeHtml(plant.species)}" data-plant-name="${escapeHtml(plant.name)}">
                    + Guardar no meu jardim
                </button>
            </div>
        </article>
    `;
}

function bindPhotoFallbacks(container) {
    container.querySelectorAll("img").forEach((image) => {
        image.addEventListener("error", () => {
            const unavailable = document.createElement("div");
            unavailable.className = "photo-unavailable";
            unavailable.setAttribute("role", "img");
            unavailable.setAttribute("aria-label", `Fotografia indisponível: ${image.alt.replace("Fotografia real de ", "")}`);
            unavailable.textContent = "Fotografia indisponível";
            image.replaceWith(unavailable);
        }, { once: true });
    });
}

function renderCatalog(searchTerm = "") {
    const grid = document.querySelector("#catalog-grid");
    const normalizedSearch = normalizeSearch(searchTerm);
    const filteredPlants = catalog.filter((plant) => (
        normalizeSearch(`${plant.name} ${plant.species} ${plant.category} ${plant.searchTerms}`)
            .includes(normalizedSearch)
    ));
    document.querySelector("#catalog-results").textContent = (
        `${filteredPlants.length} ${filteredPlants.length === 1 ? "planta encontrada" : "plantas encontradas"}`
    );

    if (filteredPlants.length === 0) {
        grid.innerHTML = '<p class="empty-state">Não encontrámos plantas com esse nome. Experimenta outra pesquisa.</p>';
        return;
    }

    grid.innerHTML = filteredPlants.map(catalogCardMarkup).join("");
    bindPhotoFallbacks(grid);
}

function renderFavorites() {
    const grid = document.querySelector("#favorites-grid");
    const favoritePlants = catalog.filter((plant) => favoriteIds.includes(plant.id));
    document.querySelector("#favorites-count").textContent = favoritePlants.length;
    grid.innerHTML = favoritePlants.length
        ? favoritePlants.map(catalogCardMarkup).join("")
        : '<div class="empty-state"><span aria-hidden="true">♡</span><h2>Ainda não tens favoritas</h2><p>Adiciona plantas aos favoritos através do coração no catálogo.</p><a class="btn-secondary" href="#catalogo">Explorar a loja</a></div>';
    bindPhotoFallbacks(grid);
}

async function loadPlantPhotos() {
    const response = await fetch("./assets/images/plants/photos.json");
    if (!response.ok) {
        throw new Error(`Não foi possível carregar as fotografias (${response.status}).`);
    }
    const manifest = await response.json();
    const photos = Array.isArray(manifest) ? manifest : manifest.value;
    if (!Array.isArray(photos)) {
        throw new Error("O ficheiro das fotografias tem um formato inválido.");
    }
    plantPhotos = new Map(photos.map((photo) => [photo.id, photo]));
    const missingPhotos = catalog.filter((plant) => !plantPhotos.has(plant.id));
    if (missingPhotos.length > 0) {
        console.error("Faltam fotografias para algumas plantas.", missingPhotos.map((plant) => plant.name));
    }
}

function renderIdentifyOptions() {
    identifySelect.insertAdjacentHTML("beforeend", catalog.map((plant) => (
        `<option value="${escapeHtml(plant.id)}">${escapeHtml(plant.name)} · ${escapeHtml(plant.species)}</option>`
    )).join(""));
}

function renderCart() {
    const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector("#cart-count").textContent = quantity;
    cartSummary.hidden = cartItems.length === 0;
    if (cartItems.length === 0) {
        cartList.innerHTML = '<div class="empty-state"><span aria-hidden="true">🛒</span><h2>O carrinho está vazio</h2><p>Explora a loja e adiciona as tuas plantas.</p><a class="btn-secondary" href="#catalogo">Ver a loja</a></div>';
        return;
    }

    let total = 0;
    cartList.innerHTML = cartItems.map((item) => {
        const product = getPlantById(item.productId);
        if (!product) {
            return "";
        }
        total += product.price * item.quantity;
        return `
            <article class="cart-item">
                <div class="cart-item-image">${plantPhotoMarkup(product, "cart-photo")}</div>
                <div class="cart-item-info">
                    <h2>${escapeHtml(product.name)}</h2>
                    <p>${currencyFormatter.format(product.price)} cada</p>
                    <div class="cart-quantity">
                        <button type="button" data-cart-change="${escapeHtml(product.id)}" data-delta="-1" aria-label="Diminuir quantidade">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-cart-change="${escapeHtml(product.id)}" data-delta="1" aria-label="Aumentar quantidade">+</button>
                        <button class="cart-remove" type="button" data-cart-remove="${escapeHtml(product.id)}">Remover</button>
                    </div>
                </div>
                <strong>${currencyFormatter.format(product.price * item.quantity)}</strong>
            </article>
        `;
    }).join("");
    document.querySelector("#cart-total").textContent = currencyFormatter.format(total);
}

async function updateCart(productId, delta) {
    const item = cartItems.find((cartItem) => cartItem.productId === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cartItems = cartItems.filter((cartItem) => cartItem.productId !== productId);
        }
    } else if (delta > 0) {
        cartItems.push({ productId, quantity: delta });
    }

    try {
        await saveCart(currentAccount.email, cartItems);
        renderCart();
    } catch (error) {
        console.error("Não foi possível atualizar o carrinho.", error);
        showStatus("Não foi possível guardar o carrinho. Tenta novamente.", true);
    }
}

function plantCard(plant) {
    const wateredText = plant.lastWatered
        ? `Regada a ${formatDate(plant.lastWatered)}`
        : `Adicionada a ${formatDate(plant.createdAt)}`;
    const nextWatering = getNextWateringDate(plant);
    const reminderText = plant.reminderEnabled
        ? (nextWatering <= Date.now()
            ? "Rega recomendada agora"
            : `Próxima rega: ${formatDate(nextWatering)}`)
        : "Lembrete desligado";

    return `
        <article class="my-plant-card">
            <div class="plant-avatar" aria-hidden="true">${escapeHtml(plant.emoji || "🪴")}</div>
            <div class="my-plant-details">
                <h3>${escapeHtml(plant.name)}</h3>
                <p>${escapeHtml(plant.species || plant.location || "A crescer no teu jardim")}</p>
                <span class="plant-meta">${escapeHtml(plant.location || "Meu jardim")} · ${escapeHtml(wateredText)}</span>
                <span class="plant-reminder">${escapeHtml(reminderText)}</span>
            </div>
            <div class="plant-actions">
                <button class="water-button" type="button" data-water="${plant.id}" aria-label="Registar rega de ${escapeHtml(plant.name)}">
                    <span aria-hidden="true">💧</span><span>Regar</span>
                </button>
                <button class="reminder-toggle" type="button" data-reminder="${plant.id}" aria-pressed="${Boolean(plant.reminderEnabled)}">
                    ${plant.reminderEnabled ? "Desativar lembrete" : "Ativar lembrete"}
                </button>
            </div>
        </article>
    `;
}

function getNextWateringDate(plant) {
    const lastCareDate = plant.lastWatered || plant.createdAt;
    const intervalDays = Number(plant.waterIntervalDays) || 7;
    return new Date(lastCareDate).getTime() + intervalDays * 24 * 60 * 60 * 1000;
}

function renderPlants() {
    const plantsMarkup = plants.length
        ? plants.map(plantCard).join("")
        : '<div class="empty-state"><span aria-hidden="true">🪴</span><h2>O teu jardim começa aqui</h2><p>Adiciona a primeira planta para começares a acompanhar os seus cuidados.</p><a class="btn-secondary" href="#catalogo">Explorar catálogo</a></div>';

    document.querySelector("#my-plants").innerHTML = plantsMarkup;
    document.querySelector("#dashboard-plants").innerHTML = plants.length
        ? plants.slice(0, 3).map(plantCard).join("")
        : '<div class="empty-state compact-empty"><span aria-hidden="true">🌱</span><p>Ainda não tens plantas guardadas.</p><a href="#catalogo">Escolher uma planta →</a></div>';
    document.querySelector("#plant-count").textContent = plants.length;
    document.querySelector("#care-count").textContent = careLogs.length;
    renderReminders();
}

function renderReminders() {
    const list = document.querySelector("#reminder-list");
    const reminders = plants
        .filter((plant) => plant.reminderEnabled)
        .sort((first, second) => getNextWateringDate(first) - getNextWateringDate(second));
    list.innerHTML = reminders.length
        ? reminders.map(plantCard).join("")
        : '<div class="empty-state"><span aria-hidden="true">🔔</span><h2>Sem lembretes ativos</h2><p>Ativa um lembrete nas tuas plantas para acompanhar a próxima rega.</p><a class="btn-secondary" href="#plantas">Ver as minhas plantas</a></div>';

    const dueCount = reminders.filter((plant) => getNextWateringDate(plant) <= Date.now()).length;
    if (dueCount > 0) {
        showStatus(`${dueCount} ${dueCount === 1 ? "planta precisa" : "plantas precisam"} de atenção para a rega.`);
    }
}

function renderCareLogs() {
    const list = document.querySelector("#care-list");
    const sortedLogs = [...careLogs].sort((first, second) => (
        new Date(second.date).getTime() - new Date(first.date).getTime()
    ));

    list.innerHTML = sortedLogs.length
        ? sortedLogs.map((log) => `
            <article class="care-entry">
                <span class="care-entry-icon" aria-hidden="true">${log.type === "rega" ? "💧" : "🌱"}</span>
                <div>
                    <h2>${escapeHtml(log.plantName)}</h2>
                    <p>${log.type === "rega" ? "Rega registada" : "Planta adicionada"} · ${formatDate(log.date)}</p>
                </div>
            </article>
        `).join("")
        : '<div class="empty-state"><span aria-hidden="true">📖</span><h2>Os teus registos aparecem aqui</h2><p>Quando adicionares ou regares uma planta, o histórico fica guardado neste ecrã.</p><a href="#plantas">Ver as minhas plantas →</a></div>';
}

async function refreshData() {
    [plants, careLogs] = await Promise.all([
        getPlants(currentAccount.email),
        getCareLogs(currentAccount.email)
    ]);
    renderPlants();
    renderCareLogs();
}

function openAddDialog(name = "", species = "") {
    form.reset();
    form.elements.name.value = name;
    form.elements.species.value = species;
    if (typeof dialog.showModal === "function") {
        dialog.showModal();
        form.elements.name.focus();
    } else {
        showStatus("Este navegador não suporta o formulário de adicionar plantas.", true);
    }
}

window.addEventListener("hashchange", navigate);
navigate();
renderIdentifyOptions();
catalogSearch.addEventListener("input", () => renderCatalog(catalogSearch.value));
document.querySelector("#register-birthdate").max = todayAsDateInputValue();
document.querySelector("#plant-photo").required = true;

document.querySelector("#plant-photo").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
        photoPreviewUrl = "";
    }

    if (!file) {
        photoPreview.hidden = true;
        photoPreview.removeAttribute("src");
        return;
    }

    if (!file.type.startsWith("image/")) {
        event.target.value = "";
        showStatus("Escolhe um ficheiro de imagem válido.", true);
        return;
    }

    photoPreviewUrl = URL.createObjectURL(file);
    photoPreview.src = photoPreviewUrl;
    photoPreview.hidden = false;
});

document.querySelector("#identify-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const plant = getPlantById(identifySelect.value);
    if (!plant) {
        showStatus("Escolhe uma planta para consultar os cuidados.", true);
        return;
    }

    document.querySelector("#plant-care-result").innerHTML = `
        <article class="care-result-card">
            <div class="catalog-photo-wrap">${plantPhotoMarkup(plant, "care-result-photo")}</div>
            <div class="catalog-card-content">
                <span class="plant-category">${escapeHtml(plant.category)}</span>
                <h2>${escapeHtml(plant.name)}</h2>
                ${careDetailsMarkup(plant)}
            </div>
        </article>
    `;
});

window.addEventListener("beforeunload", () => {
    if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
    }
});

document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode));
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(registerForm);
    const birthdate = String(data.get("birthdate"));
    if (birthdate > todayAsDateInputValue()) {
        showAuthStatus("A data de nascimento não pode ser no futuro.", true);
        return;
    }

    try {
        const account = await registerAccount({
            name: String(data.get("name")),
            birthdate,
            email: String(data.get("email")),
            password: String(data.get("password"))
        });
        registerForm.reset();
        showAuthStatus("");
        await enterApplication(account);
    } catch (error) {
        console.error("Não foi possível criar a conta.", error);
        showAuthStatus(error.message || "Não foi possível criar a conta. Tenta novamente.", true);
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    try {
        const account = await loginAccount({
            name: String(data.get("name")),
            email: String(data.get("email")),
            password: String(data.get("password"))
        });
        loginForm.reset();
        showAuthStatus("");
        await enterApplication(account);
    } catch (error) {
        console.error("Não foi possível iniciar sessão.", error);
        showAuthStatus(error.message || "Não foi possível iniciar sessão. Tenta novamente.", true);
    }
});

document.querySelector("#logout-button").addEventListener("click", () => {
    try {
        signOut();
        currentAccount = null;
        applicationShell.hidden = true;
        authScreen.hidden = false;
        setAuthMode("login");
        window.location.hash = "";
    } catch (error) {
        console.error("Não foi possível terminar a sessão.", error);
        showStatus(error.message || "Não foi possível terminar a sessão.", true);
    }
});

profilePhotoInput.addEventListener("change", async () => {
    const [file] = profilePhotoInput.files;
    if (!file) {
        return;
    }

    try {
        const profileImage = await resizeProfileImage(file);
        await saveProfileImage(profileImage);
        showStatus("Fotografia de perfil atualizada.");
    } catch (error) {
        console.error("Não foi possível atualizar a fotografia de perfil.", error);
        showStatus(error.message || "Não foi possível guardar a fotografia. Tenta novamente.", true);
    } finally {
        profilePhotoInput.value = "";
    }
});

document.querySelector("#profile-photo-remove").addEventListener("click", async () => {
    try {
        await saveProfileImage("");
        showStatus("Fotografia de perfil removida.");
    } catch (error) {
        console.error("Não foi possível remover a fotografia de perfil.", error);
        showStatus("Não foi possível remover a fotografia. Tenta novamente.", true);
    }
});

document.addEventListener("click", async (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const openButton = event.target.closest("[data-open-add]");
    if (openButton) {
        openAddDialog();
        return;
    }

    const closeButton = event.target.closest("[data-close-dialog]");
    if (closeButton) {
        dialog.close();
        return;
    }

    const catalogButton = event.target.closest("[data-catalog-add]");
    if (catalogButton) {
        openAddDialog(catalogButton.dataset.plantName, catalogButton.dataset.catalogAdd);
        return;
    }

    const favoriteButton = event.target.closest("[data-favorite-toggle]");
    if (favoriteButton) {
        const plantId = favoriteButton.dataset.favoriteToggle;
        const previousFavorites = favoriteIds;
        favoriteIds = favoriteIds.includes(plantId)
            ? favoriteIds.filter((id) => id !== plantId)
            : [...favoriteIds, plantId];
        try {
            await saveFavorites(currentAccount.email, favoriteIds);
            renderCatalog(catalogSearch.value);
            renderFavorites();
            showStatus(favoriteIds.includes(plantId)
                ? "Planta adicionada aos favoritos."
                : "Planta removida dos favoritos.");
        } catch (error) {
            favoriteIds = previousFavorites;
            console.error("Não foi possível guardar os favoritos.", error);
            renderCatalog(catalogSearch.value);
            renderFavorites();
            showStatus("Não foi possível atualizar os favoritos. Tenta novamente.", true);
        }
        return;
    }

    const cartButton = event.target.closest("[data-cart-add]");
    if (cartButton) {
        await updateCart(cartButton.dataset.cartAdd, 1);
        showStatus(`${getPlantById(cartButton.dataset.cartAdd).name} foi adicionada ao carrinho.`);
        return;
    }

    const cartChangeButton = event.target.closest("[data-cart-change]");
    if (cartChangeButton) {
        await updateCart(cartChangeButton.dataset.cartChange, Number(cartChangeButton.dataset.delta));
        return;
    }

    const cartRemoveButton = event.target.closest("[data-cart-remove]");
    if (cartRemoveButton) {
        const productId = cartRemoveButton.dataset.cartRemove;
        cartItems = cartItems.filter((item) => item.productId !== productId);
        try {
            await saveCart(currentAccount.email, cartItems);
            renderCart();
        } catch (error) {
            console.error("Não foi possível remover o produto do carrinho.", error);
            showStatus("Não foi possível atualizar o carrinho. Tenta novamente.", true);
        }
        return;
    }

    const waterButton = event.target.closest("[data-water]");
    if (waterButton) {
        const plant = plants.find((item) => item.id === Number(waterButton.dataset.water));
        if (!plant) {
            showStatus("Não foi possível encontrar esta planta. Atualiza o ecrã e tenta novamente.", true);
            return;
        }

        const date = new Date().toISOString();
        try {
            await Promise.all([
                updatePlant({ ...plant, lastWatered: date }),
                addCareLog({
                    plantId: plant.id,
                    plantName: plant.name,
                    accountEmail: currentAccount.email,
                    type: "rega",
                    date
                })
            ]);
            await refreshData();
            showStatus(`Rega registada para ${plant.name}.`);
        } catch (error) {
            console.error("Não foi possível registar a rega.", error);
            showStatus("Não foi possível guardar a rega. Tenta novamente.", true);
        }
    }

    const reminderButton = event.target.closest("[data-reminder]");
    if (reminderButton) {
        const plant = plants.find((item) => item.id === Number(reminderButton.dataset.reminder));
        if (!plant) {
            showStatus("Não foi possível encontrar esta planta. Atualiza o ecrã e tenta novamente.", true);
            return;
        }

        try {
            await updatePlant({ ...plant, reminderEnabled: !plant.reminderEnabled });
            await refreshData();
            showStatus(plant.reminderEnabled
                ? `Lembrete desativado para ${plant.name}.`
                : `Lembrete ativado para ${plant.name}.`);
        } catch (error) {
            console.error("Não foi possível atualizar o lembrete.", error);
            showStatus("Não foi possível guardar o lembrete. Tenta novamente.", true);
        }
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const waterIntervalDays = Number(formData.get("waterInterval"));
    if (!Number.isInteger(waterIntervalDays) || waterIntervalDays < 1 || waterIntervalDays > 60) {
        showStatus("Escolhe um intervalo de rega entre 1 e 60 dias.", true);
        return;
    }
    const plant = {
        name: String(formData.get("name")).trim(),
        species: String(formData.get("species")).trim(),
        location: String(formData.get("location")),
        emoji: "🪴",
        waterIntervalDays,
        reminderEnabled: formData.get("reminderEnabled") === "on",
        accountEmail: currentAccount.email,
        createdAt: new Date().toISOString()
    };

    try {
        const id = await addPlant(plant);
        await addCareLog({
            plantId: id,
            plantName: plant.name,
            accountEmail: currentAccount.email,
            type: "adicionada",
            date: plant.createdAt
        });
        await refreshData();
        dialog.close();
        window.location.hash = "#plantas";
        showStatus(`${plant.name} foi adicionada ao teu jardim.`);
    } catch (error) {
        console.error("Não foi possível adicionar a planta.", error);
        showStatus("Não foi possível guardar a planta neste dispositivo. Tenta novamente.", true);
    }
});

document.querySelector("#app-status").hidden = true;
window.addEventListener("online", () => showStatus("Ligação à internet restabelecida."));
window.addEventListener("offline", () => showStatus("Estás offline. Os teus dados continuam guardados neste dispositivo."));

async function initializeApp() {
    try {
        const database = await openDatabase();
        database.close();
        try {
            await loadPlantPhotos();
        } catch (error) {
            console.error("Não foi possível carregar as fotografias do catálogo.", error);
            showAuthStatus("As fotografias do catálogo não estão disponíveis neste momento.", true);
        }
        renderCatalog();
        const account = await getSessionAccount();
        if (account) {
            await enterApplication(account);
        }
    } catch (error) {
        console.error("Não foi possível carregar os dados locais.", error);
        showAuthStatus("Não foi possível abrir o armazenamento local. Verifica as permissões do navegador.", true);
    }

    if ("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("./sw.js");
        } catch (error) {
            console.error("Não foi possível registar o service worker.", error);
            showStatus("Os ecrãs funcionam, mas o modo offline não pôde ser ativado.", true);
        }
    }
}

document.querySelector("#checkout-button").addEventListener("click", async () => {
    if (cartItems.length === 0) {
        return;
    }
    cartItems = [];
    try {
        await saveCart(currentAccount.email, cartItems);
        renderCart();
        showStatus("Encomenda de demonstração confirmada. Não foi efetuado qualquer pagamento ou envio.");
    } catch (error) {
        console.error("Não foi possível confirmar a encomenda de demonstração.", error);
        showStatus("Não foi possível guardar a encomenda. Tenta novamente.", true);
    }
});

window.addEventListener("load", initializeApp, { once: true });
