import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { enableIndexedDbPersistence, getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC0ATXJ_HKZFyV1-uhUkjwOo9Iy_NSnyIY",
    authDomain: "floraaura-b07b9.firebaseapp.com",
    projectId: "floraaura-b07b9",
    storageBucket: "floraaura-b07b9.firebasestorage.app",
    messagingSenderId: "224368498842",
    appId: "1:224368498842:web:f8260ea3f179ccc374e723",
    measurementId: "G-2V9LNGHM6J"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((error) => {
    if (!["failed-precondition", "unimplemented"].includes(error.code)) {
        console.error("Não foi possível ativar o armazenamento offline do Firebase.", error);
    }
});

isSupported()
    .then((supported) => {
        if (supported) {
            getAnalytics(app);
        }
    })
    .catch(() => {
        // Analytics is optional.
    });
