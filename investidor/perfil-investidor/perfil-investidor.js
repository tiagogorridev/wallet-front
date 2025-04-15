const modal = document.getElementById("modalQuestionario");
const etapasContainer = document.getElementById("etapas-container");
const btnProximo = document.getElementById("btnProximo");
const btnVoltar = document.getElementById("btnVoltar");
const btnPular = document.getElementById("btnPular");
const barraProgresso = document.getElementById("barraProgresso");
const textoProgresso = document.getElementById("textoProgresso");
const espacoVoltar = document.getElementById("espacoVoltar");

let etapaAtual = 0;
let pontuacao = 0;
let respostaSelecionada = -1;

// Perguntas e opções com pontuação
const perguntas = [
    { 
    texto: "Introdução", 
    tipo: "info", 
    conteudo: "Bem-vindo(a) ao seu perfil de investidor! Para oferecer recomendações personalizadas que se alinhem aos seus objetivos financeiros, gostaríamos de entender melhor sua relação com investimentos. Nas próximas telas, você responderá a 10 perguntas simples que nos ajudarão a identificar seu perfil: conservador, moderado ou arrojado. Suas respostas determinarão as estratégias e produtos mais adequados para você. Vamos começar?" 
    },
    { 
    texto: "Qual é a sua idade?", 
    opcoes: [
        "Acima de 60 anos", 
        "Entre 46 e 60 anos", 
        "Entre 31 e 45 anos", 
        "Entre 18 e 30 anos"
    ] 
    },
    { 
    texto: "Qual o prazo médio que você planeja manter seus investimentos?", 
    opcoes: [
        "Menos de 1 ano", 
        "Entre 1 e 3 anos", 
        "Entre 3 e 5 anos", 
        "Mais de 5 anos"
    ] 
    },
    { 
    texto: "Qual percentual da sua renda mensal você consegue direcionar para investimentos?", 
    opcoes: [
        "Até 10%", 
        "Entre 11% e 20%", 
        "Entre 21% e 30%", 
        "Mais de 30%"
    ] 
    },
    { 
    texto: "Como você reagiria se seu investimento sofresse uma queda temporária de 20%?", 
    opcoes: [
        "Venderia tudo imediatamente para evitar mais perdas", 
        "Venderia parte para reduzir a exposição ao risco", 
        "Manteria o investimento esperando recuperação", 
        "Aproveitaria para aumentar o investimento"
    ] 
    },
    { 
    texto: "Qual das seguintes frases melhor descreve sua experiência com investimentos?", 
    opcoes: [
        "Nunca investi e tenho pouco conhecimento sobre o assunto", 
        "Já investi, mas apenas em produtos de baixo risco como poupança e CDBs", 
        "Tenho experiência com diversos produtos, incluindo fundos e algumas ações", 
        "Sou um investidor experiente e conheço bem diferentes classes de ativos"
    ] 
    },
    { 
    texto: "Quais dos seguintes investimentos você já realizou?", 
    opcoes: [
        "Poupança, CDBs e Tesouro Direto", 
        "Fundos de investimento e ETFs", 
        "Ações de empresas brasileiras", 
        "Investimentos internacionais, criptomoedas ou derivativos"
    ] 
    },
    { 
    texto: "Qual a importância do seu investimento para seus objetivos financeiros?", 
    opcoes: [
        "É minha única reserva financeira", 
        "É importante, mas tenho outras reservas", 
        "É uma parte complementar da minha estratégia financeira", 
        "É um capital que posso arriscar sem comprometer meus objetivos principais"
    ] 
    },
    { 
    texto: "Qual afirmação melhor reflete sua prioridade ao investir?", 
    opcoes: [
        "Preservar o capital sem correr riscos", 
        "Obter rendimentos superiores à inflação com segurança", 
        "Crescimento do patrimônio, aceitando oscilações moderadas", 
        "Maximizar retornos, mesmo com alta volatilidade"
    ] 
    },
    { 
    texto: "Sobre sua renda atual e estabilidade financeira:", 
    opcoes: [
        "Tenho renda variável e despesas que consomem quase toda minha renda", 
        "Tenho renda estável, mas pouca sobra mensal", 
        "Tenho renda estável com boa margem para investimentos", 
        "Tenho renda elevada e diversificada, com grande capacidade de investimento"
    ] 
    },
    { 
    texto: "Em um cenário hipotético, qual opção de investimento você escolheria?", 
    opcoes: [
        "Investimento A: Possibilidade de rendimento de 5% ao ano com risco mínimo", 
        "Investimento B: Possibilidade de rendimento entre 5% e 15% ao ano com risco médio", 
        "Investimento C: Possibilidade de rendimento entre 15% e 25% ao ano com risco alto", 
        "Investimento D: Possibilidade de rendimento acima de 25% ao ano com risco muito alto"
    ] 
    }
];

// Array para armazenar as respostas do usuário
const respostasUsuario = new Array(perguntas.length).fill(-1);

function atualizarBarraProgresso() {
    if (etapaAtual === 0) {
        barraProgresso.style.width = "0%";
        textoProgresso.innerText = "Introdução";
    } else if (etapaAtual >= perguntas.length) {
        barraProgresso.style.width = "100%";
        textoProgresso.innerText = "Concluído";
    } else {
        const progresso = (etapaAtual / (perguntas.length - 1)) * 100;
        barraProgresso.style.width = progresso + "%";
        textoProgresso.innerText = `Questão ${etapaAtual} de ${perguntas.length - 1}`;
    }
}

function criarEtapas() {
    perguntas.forEach((pergunta, index) => {
        const div = document.createElement("div");
        div.classList.add("etapa");
        if (index === 0) div.classList.add("active");

        if (pergunta.tipo === "info") {
            div.innerHTML = `<p>${pergunta.conteudo}</p>`;
        } else {
            div.innerHTML = `<h3>${pergunta.texto}</h3>`;
            
            const opcoesDiv = document.createElement("div");
            opcoesDiv.classList.add("opcoes-container");
            
            pergunta.opcoes.forEach((opcao, i) => {
                const btn = document.createElement("button");
                btn.classList.add("botao-opcao");
                btn.dataset.valor = i;
                btn.innerText = opcao;
                btn.onclick = () => {
                    // Remover seleção anterior
                    opcoesDiv.querySelectorAll('.botao-opcao').forEach(b => {
                        b.classList.remove('selecionado');
                    });
                    
                    // Adicionar seleção atual
                    btn.classList.add('selecionado');
                    
                    // Armazenar resposta selecionada
                    respostaSelecionada = i;
                    respostasUsuario[index] = i;
                };
                opcoesDiv.appendChild(btn);
            });
            
            div.appendChild(opcoesDiv);
        }

        etapasContainer.appendChild(div);
    });
}

function mostrarEtapa(index) {
    const etapas = document.querySelectorAll(".etapa");
    etapas.forEach((etapa, i) => {
        etapa.classList.toggle("active", i === index);
    });

    // Gerenciar visibilidade dos botões de navegação
    if (index === 0) {
        // Na introdução: mostrar Pular, esconder Voltar
        btnPular.style.display = "inline-block";
        btnVoltar.style.display = "none";
        espacoVoltar.style.display = "block";
    } else {
        // Em todas as outras páginas: esconder Pular, mostrar Voltar
        btnPular.style.display = "none";
        btnVoltar.style.display = "inline-block";
        espacoVoltar.style.display = "none";
    }
    
    // Restaurar resposta anterior se existir
    if (index > 0 && respostasUsuario[index] !== -1) {
        const etapaAtiva = document.querySelector(".etapa.active");
        const botoes = etapaAtiva.querySelectorAll(".botao-opcao");
        if (botoes.length > 0 && respostasUsuario[index] < botoes.length) {
            botoes[respostasUsuario[index]].classList.add('selecionado');
            respostaSelecionada = respostasUsuario[index];
        }
    } else {
        respostaSelecionada = -1;
    }

    atualizarBarraProgresso();
}

function avancarEtapa() {
    // Verificar se é uma pergunta e se tem resposta selecionada
    if (etapaAtual > 0 && etapaAtual < perguntas.length && respostaSelecionada === -1) {
        alert("Por favor, selecione uma opção antes de continuar.");
        return;
    }

    // Se não for a tela de introdução, adicionar pontuação
    if (etapaAtual > 0) {
        pontuacao += respostaSelecionada;
    }

    etapaAtual++;
    respostaSelecionada = -1;

    if (etapaAtual >= perguntas.length) {
        mostrarResultado();
        return;
    }

    mostrarEtapa(etapaAtual);
}

function voltarEtapa() {
    if (etapaAtual > 0) {
        // Se estiver em uma pergunta, remover a pontuação dessa pergunta
        if (etapaAtual > 0 && respostasUsuario[etapaAtual] !== -1) {
            pontuacao -= respostasUsuario[etapaAtual];
        }
        
        etapaAtual--;
        respostaSelecionada = respostasUsuario[etapaAtual];
        mostrarEtapa(etapaAtual);
    }
}

function mostrarResultado() {
    let perfil = "";
    const pontuacaoMaxima = 40; // 10 perguntas com pontuação máxima 4 (índice 3) em cada
    
    if (pontuacao <= pontuacaoMaxima * 0.33) {
        perfil = "Conservador";
    } else if (pontuacao <= pontuacaoMaxima * 0.66) {
        perfil = "Moderado";
    } else {
        perfil = "Arrojado";
    }

    etapasContainer.innerHTML = `
        <div class="resultado">
            <h2>Seu perfil de investidor é: <span class="perfil-resultado">${perfil}</span></h2>
            <p>Obrigado por completar o questionário! Com base nas suas respostas, identificamos seu perfil e agora poderemos oferecer recomendações personalizadas para seus investimentos.</p>
        </div>
    `;

    btnProximo.style.display = "none";
    btnVoltar.style.display = "none";
    btnPular.style.display = "none";
    espacoVoltar.style.display = "none";
    
    atualizarBarraProgresso();
}

btnProximo.addEventListener("click", () => {
    avancarEtapa();
});

btnVoltar.addEventListener("click", () => {
    voltarEtapa();
});

btnPular.addEventListener("click", () => {
    etapaAtual = perguntas.length; // pula tudo
    mostrarResultado();
});

abrirQuestionario();
function abrirQuestionario() {
    modal.style.display = "flex";
    etapaAtual = 0;
    pontuacao = 0;
    respostaSelecionada = -1;
    respostasUsuario.fill(-1);
    etapasContainer.innerHTML = "";
    criarEtapas();
    mostrarEtapa(0);
    
    // Configurar estado inicial dos botões
    btnProximo.style.display = "inline-block";
    btnVoltar.style.display = "none";
    btnPular.style.display = "inline-block";
    espacoVoltar.style.display = "block";
}