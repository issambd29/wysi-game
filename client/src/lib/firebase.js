import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDIM05oDJTecjmTFN48s2JfigZ6SAuuSpw",
  authDomain: "wysi-game.firebaseapp.com",
  databaseURL: "https://wysi-game-default-rtdb.firebaseio.com",
  projectId: "wysi-game",
  storageBucket: "wysi-game.firebasestorage.app",
  messagingSenderId: "305557246327",
  appId: "1:305557246327:web:f41243a2d91511dbd65172",
  measurementId: "G-RB1PHPWLBP"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
