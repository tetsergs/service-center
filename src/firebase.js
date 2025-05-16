// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhvAhySTY9NE10_oenVOYxDYx20pafY3w",
  authDomain: "servicecenter-tetser.firebaseapp.com",
  projectId: "servicecenter-tetser",
  storageBucket: "servicecenter-tetser.firebasestorage.app",
  messagingSenderId: "177149149059",
  appId: "1:177149149059:web:d9138e71616742b30640b6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
