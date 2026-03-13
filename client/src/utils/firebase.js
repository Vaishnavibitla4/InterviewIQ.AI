import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-315b8.firebaseapp.com",
  projectId: "interviewiq-315b8",
  storageBucket: "interviewiq-315b8.firebasestorage.app",
  messagingSenderId: "379336104344",
  appId: "1:379336104344:web:6423a7a99636d5afb0b3ed"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };