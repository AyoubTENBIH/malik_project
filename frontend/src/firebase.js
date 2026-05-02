import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const fallbackConfig = {
  apiKey: "AIzaSyBfErk5AjbyTqxVprw_yKuVEJDMEldg4pc",
  authDomain: "iot-projet-97fb4.firebaseapp.com",
  databaseURL:
    "https://iot-projet-97fb4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iot-projet-97fb4",
  storageBucket: "iot-projet-97fb4.firebasestorage.app",
  messagingSenderId: "21965598044",
  appId: "1:21965598044:web:0f929b6638996843d5e599",
  measurementId: "G-WTQSXM0M14"
};

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  databaseURL:
    process.env.REACT_APP_FIREBASE_DATABASE_URL || fallbackConfig.databaseURL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    fallbackConfig.storageBucket,
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackConfig.messagingSenderId,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || fallbackConfig.appId,
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ||
    fallbackConfig.measurementId
};

const app = initializeApp(firebaseConfig);

/** Realtime Database — même chemin que le backend Node (`capteurs`) et usage ESP courant */
export const rtdb = getDatabase(app);
