// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5pr1OR5QbQlUnwpaz812RUOGf994hHBw",
  authDomain: "inventory-app-5113a.firebaseapp.com",
  projectId: "inventory-app-5113a",
  storageBucket: "inventory-app-5113a.appspot.com",
  messagingSenderId: "40066595877",
  appId: "1:40066595877:web:11c0754f6f8c8284dc53cc",
  measurementId: "G-CVMFBFQGNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
