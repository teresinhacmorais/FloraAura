import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { addAccount, getAccount } from "./db.js";

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
        uid: account.uid,
        name: account.name,
        email: account.email,
        birthdate: account.birthdate,
        profileImage: account.profileImage || ""
    };
}

export async function registerAccount({ name, birthdate, email, password }) {
    const trimmedName = name.trim();
    const normalizedEmail = normalizeEmail(email);
    if (!trimmedName || !normalizedEmail || password.length < 8) {
        throw new Error("Preenche todos os campos e escolhe uma password com pelo menos 8 caracteres.");
    }
    if (!birthdate || Number.isNaN(Date.parse(`${birthdate}T00:00:00`))
        || birthdate > todayAsDateInputValue()) {
        throw new Error("Indica uma data de nascimento válida.");
    }

    try {
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const account = {
            uid: credential.user.uid,
            name: trimmedName,
            birthdate,
            email: normalizedEmail,
            profileImage: ""
        };
        await addAccount(account);
        return publicAccount(account);
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            throw new Error("Já existe uma conta com este email.");
        }
        if (error.code === "auth/invalid-email") {
            throw new Error("Indica um email válido.");
        }
        if (error.code === "auth/weak-password") {
            throw new Error("A password deve ter pelo menos 6 caracteres.");
        }
        throw error;
    }
}

export async function loginAccount({ name, email, password }) {
    if (!name.trim() || !email.trim() || !password) {
        throw new Error("Preenche o nome, o email e a password.");
    }
    try {
        const credential = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
        const account = await getAccount(credential.user.uid);
        if (!account || account.name.toLocaleLowerCase("pt-PT") !== name.trim().toLocaleLowerCase("pt-PT")) {
            await firebaseSignOut(auth);
            throw new Error("Nome, email ou password incorretos.");
        }
        return publicAccount(account);
    } catch (error) {
        if (error.code === "auth/invalid-credential"
            || error.code === "auth/user-not-found"
            || error.code === "auth/wrong-password") {
            throw new Error("Nome, email ou password incorretos.");
        }
        throw error;
    }
}

export function getSessionEmail() {
    return auth.currentUser?.email || null;
}

export async function getSessionAccount() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (!user) {
                resolve(null);
                return;
            }
            try {
                const account = await getAccount(user.uid);
                resolve(account ? publicAccount(account) : null);
            } catch (error) {
                reject(error);
            }
        }, reject);
    });
}

export function signOut() {
    return firebaseSignOut(auth);
}
