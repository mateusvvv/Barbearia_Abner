// 🔥 IMPORTS FIREBASE
import { db, auth } from "./firebase.js";

import {
  ref,
  push,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ELEMENTOS
const msgLogin = document.getElementById("msgLogin");
const msgAdmin = document.getElementById("msgAdmin");


// 🔐 LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    msgLogin.innerHTML = "⚠️ Preencha tudo!";
    msgLogin.style.color = "orange";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (error) {
    msgLogin.innerHTML = "❌ Email ou senha inválidos";
    msgLogin.style.color = "red";
    console.error(error);
  }
};


// 👁 CONTROLE DE LOGIN
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login").style.display = "none";
    document.getElementById("painel").style.display = "block";
    carregarHorarios();
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("painel").style.display = "none";
  }
});


// ➕ ADICIONAR HORÁRIO (COM VALIDAÇÃO)
window.adicionarHorario = function () {
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;

  if (!data || !hora) {
    msgAdmin.innerHTML = "⚠️ Preencha data e hora!";
    msgAdmin.style.color = "orange";
    return;
  }

  // 🔍 VERIFICAR DUPLICADO
  onValue(ref(db, "horarios"), (snapshot) => {
    let duplicado = false;

    snapshot.forEach((child) => {
      const h = child.val();
      if (h.data === data && h.hora === hora) {
        duplicado = true;
      }
    });

    if (duplicado) {
      msgAdmin.innerHTML = "❌ Esse horário já existe!";
      msgAdmin.style.color = "red";
      return;
    }

    // SALVAR
    push(ref(db, "horarios"), {
      data,
      hora,
      status: "livre"
    });

    msgAdmin.innerHTML = "✅ Horário adicionado!";
    msgAdmin.style.color = "lightgreen";
  }, { onlyOnce: true });
};


// 📡 LISTAR HORÁRIOS
function carregarHorarios() {
  const lista = document.getElementById("lista");

  onValue(ref(db, "horarios"), (snapshot) => {
    lista.innerHTML = "";

    if (!snapshot.exists()) {
      lista.innerHTML = "<p>Nenhum horário cadastrado</p>";
      return;
    }

    let dados = [];

    snapshot.forEach((child) => {
      dados.push({
        id: child.key,
        ...child.val()
      });
    });

    // 📅 ORDENAR POR DATA + HORA
    dados.sort((a, b) => {
      const d1 = new Date(a.data + " " + a.hora);
      const d2 = new Date(b.data + " " + b.hora);
      return d1 - d2;
    });

    dados.forEach((h) => {
      const status = h.status === "livre"
        ? "🟢 Livre"
        : "🔴 Ocupado";

      lista.innerHTML += `
        <li class="card ${h.status}">
          <strong>${h.data}</strong> - ${h.hora} <br>
          ${status} <br>

          ${h.nome ? `👤 ${h.nome}` : ""}
          ${h.servico ? `<br>✂️ ${h.servico}` : ""}

          <br><br>

          ${
            h.status === "ocupado"
              ? `<button onclick="cancelar('${h.id}')">Cancelar</button>`
              : ""
          }

          <button onclick="excluir('${h.id}')">Excluir</button>
        </li>
      `;
    });
  });
}


// ❌ CANCELAR (LIBERA HORÁRIO)
window.cancelar = function (id) {
  update(ref(db, "horarios/" + id), {
    status: "livre",
    nome: null,
    telefone: null,
    servico: null
  });

  msgAdmin.innerHTML = "✅ Horário liberado!";
  msgAdmin.style.color = "lightgreen";
};


// 🗑 EXCLUIR
window.excluir = function (id) {
  if (confirm("Excluir horário?")) {
    remove(ref(db, "horarios/" + id));

    msgAdmin.innerHTML = "🗑️ Horário excluído!";
    msgAdmin.style.color = "orange";
  }
};


// 🚪 LOGOUT
window.logout = function () {
  signOut(auth);
};

