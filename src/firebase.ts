import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlra4MQG4WZ31Ivu5LBFbTwDFD6MzCpO0",
  authDomain: "test-7ad0d.firebaseapp.com",
  projectId: "test-7ad0d",
  storageBucket: "test-7ad0d.firebasestorage.app",
  messagingSenderId: "163976008470",
  appId: "1:163976008470:web:984e686992cba4a4007637",
  measurementId: "G-YDLCNPQ97T",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

export const db = getFirestore(app);
