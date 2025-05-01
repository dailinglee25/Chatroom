// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// 如果之後要用 Storage、Functions… 就各自再 import

const firebaseConfig = {
  apiKey: "AIzaSyBhHqPDmJaaTevV1f8npi5PmT9jiW3k_50",
  authDomain: "chatroom-react-dc12f.firebaseapp.com",
  projectId: "chatroom-react-dc12f",
  storageBucket: "chatroom-react-dc12f.appspot.com",   // ← 修掉 firebasestorage.app 的拼字
  messagingSenderId: "622833419257",
  appId: "1:622833419257:web:49d7469697a222301c7328",
  measurementId: "G-GTT7P0L163",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const storage = getStorage(app);

