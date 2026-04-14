const wppconnect = require('@wppconnect-team/wppconnect');
const { db } = require('./firebase');

const { ref, push, get } = require("firebase/database");

wppconnect.create({
  session: 'barbearia',
  autoClose: 0
})
.then((client) => start(client))
.catch((error) => console.log(error));

function start(client) {

  console.log('🤖 Bot + Firebase iniciado!');

  client.onMessage(async (message) => {

    if (message.isGroupMsg) return;
    if (!message.body) return;

    const texto = message.body.toLowerCase();
    const numero = message.from;

    // MENU
    if (texto === 'oi' || texto === 'olá') {
      client.sendText(numero,
        '👋 Olá! Barbearia Abner 💈\n\n' +
        '1️⃣ Ver horários\n' +
        '2️⃣ Agendar'
      );
    }

    // VER HORÁRIOS
    if (texto === '1') {

      const snapshot = await get(ref(db, "horarios"));

      let horarios = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          horarios.push(child.val());
        });
      }

      if (horarios.length === 0) {
        client.sendText(numero, "❌ Nenhum horário disponível");
        return;
      }

      let resposta = "📅 Horários agendados:\n\n";

      horarios.forEach(h => {
        resposta += `📅 ${h.data} ⏰ ${h.hora}\n`;
      });

      client.sendText(numero, resposta);
    }

    // AGENDAR
    if (texto === '2') {
      client.sendText(numero,
        '✂️ Envie assim:\n\n' +
        '*Nome Data Hora*\n\n' +
        'Ex:\nMateus 15/04 14:00'
      );
    }

    // 🔥 CAPTURAR AGENDAMENTO (PADRÃO BR)
    const regex = /^(.+)\s(\d{2}\/\d{2})\s(\d{2}:\d{2})$/;

    if (regex.test(message.body)) {

      try {
        const partes = message.body.match(regex);

        const nome = partes[1].trim();
        const dataBR = partes[2]; // 15/04
        const hora = partes[3];   // 14:00

        // 🔥 CONVERTER PRA FORMATO SALVÁVEL (YYYY-MM-DD)
        const ano = new Date().getFullYear();
        const [dia, mes] = dataBR.split('/');

        const data = `${ano}-${mes}-${dia}`; // 2026-04-15

        // 🔍 VERIFICAR DUPLICADO
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
          client.sendText(numero, "❌ Esse horário já está ocupado!");
          return;
        }

        // 💾 SALVAR
        await push(ref(db, "horarios"), {
          data,
          hora,
          nome,
          telefone: numero,
          servico: "Corte",
          status: "agendado"
        });

        client.sendText(numero,
          `✅ Agendado com sucesso!\n\n👤 ${nome}\n📅 ${dataBR}\n⏰ ${hora} 💈`
        );

      } catch (error) {
        console.log(error);
        client.sendText(numero, "⚠️ Formato inválido!");
      }
    }

  });
}