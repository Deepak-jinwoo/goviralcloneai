import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHyULjvchT4U6uWdbn_G2mnd4i_Qcn0zk",
  authDomain: "goviralsaas-prod-99x.firebaseapp.com",
  projectId: "goviralsaas-prod-99x",
  storageBucket: "goviralsaas-prod-99x.firebasestorage.app",
  messagingSenderId: "402534637095",
  appId: "1:402534637095:web:5f02f8cea4096b6b0af802"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
