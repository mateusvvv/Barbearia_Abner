// 🔥 IMPORTS FIREBASE
import { db, auth } from "./firebase.js";

import {
  ref,
  push,
  onValue,
  remove,
  update,
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
const statusHorario = document.getElementById("statusHorario");
const dadosCliente = document.getElementById("dadosCliente");
const filtroHorarios = document.getElementById("filtroHorarios");
let horariosCadastrados = [];

function atualizarCamposCliente() {
  const clienteMarcado = statusHorario.value === "ocupado";

  dadosCliente.classList.toggle("hidden", !clienteMarcado);
  document.getElementById("nome").disabled = !clienteMarcado;
  document.getElementById("telefone").disabled = !clienteMarcado;
  document.getElementById("servico").disabled = !clienteMarcado;
}

statusHorario.addEventListener("change", atualizarCamposCliente);
filtroHorarios.addEventListener("input", () => renderizarHorarios(horariosCadastrados));
atualizarCamposCliente();

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function atualizarResumo(dados) {
  const livres = dados.filter(h => h.status === "livre").length;
  const ocupados = dados.filter(h => h.status === "ocupado").length;

  document.getElementById("totalHorarios").textContent = dados.length;
  document.getElementById("totalLivres").textContent = livres;
  document.getElementById("totalOcupados").textContent = ocupados;
}


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


// 👁 CONTROLE DE LOGIN
onAuthStateChanged(auth, (user) => {
  const login = document.getElementById("login");
  const painel = document.getElementById("painel");

  if (user) {
    login.classList.add("hidden");
    painel.classList.remove("hidden");
    carregarHorarios();
  } else {
    login.classList.remove("hidden");
    painel.classList.add("hidden");
  }
});


// ➕ ADICIONAR HORÁRIO (SEM BUG)
window.adicionarHorario = async function () {
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const servico = document.getElementById("servico").value;
  const status = statusHorario.value;

  if (!data || !hora) {
    msgAdmin.innerHTML = "⚠️ Preencha data e hora!";
    msgAdmin.style.color = "orange";
    return;
  }

  if (status === "ocupado" && (!nome || !telefone || !servico)) {
    msgAdmin.innerHTML = "⚠️ Preencha todos os dados do cliente!";
    msgAdmin.style.color = "orange";
    return;
  }

  const snapshot = await get(ref(db, "horarios"));
  let horarioExistente = null;

  if (snapshot.exists()) {
    snapshot.forEach((child) => {
      const h = child.val();
      if (h.data === data && h.hora === hora) {
        horarioExistente = {
          id: child.key,
          ...h
        };
      }
    });
  }

  if (horarioExistente && horarioExistente.status === "ocupado") {
    msgAdmin.innerHTML = "❌ Esse horário já está marcado!";
    msgAdmin.style.color = "red";
    return;
  }

  const dadosCliente = {
    data,
    hora,
    nome: status === "ocupado" ? nome : null,
    telefone: status === "ocupado" ? telefone : null,
    servico: status === "ocupado" ? servico : null,
    status
  };

  if (horarioExistente) {
    await update(ref(db, "horarios/" + horarioExistente.id), dadosCliente);
  } else {
    await push(ref(db, "horarios"), dadosCliente);
  }

  document.getElementById("data").value = "";
  document.getElementById("hora").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("servico").value = "";
  statusHorario.value = "ocupado";
  atualizarCamposCliente();

  msgAdmin.innerHTML = status === "ocupado"
    ? "✅ Cliente adicionado!"
    : "✅ Vaga livre adicionada!";
  msgAdmin.style.color = "lightgreen";
};


// 📡 LISTAR HORÁRIOS
function carregarHorarios() {
  onValue(ref(db, "horarios"), (snapshot) => {
    if (!snapshot.exists()) {
      horariosCadastrados = [];
      atualizarResumo(horariosCadastrados);
      renderizarHorarios(horariosCadastrados);
      return;
    }

    const dados = [];

    snapshot.forEach((child) => {
      dados.push({
        id: child.key,
        ...child.val()
      });
    });

    // ORDENAR
    dados.sort((a, b) => {
      return new Date(a.data + "T" + a.hora) - new Date(b.data + "T" + b.hora);
    });

    horariosCadastrados = dados;
    atualizarResumo(horariosCadastrados);
    renderizarHorarios(horariosCadastrados);
  });
}


function renderizarHorarios(dados) {
  const lista = document.getElementById("lista");
  const termo = filtroHorarios.value.trim().toLowerCase();
  const filtrados = dados.filter((h) => {
    const texto = `${h.data} ${h.hora} ${h.nome || ""} ${h.servico || ""} ${h.telefone || ""}`.toLowerCase();
    return texto.includes(termo);
  });

  lista.innerHTML = "";

  if (filtrados.length === 0) {
    lista.innerHTML = "<p class=\"empty-state\">Nenhum horário encontrado.</p>";
    return;
  }

  filtrados.forEach((h) => {
    const dataFormatada = formatarData(h.data);
    const status = h.status === "livre"
      ? "Livre"
      : "Marcado";

    lista.innerHTML += `
      <li class="${h.status}">
        <div class="item-info">
          <span class="status-pill">${status}</span>
          <strong>${dataFormatada} - ${h.hora}</strong>

          ${h.nome ? `<span>${h.nome}</span>` : "<span>Vaga aberta para cliente</span>"}
          ${h.telefone ? `<small>${h.telefone}</small>` : ""}
          ${h.servico ? `<small>${h.servico}</small>` : ""}
        </div>

        <div class="item-acoes">
          ${
            h.status === "ocupado"
              ? `<button class="btn-liberar" onclick="cancelar('${h.id}')">Liberar</button>`
              : ""
          }

          <button class="btn-delete" onclick="excluir('${h.id}')">Excluir</button>
        </div>
      </li>
    `;
  });
}


// ❌ CANCELAR
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
