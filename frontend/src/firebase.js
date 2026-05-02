// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfErk5AjbyTqxVprw_yKuVEJDMEldg4pc",
  authDomain: "iot-projet-97fb4.firebaseapp.com",
  databaseURL: "https://iot-projet-97fb4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iot-projet-97fb4",
  storageBucket: "iot-projet-97fb4.firebasestorage.app",
  messagingSenderId: "21965598044",
  appId: "1:21965598044:web:0f929b6638996843d5e599",
  measurementId: "G-WTQSXM0M14"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);