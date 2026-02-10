import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBFxb07LUPHzPGgpJ50p4_wfKz6BLt8z0c",
  authDomain: "expense-tracker-a1aef.firebaseapp.com",
  projectId: "expense-tracker-a1aef",
  storageBucket: "expense-tracker-a1aef.firebasestorage.app",
  messagingSenderId: "415702764701",
  appId: "1:415702764701:web:dc7634bf5a600b740f5874"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

