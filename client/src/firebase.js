// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-a1806.firebaseapp.com",
  projectId: "mern-estate-a1806",
  storageBucket: "mern-estate-a1806.appspot.com",
  messagingSenderId: "464700534992",
  appId: "1:464700534992:web:c9831bfe246666725beed5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
