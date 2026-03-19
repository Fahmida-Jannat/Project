// 1. Import the required Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 2. Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFxb07LUPHzPGgpJ50p4_wfKz6BLt8z0c",
  authDomain: "expense-tracker-a1aef.firebaseapp.com",
  projectId: "expense-tracker-a1aef",
  storageBucket: "expense-tracker-a1aef.firebasestorage.app",
  messagingSenderId: "415702764701",
  appId: "1:415702764701:web:dc7634bf5a600b740f5874"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Export the Auth and Database instances so other files can use them
export const auth = getAuth(app);
export const db = getFirestore(app);