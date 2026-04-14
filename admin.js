import { db, auth } from "./firebase.js";

import {
  ref,
  push,
  onValue,
  remove,
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ELEMENTOS
const msgLogin = document.getElementById("msgLogin");
const msgAdmin = document.getElementById("msgAdmin");

let listenerAtivo = false;


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
  }
};


// 👁 AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login").style.display = "none";
    document.getElementById("painel").style.display = "block";
    carregarHorarios();
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("painel").style.display = "none";

    // 🔥 reset listener ao sair
    listenerAtivo = false;
  }
});


// 📡 LISTAR
function carregarHorarios() {

  if (listenerAtivo) return;
  listenerAtivo = true;

  const lista = document.getElementById("lista");

  onValue(ref(db, "horarios"), (snapshot) => {

    lista.innerHTML = "";

    if (!snapshot.exists()) {
      lista.innerHTML = "<p>Nenhum agendamento</p>";
      return;
    }

    let dados = [];

    snapshot.forEach((child) => {
      dados.push({
        id: child.key,
        ...child.val()
      });
    });

    dados.sort((a, b) =>
      new Date(a.data + " " + a.hora) -
      new Date(b.data + " " + b.hora)
    );

    dados.forEach((h) => {
      lista.innerHTML += `
        <li class="card agendado">
          <strong>📅 ${h.data}</strong> - ${h.hora} <br>
          🟢 ${h.status || "agendado"} <br><br>

          👤 ${h.nome} <br>
          📞 ${h.telefone} <br>
          ✂️ ${h.servico}

          <br><br>

          <button onclick="excluir('${h.id}')">Excluir</button>
        </li>
      `;
    });

  });
}


// ➕ ADICIONAR
window.adicionarHorario = async function () {

  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const servico = document.getElementById("servico").value;

  if (!data || !hora || !nome || !telefone || !servico) {
    msgAdmin.innerHTML = "⚠️ Preencha tudo!";
    msgAdmin.style.color = "orange";
    return;
  }

  try {
    const snapshot = await get(ref(db, "horarios"));

    let duplicado = false;

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const h = child.val();
        if (h.data === data && h.hora === hora) {
          duplicado = true;
        }
      });
    }

    if (duplicado) {
      msgAdmin.innerHTML = "❌ Já existe agendamento nesse horário!";
      msgAdmin.style.color = "red";
      return;
    }

    await push(ref(db, "horarios"), {
      data,
      hora,
      nome,
      telefone,
      servico,
      status: "agendado"
    });

    msgAdmin.innerHTML = "✅ Cliente agendado!";
    msgAdmin.style.color = "lightgreen";

  } catch (error) {
    console.error(error);
    msgAdmin.innerHTML = "❌ Erro ao salvar!";
    msgAdmin.style.color = "red";
  }
};


// 🗑 EXCLUIR
window.excluir = async function (id) {
  if (!confirm("Excluir agendamento?")) return;

  try {
    await remove(ref(db, "horarios/" + id));

    msgAdmin.innerHTML = "🗑️ Removido com sucesso!";
    msgAdmin.style.color = "orange";

  } catch (error) {
    console.error(error);
    msgAdmin.innerHTML = "❌ Erro ao excluir!";
    msgAdmin.style.color = "red";
  }
};


// 🚪 LOGOUT
window.logout = function () {
  signOut(auth);
};

