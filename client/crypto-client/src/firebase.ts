import { getAuth } from 'firebase/auth';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZ5BINdeCrjLu3ENHT9mr6uzCKhEvs3uo",
  authDomain: "investment-cost-platform.firebaseapp.com",
  projectId: "investment-cost-platform",
  storageBucket: "investment-cost-platform.firebasestorage.app",
  messagingSenderId: "539589519703",
  appId: "1:539589519703:web:682305bb201cf0be7ef612",
  measurementId: "G-7VK0KMKV71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);