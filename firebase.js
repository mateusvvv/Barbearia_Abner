// 🔥 Importações Firebase (VERSÃO WEB CORRETA)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔐 CONFIG DO SEU PROJETO
const firebaseConfig = {
  apiKey: "AIzaSyDTupKl5ezDX6WEaq0vgUcbb8IhQu_98vo",
  authDomain: "barbearia-abner.firebaseapp.com",
  databaseURL: "https://barbearia-abner-default-rtdb.firebaseio.com",
  projectId: "barbearia-abner",
  storageBucket: "barbearia-abner.firebasestorage.app",
  messagingSenderId: "953646725899",
  appId: "1:953646725899:web:b8e18da71f204d7f83c00e"
};

// 🚀 Inicializa Firebase
const app = initializeApp(firebaseConfig);

// 📡 Database
const db = getDatabase(app);

// 🔐 Auth
const auth = getAuth(app);

// 📤 Exporta
export { db, auth };