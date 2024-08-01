
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5pr1OR5QbQlUnwpaz812RUOGf994hHBw",
  authDomain: "inventory-app-5113a.firebaseapp.com",
  projectId: "inventory-app-5113a",
  storageBucket: "inventory-app-5113a.appspot.com",
  messagingSenderId: "40066595877",
  appId: "1:40066595877:web:11c0754f6f8c8284dc53cc",
 };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };
