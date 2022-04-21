import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Initialize Firebase
const app = initializeApp({
  apiKey: "AIzaSyBWVFJET3h8w0JCFgGnlCGxocfSghF5Q3A",
  authDomain: "belkins-birthday.firebaseapp.com",
  projectId: "belkins-birthday",
  storageBucket: "belkins-birthday.appspot.com",
  messagingSenderId: "826307847299",
  appId: "1:826307847299:web:a3b6f6bbe3bc84903fa7b6",
});

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const googleAuthProvider = new GoogleAuthProvider();
