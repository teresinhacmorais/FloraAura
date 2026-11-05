const DATABASE_NAME = "flora-aura";
const DATABASE_VERSION = 4;

export function openDatabase() {
    if (!("indexedDB" in window)) {
        return Promise.reject(new Error("Este navegador não suporta IndexedDB."));
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.addEventListener("upgradeneeded", () => {
            const database = request.result;

            if (!database.objectStoreNames.contains("plants")) {
                database.createObjectStore("plants", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }

            if (!database.objectStoreNames.contains("careLogs")) {
                database.createObjectStore("careLogs", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }

            if (!database.objectStoreNames.contains("accounts")) {
                database.createObjectStore("accounts", { keyPath: "email" });
            }

            if (!database.objectStoreNames.contains("carts")) {
                database.createObjectStore("carts", { keyPath: "email" });
            }

            if (!database.objectStoreNames.contains("favorites")) {
                database.createObjectStore("favorites", { keyPath: "email" });
            }
        });

        request.addEventListener("success", () => resolve(request.result), { once: true });
        request.addEventListener("error", () => {
            reject(request.error || new Error("Não foi possível abrir a base de dados."));
        }, { once: true });
    });
}

function runTransaction(storeName, mode, operation) {
    return openDatabase().then((database) => new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const request = operation(transaction.objectStore(storeName));

        request.addEventListener("success", () => resolve(request.result), { once: true });
        request.addEventListener("error", () => {
            reject(request.error || new Error("Não foi possível guardar os dados."));
        }, { once: true });
        transaction.addEventListener("complete", () => database.close(), { once: true });
        transaction.addEventListener("abort", () => {
            database.close();
            reject(transaction.error || new Error("A operação local foi cancelada."));
        }, { once: true });
    }));
}

export function getPlants(accountEmail) {
    return runTransaction("plants", "readonly", (store) => store.getAll())
        .then((plants) => plants.filter((plant) => plant.accountEmail === accountEmail));
}

export function addPlant(plant) {
    return runTransaction("plants", "readwrite", (store) => store.add(plant));
}

export function updatePlant(plant) {
    return runTransaction("plants", "readwrite", (store) => store.put(plant));
}

export function getCareLogs(accountEmail) {
    return runTransaction("careLogs", "readonly", (store) => store.getAll())
        .then((logs) => logs.filter((log) => log.accountEmail === accountEmail));
}

export function addCareLog(log) {
    return runTransaction("careLogs", "readwrite", (store) => store.add(log));
}

export function getAccount(email) {
    return runTransaction("accounts", "readonly", (store) => store.get(email));
}

export function addAccount(account) {
    return runTransaction("accounts", "readwrite", (store) => store.add(account));
}

export function updateAccount(account) {
    return runTransaction("accounts", "readwrite", (store) => store.put(account));
}

export function getCart(email) {
    return runTransaction("carts", "readonly", (store) => store.get(email));
}

export function saveCart(email, items) {
    return runTransaction("carts", "readwrite", (store) => store.put({ email, items }));
}

export function getFavorites(email) {
    return runTransaction("favorites", "readonly", (store) => store.get(email));
}

export function saveFavorites(email, ids) {
    return runTransaction("favorites", "readwrite", (store) => store.put({ email, ids }));
}
