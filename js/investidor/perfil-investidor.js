// ELEMENTOS DOM
const modal = document.getElementById("modalQuestionario");
const etapasContainer = document.getElementById("etapas-container");
const btnProximo = document.getElementById("btnProximo");
const btnVoltar = document.getElementById("btnVoltar");
const btnPular = document.getElementById("btnPular");
const barraProgresso = document.getElementById("barraProgresso");
const textoProgresso = document.getElementById("textoProgresso");

// CONFIGURAÇÕES
const API_URL = "http://191.239.116.115:8080";
let etapaAtual = 0,
  pontuacao = 0,
  respostaSelecionada = -1;

// DADOS DAS PERGUNTAS
const perguntas = [
  {
    texto: "Introdução",
    tipo: "info",
    conteudo:
      "Bem-vindo(a) ao seu perfil de investidor! Para oferecer recomendações personalizadas que se alinhem aos seus objetivos financeiros, gostaríamos de entender melhor sua relação com investimentos. Nas próximas telas, você responderá a 10 perguntas simples que nos ajudarão a identificar seu perfil: conservador, moderado ou arrojado. Suas respostas determinarão as estratégias e produtos mais adequados para você. Vamos começar?",
  },
  {
    texto: "Qual é a sua idade?",
    opcoes: [
      "Acima de 60 anos",
      "Entre 46 e 60 anos",
      "Entre 31 e 45 anos",
      "Entre 18 e 30 anos",
    ],
  },
  {
    texto: "Qual o prazo médio que você planeja manter seus investimentos?",
    opcoes: [
      "Menos de 1 ano",
      "Entre 1 e 3 anos",
      "Entre 3 e 5 anos",
      "Mais de 5 anos",
    ],
  },
  {
    texto:
      "Qual percentual da sua renda mensal você consegue direcionar para investimentos?",
    opcoes: ["Até 10%", "Entre 11% e 20%", "Entre 21% e 30%", "Mais de 30%"],
  },
  {
    texto:
      "Como você reagiria se seu investimento sofresse uma queda temporária de 20%?",
    opcoes: [
      "Venderia tudo imediatamente para evitar mais perdas",
      "Venderia parte para reduzir a exposição ao risco",
      "Manteria o investimento esperando recuperação",
      "Aproveitaria para aumentar o investimento",
    ],
  },
  {
    texto:
      "Qual das seguintes frases melhor descreve sua experiência com investimentos?",
    opcoes: [
      "Nunca investi e tenho pouco conhecimento sobre o assunto",
      "Já investi, mas apenas em produtos de baixo risco como poupança e CDBs",
      "Tenho experiência com diversos produtos, incluindo fundos e algumas ações",
      "Sou um investidor experiente e conheço bem diferentes classes de ativos",
    ],
  },
  {
    texto: "Quais dos seguintes investimentos você já realizou?",
    opcoes: [
      "Poupança, CDBs e Tesouro Direto",
      "Fundos de investimento e ETFs",
      "Ações de empresas brasileiras",
      "Investimentos internacionais, criptomoedas ou derivativos",
    ],
  },
  {
    texto:
      "Qual a importância do seu investimento para seus objetivos financeiros?",
    opcoes: [
      "É minha única reserva financeira",
      "É importante, mas tenho outras reservas",
      "É uma parte complementar da minha estratégia financeira",
      "É um capital que posso arriscar sem comprometer meus objetivos principais",
    ],
  },
  {
    texto: "Qual afirmação melhor reflete sua prioridade ao investir?",
    opcoes: [
      "Preservar o capital sem correr riscos",
      "Obter rendimentos superiores à inflação com segurança",
      "Crescimento do patrimônio, aceitando oscilações moderadas",
      "Maximizar retornos, mesmo com alta volatilidade",
    ],
  },
  {
    texto: "Sobre sua renda atual e estabilidade financeira:",
    opcoes: [
      "Tenho renda variável e despesas que consomem quase toda minha renda",
      "Tenho renda estável, mas pouca sobra mensal",
      "Tenho renda estável com boa margem para investimentos",
      "Tenho renda elevada e diversificada, com grande capacidade de investimento",
    ],
  },
  {
    texto:
      "Em um cenário hipotético, qual opção de investimento você escolheria?",
    opcoes: [
      "Investimento A: Possibilidade de rendimento de 5% ao ano com risco mínimo",
      "Investimento B: Possibilidade de rendimento entre 5% e 15% ao ano com risco médio",
      "Investimento C: Possibilidade de rendimento entre 15% e 25% ao ano com risco alto",
      "Investimento D: Possibilidade de rendimento acima de 25% ao ano com risco muito alto",
    ],
  },
];

const respostasUsuario = new Array(perguntas.length).fill(-1);
const perfis = {
  CONSERVADOR: "Conservador",
  MODERADO: "Moderado",
  ARROJADO: "Arrojado",
};

// ATUALIZAR BARRA DE PROGRESSO
function atualizarBarraProgresso() {
  if (etapaAtual === 0) {
    barraProgresso.style.width = "0%";
    textoProgresso.innerText = "Introdução";
  } else {
    barraProgresso.style.width =
      etapaAtual >= perguntas.length
        ? "100%"
        : `${(etapaAtual / (perguntas.length - 1)) * 100}%`;
    textoProgresso.innerText =
      etapaAtual >= perguntas.length
        ? "Concluído"
        : `Questão ${etapaAtual} de ${perguntas.length - 1}`;
  }
}

// CRIAR ETAPAS HTML
function criarEtapas() {
  perguntas.forEach((pergunta, index) => {
    const div = document.createElement("div");
    div.classList.add("etapa");
    if (index === 0) div.classList.add("active");

    if (pergunta.tipo === "info") {
      div.innerHTML = `<p>${pergunta.conteudo}</p>`;
    } else {
      let html = `<h3>${pergunta.texto}</h3><div class="opcoes-container">`;
      pergunta.opcoes.forEach((opcao, i) => {
        html += `<button class="botao-opcao" data-valor="${i}">${opcao}</button>`;
      });
      div.innerHTML = html + "</div>";

      div.querySelectorAll(".botao-opcao").forEach((btn) => {
        btn.addEventListener("click", () => {
          div
            .querySelectorAll(".botao-opcao")
            .forEach((b) => b.classList.remove("selecionado"));
          btn.classList.add("selecionado");
          respostaSelecionada = parseInt(btn.dataset.valor);
          respostasUsuario[index] = respostaSelecionada;
        });
      });
    }
    etapasContainer.appendChild(div);
  });
}

// MOSTRAR ETAPA ESPECÍFICA
function mostrarEtapa(index) {
  document
    .querySelectorAll(".etapa")
    .forEach((etapa, i) => etapa.classList.toggle("active", i === index));

  btnPular.style.display = index === 0 ? "inline-block" : "none";
  btnVoltar.style.display = index === 0 ? "none" : "inline-block";

  if (index > 0 && respostasUsuario[index] !== -1) {
    const botoes = document
      .querySelector(".etapa.active")
      ?.querySelectorAll(".botao-opcao");
    if (botoes?.length && respostasUsuario[index] < botoes.length) {
      botoes[respostasUsuario[index]].classList.add("selecionado");
      respostaSelecionada = respostasUsuario[index];
    }
  } else {
    respostaSelecionada = -1;
  }

  atualizarBarraProgresso();
}

// AVANÇAR ETAPA
function avancarEtapa() {
  if (
    etapaAtual > 0 &&
    etapaAtual < perguntas.length &&
    respostaSelecionada === -1
  ) {
    alert("Por favor, selecione uma opção antes de continuar.");
    return;
  }

  if (etapaAtual > 0) pontuacao += respostaSelecionada;
  etapaAtual++;
  respostaSelecionada = -1;

  if (etapaAtual >= perguntas.length) {
    mostrarResultado();
    return;
  }

  mostrarEtapa(etapaAtual);
}

// VOLTAR ETAPA
function voltarEtapa() {
  if (etapaAtual > 0) {
    if (respostasUsuario[etapaAtual] !== -1)
      pontuacao -= respostasUsuario[etapaAtual];
    etapaAtual--;
    respostaSelecionada = respostasUsuario[etapaAtual];
    mostrarEtapa(etapaAtual);
  }
}

// ATUALIZAR PERFIL NO BACKEND
async function atualizarPerfilNoBackend(perfil) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return false;

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const dadosAtualizacao = {
      estilo_investidor: perfil,
      ...(userInfo.id && userInfo.id !== "null" && { id: userInfo.id }),
    };

    const response = await fetch(`${API_URL}/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosAtualizacao),
    });

    if (!response.ok) return false;

    const text = await response.text();
    if (text && text.trim()) {
      const data = JSON.parse(text);
      if (data?.data?.user) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, ...data.data.user })
        );
      }
    }
    return true;
  } catch {
    return false;
  }
}

// MOSTRAR RESULTADO FINAL
function mostrarResultado() {
  const perfil =
    pontuacao <= 13 ? "CONSERVADOR" : pontuacao <= 26 ? "MODERADO" : "ARROJADO";
  localStorage.setItem("investorProfile", perfil.toLowerCase());

  etapasContainer.innerHTML = `
        <div class="resultado">
            <h2>Processando resultado...</h2>
            <p>Aguarde enquanto salvamos seu perfil...</p>
            <div class="loading-spinner"></div>
        </div>
    `;

  atualizarPerfilNoBackend(perfil)
    .then((sucesso) => {
      etapasContainer.innerHTML = `
                <div class="resultado">
                    <h2>Seu perfil de investidor é: <span class="perfil-resultado">${
                      perfis[perfil]
                    }</span></h2>
                    <p>Obrigado por completar o questionário! Com base nas suas respostas, identificamos seu perfil e agora poderemos oferecer recomendações personalizadas para seus investimentos.</p>
                    ${
                      sucesso
                        ? '<p class="sucesso">Seu perfil foi salvo com sucesso!</p>'
                        : '<p class="aviso">Não foi possível salvar seu perfil no servidor. Suas preferências serão mantidas apenas localmente.</p>'
                    }
                    <div class="botao-finalizar-container">
                        <button id="btnFinalizar">Finalizar</button>
                    </div>
                </div>
            `;

      document
        .getElementById("btnFinalizar")
        .addEventListener(
          "click",
          () => (window.location.href = "perfil.html")
        );

      [btnProximo, btnVoltar, btnPular].forEach(
        (btn) => (btn.style.display = "none")
      );
      atualizarBarraProgresso();
    })
    .catch(() => {
      etapasContainer.innerHTML = `
                <div class="resultado">
                    <h2>Seu perfil de investidor é: <span class="perfil-resultado">${perfis[perfil]}</span></h2>
                    <p>Obrigado por completar o questionário! Com base nas suas respostas, identificamos seu perfil.</p>
                    <p class="aviso">Ocorreu um erro ao salvar seu perfil. Por favor, tente novamente mais tarde.</p>
                    <div class="botao-finalizar-container">
                        <button id="btnFinalizar">Finalizar</button>
                    </div>
                </div>
            `;

      document
        .getElementById("btnFinalizar")
        .addEventListener(
          "click",
          () => (window.location.href = "../../../html/investidor/perfil.html")
        );

      [btnProximo, btnVoltar, btnPular].forEach(
        (btn) => (btn.style.display = "none")
      );
      atualizarBarraProgresso();
    });
}

// EVENT LISTENERS
btnProximo.addEventListener("click", avancarEtapa);
btnVoltar.addEventListener("click", voltarEtapa);
btnPular.addEventListener("click", () => {
  etapaAtual = perguntas.length;
  mostrarResultado();
});

// INICIALIZAÇÃO
(function iniciar() {
  modal.style.display = "flex";
  etapaAtual = 0;
  pontuacao = 0;
  respostaSelecionada = -1;
  respostasUsuario.fill(-1);
  criarEtapas();
  mostrarEtapa(0);
  btnProximo.style.display = "inline-block";
  btnVoltar.style.display = "none";
  btnPular.style.display = "inline-block";
})();
