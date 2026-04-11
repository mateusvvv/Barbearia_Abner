// MENU MOBILE
const menuBtn = document.querySelector(".menu-mobile");
const nav = document.querySelector("nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

// FILTRO DE GALERIA
function filtrar(categoria) {
  const imagens = document.querySelectorAll(".grid img");

  imagens.forEach(img => {
    if (categoria === "todos") {
      img.style.display = "block";
    } else {
      img.style.display =
        img.dataset.categoria === categoria ? "block" : "none";
    }
  });
}

// FORMULÁRIO WHATSAPP
const form = document.querySelector(".form-agendamento");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = form.querySelector("input[type='text']").value;
    const telefone = form.querySelector("input[type='tel']").value;
    const servico = form.querySelector("select").value;
    const dataInput = form.querySelector("input[type='date']").value;
    const hora = form.querySelector("input[type='time']").value;

    if (!nome || !telefone || !servico || !dataInput || !hora) {
      alert("Preencha todos os campos!");
      return;
    }

    // 🔥 FORMATAÇÃO 100% SEGURA (SEM BUG)
    const [ano, mes, dia] = dataInput.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // 🔥 Mensagem formatada
    const mensagem = `💈 *Agendamento Barbearia Abner* 💈

👤 Nome: ${nome}
📞 Telefone: ${telefone}
✂️ Serviço: ${servico}
📅 Data: ${dataFormatada}
⏰ Hora: ${hora}

⏳ Status: Aguardando confirmação da barbearia.`;

const numero = "558193205690";

// 🔥 MAIS COMPATÍVEL QUE wa.me
const url = "https://api.whatsapp.com/send?phone=" + numero + "&text=" + encodeURIComponent(mensagem);

window.location.href = url;
  });
}


