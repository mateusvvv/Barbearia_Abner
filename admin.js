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
const filtroBarbeiroLista = document.getElementById("filtroBarbeiroLista");
const inputData = document.getElementById("data");
const inputHora = document.getElementById("hora");
const horariosLote = document.getElementById("horariosLote");
const horaInicio = document.getElementById("horaInicio");
const horaFim = document.getElementById("horaFim");
const intervaloHorarios = document.getElementById("intervaloHorarios");
const barbeiro = document.getElementById("barbeiro"); // Novo elemento
const textoHora = document.getElementById("textoHora");
const dataEscolhida = document.getElementById("dataEscolhida");
const resumoFiltroLista = document.getElementById("resumoFiltroLista");
const botoesFiltroStatus = document.querySelectorAll("[data-filtro-status]");
const btnSalvarHorario = document.getElementById("btnSalvarHorario");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const btnGerarLote = document.getElementById("btnGerarLote");
const btnLimparLote = document.getElementById("btnLimparLote");
const previewLote = document.getElementById("previewLote");
const adminCalendarioDias = document.getElementById("adminCalendarioDias");
const btnToggleCalendario = document.getElementById("btnToggleCalendario");
const calendarioContainer = document.getElementById("calendarioContainer");
const adminMesAtual = document.getElementById("adminMesAtual");
const adminMesAnterior = document.getElementById("adminMesAnterior");
const adminProximoMes = document.getElementById("adminProximoMes");
let horariosCadastrados = [];
let cancelarListenerHorarios = null;
let dataAtivaAdmin = "";
let mesVisivelAdmin = new Date();
let filtroStatusAtual = "todos";
let timerMensagemAdmin = null;
let horarioEditandoId = null;

function atualizarCamposCliente() {
  const statusOcupado = statusHorario.value === "ocupado";
  const statusLivre = statusHorario.value === "livre";

  // Campos de dados do cliente (nome, telefone, serviço)
  dadosCliente.classList.toggle("hidden", !statusOcupado);
  document.getElementById("nome").disabled = !statusOcupado;
  document.getElementById("telefone").disabled = !statusOcupado;
  document.getElementById("servico").disabled = !statusOcupado;

  // Campos de geração em lote
  horariosLote.disabled = statusOcupado;
  horaInicio.disabled = statusOcupado;
  horaFim.disabled = statusOcupado;
  intervaloHorarios.disabled = statusOcupado;

  if (statusOcupado) {
    horariosLote.value = "";
  }
  atualizarPreviewLote();
}

statusHorario.addEventListener("change", atualizarCamposCliente);
filtroHorarios.addEventListener("input", () => renderizarHorarios(horariosCadastrados));
filtroBarbeiroLista?.addEventListener("change", () => renderizarHorarios(horariosCadastrados));

function atualizarPreviewLote() {
  const horarios = obterHorariosEmLote();
  if (!horarios.length) {
    previewLote.textContent = statusHorario.value === "ocupado"
      ? "Troque para vaga livre para gerar horários em lote."
      : "Os horários gerados aparecerão aqui.";
    return;
  }

  previewLote.textContent = `Horários prontos (${horarios.length}): ${horarios.join(", ")}`;
}

btnGerarLote?.addEventListener("click", () => {
  const gerados = gerarHorariosPorIntervalo();

  if (!gerados.length) {
    mostrarMensagemAdmin("⚠️ Preencha início, fim e intervalo válidos.", "orange");
    return;
  }

  horariosLote.value = gerados.join(", ");
  atualizarPreviewLote();
});

btnLimparLote?.addEventListener("click", () => {
  horariosLote.value = "";
  atualizarPreviewLote();
});

[horaInicio, horaFim, intervaloHorarios, horariosLote].forEach((el) => {
  el?.addEventListener("input", atualizarPreviewLote);
});

btnToggleCalendario?.addEventListener("click", () => {
  const estaEscondido = calendarioContainer.classList.toggle("hidden");
  btnToggleCalendario.textContent = estaEscondido 
    ? "📅 Abrir Calendário" 
    : "📅 Fechar Calendário";
});

atualizarPreviewLote();
atualizarCamposCliente();

botoesFiltroStatus.forEach((botao) => {
  botao.addEventListener("click", () => {
    filtroStatusAtual = botao.dataset.filtroStatus;
    botoesFiltroStatus.forEach((item) => item.classList.remove("ativo"));
    botao.classList.add("ativo");
    renderizarHorarios(horariosCadastrados);
  });
});

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarChaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function obterStatusDia(data) {
  const hoje = formatarChaveData(new Date());

  if (data < hoje) {
    return {
      classe: "passado",
      texto: "Passou",
      bloqueado: true
    };
  }

  const horariosDoDia = horariosCadastrados.filter(h => h.data === data);
  const livres = horariosDoDia.filter(h => h.status === "livre").length;
  const ocupados = horariosDoDia.filter(h => h.status === "ocupado").length;

  if (horariosDoDia.length === 0) {
    return {
      classe: "sem-agenda",
      texto: "Sem agenda"
    };
  }

  if (livres > 0) {
    return {
      classe: "vagas",
      texto: ocupados > 0
        ? `${livres} vaga${livres > 1 ? "s" : ""} / ${ocupados} marc.`
        : `${livres} vaga${livres > 1 ? "s" : ""}`
    };
  }

  return {
    classe: "ocupado",
    texto: `${ocupados} marcado${ocupados > 1 ? "s" : ""}`
  };
}

function atualizarPassoHora() {
  const temData = Boolean(dataAtivaAdmin);

  inputHora.disabled = !temData;
  textoHora.textContent = temData
    ? "Agora selecione o horário"
    : "Selecione uma data primeiro";
  dataEscolhida.textContent = temData
    ? `Data selecionada: ${formatarData(dataAtivaAdmin)}`
    : "Nenhuma data selecionada.";
}

function mostrarMensagemAdmin(texto, cor) {
  msgAdmin.innerHTML = texto;
  msgAdmin.style.color = cor;

  clearTimeout(timerMensagemAdmin);
  timerMensagemAdmin = setTimeout(() => {
    msgAdmin.innerHTML = "";
  }, 3500);
}

function limparFormularioAdmin(manterData = true) {
  if (!manterData) {
    inputData.value = "";
    dataAtivaAdmin = "";
  }

  inputHora.value = "";
  horariosLote.value = "";
  horaInicio.value = "";
  horaFim.value = "";
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("servico").value = "";
  if (barbeiro) barbeiro.value = "";
  statusHorario.value = "ocupado";
  horarioEditandoId = null;
  btnSalvarHorario.textContent = "Salvar horário";
  btnCancelarEdicao.classList.add("hidden");
  atualizarCamposCliente();
  atualizarPassoHora();
  renderizarCalendarioAdmin();
  atualizarPreviewLote();
}

function selecionarDataAdmin(data) {
  dataAtivaAdmin = data;
  inputData.value = data;
  inputHora.disabled = false;
  inputHora.focus();
  atualizarPassoHora();
  renderizarCalendarioAdmin();
  renderizarHorarios(horariosCadastrados);

  // Fecha o calendário no mobile após escolher para ganhar espaço
  if (window.innerWidth < 768) {
    calendarioContainer?.classList.add("hidden");
    if (btnToggleCalendario) btnToggleCalendario.textContent = "📅 Abrir Calendário";
  }
}

function renderizarCalendarioAdmin() {
  adminCalendarioDias.innerHTML = "";

  const ano = mesVisivelAdmin.getFullYear();
  const mes = mesVisivelAdmin.getMonth();
  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  adminMesAtual.textContent = `${nomesMeses[mes]} ${ano}`;

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const totalDias = ultimoDia.getDate();

  for (let i = 0; i < primeiroDia.getDay(); i++) {
    const vazio = document.createElement("div");
    vazio.className = "dia-vazio";
    adminCalendarioDias.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const data = new Date(ano, mes, dia);
    const chave = formatarChaveData(data);
    const status = obterStatusDia(chave);
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = `dia-calendario ${status.classe}`;
    botao.disabled = Boolean(status.bloqueado);

    if (chave === dataAtivaAdmin) {
      botao.classList.add("selecionado");
    }

    botao.innerHTML = `
      <strong>${dia}</strong>
      <span>${status.texto}</span>
    `;

    botao.addEventListener("click", () => selecionarDataAdmin(chave));
    adminCalendarioDias.appendChild(botao);
  }
}

function atualizarResumo(dados) {
  const livres = dados.filter(h => h.status === "livre").length;
  const ocupados = dados.filter(h => h.status === "ocupado").length;

  document.getElementById("totalHorarios").textContent = dados.length;
  document.getElementById("totalLivres").textContent = livres;
  document.getElementById("totalOcupados").textContent = ocupados;
}

adminMesAnterior.addEventListener("click", () => {
  mesVisivelAdmin = new Date(mesVisivelAdmin.getFullYear(), mesVisivelAdmin.getMonth() - 1, 1);
  renderizarCalendarioAdmin();
});

adminProximoMes.addEventListener("click", () => {
  mesVisivelAdmin = new Date(mesVisivelAdmin.getFullYear(), mesVisivelAdmin.getMonth() + 1, 1);
  renderizarCalendarioAdmin();
});

renderizarCalendarioAdmin();
atualizarPassoHora();


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
async function limparVagasLivresPassadas() {
  const hoje = formatarChaveData(new Date());
  const snapshot = await get(ref(db, "horarios"));

  if (!snapshot.exists()) return;

  snapshot.forEach((child) => {
    const horario = child.val();

    if (horario.status === "livre" && horario.data < hoje) {
      remove(ref(db, "horarios/" + child.key));
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  const login = document.getElementById("login");
  const painel = document.getElementById("painel");

  if (user) {
    try {
      login.classList.add("hidden");
      painel.classList.remove("hidden");
      await limparVagasLivresPassadas();
      carregarHorarios();
    } catch (error) {
      console.error("Erro ao inicializar painel:", error);
    }
  } else {
    login.classList.remove("hidden");
    painel.classList.add("hidden");

    if (cancelarListenerHorarios) {
      cancelarListenerHorarios();
      cancelarListenerHorarios = null;
    }
  }
});


// ➕ ADICIONAR HORÁRIO (SEM BUG)
window.adicionarHorario = async function () {
  const data = inputData.value;
  const hora = inputHora.value;
  let horasEmLote = obterHorariosEmLote();
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const servico = document.getElementById("servico").value;
  const status = statusHorario.value;
  const barbeiroSelecionado = barbeiro.value;

  if (horarioEditandoId && horasEmLote.length > 0) {
    mostrarMensagemAdmin("⚠️ Na edição, altere apenas um horário por vez.", "orange");
    return;
  }

  if (!barbeiroSelecionado) {
    mostrarMensagemAdmin("⚠️ Selecione o barbeiro responsável!", "orange");
    return;
  }

  if (status === "livre" && hora && horasEmLote.length > 0) {
    horasEmLote = [...new Set([hora, ...horasEmLote])].sort();
  }

  if (!data || (!hora && horasEmLote.length === 0)) {
    mostrarMensagemAdmin("⚠️ Escolha a data e informe o horário!", "orange");
    return;
  }

  if (status === "ocupado" && (!nome || !telefone || !servico)) {
    mostrarMensagemAdmin("⚠️ Preencha todos os dados do cliente e selecione o barbeiro!", "orange");
    return;
  }

  const snapshot = await get(ref(db, "horarios"));
  const horariosExistentes = [];

  if (snapshot.exists()) {
    snapshot.forEach((child) => {
      const h = child.val();
      horariosExistentes.push({
        id: child.key,
        ...h
      });
    });
  }

  if (horasEmLote.length > 0) { // Se for lote, chama a função específica
    await adicionarHorariosEmLote(data, horasEmLote, horariosExistentes);
    return;
  }

  const horarioExistente = horariosExistentes.find(h => h.data === data && h.hora === hora && h.id !== horarioEditandoId);

  if (horarioEditandoId && horarioExistente) {
    mostrarMensagemAdmin("❌ Já existe outro cadastro nessa data e hora.", "red");
    return;
  }

  if (horarioExistente && horarioExistente.status === "ocupado") {
    mostrarMensagemAdmin("❌ Esse horário já está marcado!", "red");
    return;
  }

  const dadosCliente = {
    data,
    hora,
    nome: status === "ocupado" ? nome : null,
    telefone: status === "ocupado" ? telefone : null,
    servico: status === "ocupado" ? servico : null,
    status,
    barber: barbeiroSelecionado // Adiciona o barbeiro
  };

  if (horarioEditandoId) {
    await update(ref(db, "horarios/" + horarioEditandoId), dadosCliente);
  } else if (horarioExistente) {
    await update(ref(db, "horarios/" + horarioExistente.id), dadosCliente);
  } else {
    await push(ref(db, "horarios"), {
      ...dadosCliente,
      lembreteEnviado: false
    });
  }

  const editouHorario = Boolean(horarioEditandoId);
  limparFormularioAdmin(true);

  mostrarMensagemAdmin(
    editouHorario
      ? "✅ Horário atualizado!"
      : status === "ocupado" ? "✅ Cliente adicionado!" : "✅ Vaga livre adicionada!",
    "lightgreen"
  );
};

function obterHorariosEmLote() {
  const digitados = horariosLote.value.match(/\b\d{1,2}:\d{2}\b/g) || [];
  const gerados = gerarHorariosPorIntervalo();
  const encontrados = [...digitados, ...gerados];
  const normalizados = encontrados
    .map((valor) => {
      const [hora, minuto] = valor.split(":").map(Number);

      if (hora > 23 || minuto > 59) return null;

      return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
    })
    .filter(Boolean);

  return [...new Set(normalizados)].sort();
}

function converterHoraParaMinutos(hora) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

function converterMinutosParaHora(totalMinutos) {
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

function gerarHorariosPorIntervalo() {
  if (!horaInicio.value || !horaFim.value) return [];

  const inicio = converterHoraParaMinutos(horaInicio.value);
  const fim = converterHoraParaMinutos(horaFim.value);
  const intervalo = Number(intervaloHorarios.value);

  if (fim <= inicio || intervalo <= 0) return [];

  const horarios = [];

  for (let minuto = inicio; minuto <= fim; minuto += intervalo) {
    horarios.push(converterMinutosParaHora(minuto));
  }

  return horarios;
}

async function adicionarHorariosEmLote(data, horas, horariosExistentes) {
  const existentesDoDia = horariosExistentes.filter(h => h.data === data);
  let criados = 0;
  let ignorados = 0;
  let ocupados = 0;

  for (const hora of horas) {
    const horarioExistente = existentesDoDia.find(h => h.hora === hora);

    if (horarioExistente?.status === "ocupado") {
      ocupados++;
      continue;
    }

    if (horarioExistente) {
      ignorados++;
      continue;
    }

    await push(ref(db, "horarios"), {
      data,
      hora,
      nome: null,
      telefone: null,
      servico: null,
      status: "livre",
      barber: barbeiro.value, // Atribui o barbeiro selecionado no form principal
      lembreteEnviado: false
    });

    criados++;
  }

  inputHora.value = "";
  horariosLote.value = "";
  horaInicio.value = "";
  horaFim.value = "";
  atualizarPassoHora();
  renderizarCalendarioAdmin();

  mostrarMensagemAdmin(
    `✅ ${criados} vaga${criados === 1 ? "" : "s"} adicionada${criados === 1 ? "" : "s"}. ${ignorados + ocupados} repetida${ignorados + ocupados === 1 ? "" : "s"} ignorada${ignorados + ocupados === 1 ? "" : "s"}.`,
    "lightgreen"
  );
}


// 📡 LISTAR HORÁRIOS
function carregarHorarios() {
  if (cancelarListenerHorarios) return;

  cancelarListenerHorarios = onValue(ref(db, "horarios"), (snapshot) => {
    if (!snapshot.exists()) {
      horariosCadastrados = [];
      atualizarResumo(horariosCadastrados);
      renderizarCalendarioAdmin();
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
    renderizarCalendarioAdmin();
    renderizarHorarios(horariosCadastrados);
  });
}


function renderizarHorarios(dados) {
  const lista = document.getElementById("lista");
  const termo = filtroHorarios.value.trim().toLowerCase();
  const barbeiroFiltro = filtroBarbeiroLista?.value || "todos";

  const filtrados = dados.filter((h) => {
    if (dataAtivaAdmin && h.data !== dataAtivaAdmin) return false;
    if (filtroStatusAtual !== "todos" && h.status !== filtroStatusAtual) return false;
    if (barbeiroFiltro !== "todos" && h.barber !== barbeiroFiltro) return false;

    const texto = `${h.data} ${h.hora} ${h.nome || ""} ${h.servico || ""} ${h.telefone || ""}`.toLowerCase();
    return texto.includes(termo);
  });

  lista.innerHTML = "";
  resumoFiltroLista.textContent = dataAtivaAdmin
    ? `Mostrando ${formatarData(dataAtivaAdmin)}.`
    : "Filtre por data, barbeiro, nome ou serviço.";

  if (filtrados.length === 0) {
    lista.innerHTML = "<p class=\"empty-state\">Nenhum horário encontrado.</p>";
    return;
  }

  filtrados.forEach((h) => {
    const dataFormatada = formatarData(h.data);
    const status = h.status === "livre"
      ? "Livre"
      : "Marcado";
    const barbeiroNome = h.barber ? `com ${h.barber}` : '';

    lista.innerHTML += `
      <li class="${h.status}">
        <div class="item-info">
          <span class="status-pill">${status}</span>
          <strong>${dataFormatada} - ${h.hora}</strong>
          ${h.barber ? `<span>Barbeiro: ${h.barber}</span>` : ''}
          ${h.nome ? `<span>Cliente: ${h.nome}</span>` : "<span>Vaga aberta para cliente</span>"}
          ${h.telefone ? `<small>${h.telefone}</small>` : ""}
          ${h.servico ? `<small>${h.servico}</small>` : ""}
        </div>

        <div class="item-acoes">
          ${
            h.status === "ocupado"
              ? `<button class="btn-liberar" onclick="cancelar('${h.id}')">Liberar</button>`
              : ""
          }

          <button class="btn-editar" onclick="editarHorario('${h.id}')">Editar</button>
          <button class="btn-delete" onclick="excluir('${h.id}')">Excluir</button>
        </div>
      </li>
    `;
  });
}


// ❌ CANCELAR
window.cancelar = function (id) {
  if (!confirm("Liberar esse horário e apagar os dados do cliente?")) {
    return;
  }

  update(ref(db, "horarios/" + id), {
    status: "livre",
    nome: null,
    telefone: null,
    servico: null
  });

  mostrarMensagemAdmin("✅ Horário liberado!", "lightgreen");
};


// ✏️ EDITAR
window.editarHorario = function (id) {
  const horario = horariosCadastrados.find(h => h.id === id);

  if (!horario) {
    mostrarMensagemAdmin("⚠️ Horário não encontrado.", "orange");
    return;
  }

  horarioEditandoId = id;
  dataAtivaAdmin = horario.data;
  inputData.value = horario.data;
  inputHora.value = horario.hora;
  statusHorario.value = horario.status;
  document.getElementById("nome").value = horario.nome || "";
  document.getElementById("telefone").value = horario.telefone || "";
  document.getElementById("servico").value = horario.servico || "";
  barbeiro.value = horario.barber || ""; // Preenche o barbeiro

  const [ano, mes] = horario.data.split("-");
  mesVisivelAdmin = new Date(Number(ano), Number(mes) - 1, 1);

  horariosLote.value = "";
  horaInicio.value = "";
  horaFim.value = "";
  btnSalvarHorario.textContent = "Salvar alterações";
  btnCancelarEdicao.classList.remove("hidden");
  atualizarCamposCliente();
  atualizarPassoHora();
  renderizarCalendarioAdmin();
  renderizarHorarios(horariosCadastrados);

  document.querySelector(".form-card").scrollIntoView({ behavior: "smooth", block: "start" });
  mostrarMensagemAdmin("Editando horário selecionado.", "#f1c94d");
};

window.cancelarEdicao = function () {
  limparFormularioAdmin(true);
  renderizarHorarios(horariosCadastrados);
  mostrarMensagemAdmin("Edição cancelada.", "orange");
};


// 🗑 EXCLUIR
window.excluir = function (id) {
  if (confirm("Excluir horário?")) {
    remove(ref(db, "horarios/" + id));

    mostrarMensagemAdmin("🗑️ Horário excluído!", "orange");
  }
};


// 🚪 LOGOUT
window.logout = function () {
  signOut(auth);
};

// 🗑 EXCLUIR TUDO
window.excluirTodos = function () {
  if (confirm("⚠️ ATENÇÃO: Você tem certeza que deseja excluir TODOS os horários cadastrados (livres e marcados)? Esta ação não pode ser desfeita.")) {
    remove(ref(db, "horarios"))
      .then(() => {
        mostrarMensagemAdmin("🗑️ Agenda totalmente limpa!", "orange");
      })
      .catch(() => mostrarMensagemAdmin("❌ Falha ao excluir agenda.", "red"));
  }
};
