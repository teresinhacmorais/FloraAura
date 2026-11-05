import { addAccount, getAccount } from "./db.js";

const SESSION_KEY = "flora-aura-account";
const PASSWORD_ITERATIONS = 310000;

function todayAsDateInputValue() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function publicAccount(account) {
    return {
        name: account.name,
        email: account.email,
        birthdate: account.birthdate,
        profileImage: account.profileImage || ""
    };
}

function requireCrypto() {
    if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
        throw new Error("A segurança da conta requer um navegador moderno em HTTPS ou localhost.");
    }
}

async function hashPassword(password, salt) {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const hash = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: PASSWORD_ITERATIONS,
        hash: "SHA-256"
    }, key, 256);

    return new Uint8Array(hash);
}

function toBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function hashesMatch(first, second) {
    if (first.length !== second.length) {
        return false;
    }

    let difference = 0;
    for (let index = 0; index < first.length; index += 1) {
        difference |= first[index] ^ second[index];
    }
    return difference === 0;
}

function saveSession(email) {
    try {
        sessionStorage.setItem(SESSION_KEY, email);
    } catch (error) {
        throw new Error("Não foi possível iniciar a sessão neste navegador.", { cause: error });
    }
}

export async function registerAccount({ name, birthdate, email, password }) {
    requireCrypto();
    const trimmedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    if (!trimmedName || !normalizedEmail || password.length < 8) {
        throw new Error("Preenche todos os campos e escolhe uma password com pelo menos 8 caracteres.");
    }
    if (!birthdate || Number.isNaN(Date.parse(`${birthdate}T00:00:00`))
        || birthdate > todayAsDateInputValue()) {
        throw new Error("Indica uma data de nascimento válida.");
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(password, salt);
    const account = {
        name: trimmedName,
        birthdate,
        email: normalizedEmail,
        passwordSalt: toBase64(salt),
        passwordHash: toBase64(passwordHash)
    };

    try {
        await addAccount(account);
    } catch (error) {
        if (error.name === "ConstraintError") {
            throw new Error("Já existe uma conta com este email.");
        }
        throw error;
    }

    saveSession(account.email);
    return publicAccount(account);
}

export async function loginAccount({ name, email, password }) {
    requireCrypto();
    if (!name.trim() || !email.trim() || !password) {
        throw new Error("Preenche o nome, o email e a password.");
    }
    const account = await getAccount(normalizeEmail(email));
    if (!account || account.name.toLocaleLowerCase("pt-PT") !== name.trim().toLocaleLowerCase("pt-PT")) {
        throw new Error("Nome, email ou password incorretos.");
    }

    const passwordHash = await hashPassword(password, fromBase64(account.passwordSalt));
    if (!hashesMatch(passwordHash, fromBase64(account.passwordHash))) {
        throw new Error("Nome, email ou password incorretos.");
    }

    saveSession(account.email);
    return publicAccount(account);
}

export function getSessionEmail() {
    try {
        return sessionStorage.getItem(SESSION_KEY);
    } catch (error) {
        throw new Error("Não foi possível ler a sessão neste navegador.", { cause: error });
    }
}

export async function getSessionAccount() {
    const email = getSessionEmail();
    if (!email) {
        return null;
    }

    const account = await getAccount(email);
    if (!account) {
        signOut();
        return null;
    }
    return publicAccount(account);
}

export function signOut() {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
        throw new Error("Não foi possível terminar a sessão neste navegador.", { cause: error });
    }
}
