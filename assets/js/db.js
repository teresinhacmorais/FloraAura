import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { db } from "./firebase.js";

export function openDatabase() {
    return Promise.resolve({ close: () => {} });
}

export async function getPlants(accountEmail) {
    const result = await getDocs(query(
        collection(db, "plants"),
        where("accountEmail", "==", accountEmail)
    ));
    return result.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function addPlant(plant) {
    return addDoc(collection(db, "plants"), plant).then((result) => result.id);
}

export function updatePlant(plant) {
    const { id, ...data } = plant;
    return updateDoc(doc(db, "plants", id), data);
}

export async function getCareLogs(accountEmail) {
    const result = await getDocs(query(
        collection(db, "careLogs"),
        where("accountEmail", "==", accountEmail)
    ));
    return result.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function addCareLog(log) {
    return addDoc(collection(db, "careLogs"), log).then((result) => result.id);
}

export async function getAccount(uid) {
    const result = await getDoc(doc(db, "accounts", uid));
    return result.exists() ? { id: result.id, ...result.data() } : null;
}

export function addAccount(account) {
    return setDoc(doc(db, "accounts", account.uid), account);
}

export function updateAccount(account) {
    const { uid, id, ...data } = account;
    return setDoc(doc(db, "accounts", uid), data, { merge: true });
}

export async function getCart(email) {
    const snapshot = await getDoc(doc(db, "carts", email));
    return snapshot.exists() ? snapshot.data() : null;
}

export function saveCart(email, items) {
    return setDoc(doc(db, "carts", email), { email, items });
}

export async function getFavorites(email) {
    const snapshot = await getDoc(doc(db, "favorites", email));
    return snapshot.exists() ? snapshot.data() : null;
}

export function saveFavorites(email, ids) {
    return setDoc(doc(db, "favorites", email), { email, ids });
}
