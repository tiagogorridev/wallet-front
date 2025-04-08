document.addEventListener('DOMContentLoaded', function() {
  // Estado da aplicação
  const state = {
    lancamentos: [
      {
        data: '20/11/2024',
        tipo: 'Compra',
        ativo: 'BTC',
        descricao: 'Compra de Bitcoin',
        quantidade: 0.05,
        valorUnitario: 78500.00,
        valorTotal: 3925.00,
        categoria: 'Criptomoedas'
      },
      {
        data: '15/03/2025',
        tipo: 'Venda',
        ativo: 'ETH',
        descricao: 'Venda de Ethereum',
        quantidade: 0.8,
        valorUnitario: 4120.00,
        valorTotal: 3296.00,
        categoria: 'Criptomoedas'
      },
      {
        data: '10/03/2025',
        tipo: 'Dividendo',
        ativo: 'PETR4',
        descricao: 'Dividendo Petrobras',
        quantidade: 50,
        valorUnitario: 2.35,
        valorTotal: 117.50,
        categoria: 'Ações'
      },
      {
        data: '01/03/2025',
        tipo: 'Compra',
        ativo: 'VALE3',
        descricao: 'Compra de Vale',
        quantidade: 30,
        valorUnitario: 68.75,
        valorTotal: 2062.50,
        categoria: 'Ações'
      }
    ],
    categorias: ['Criptomoedas', 'Fundos Imobiliários', 'Ações', 'Renda Fixa'],
    categoriaSelecionada: 'Criptomoedas',
    periodoMeses: 12,
    ativoFilter: null,
    tipoFilter: null
  };

  // Elementos DOM
  const elements = {
    categoriaBtns: document.querySelectorAll('.categoria-btn'),
    lancamentosTbody: document.getElementById('lancamentos-tbody'),
    totalInvestido: document.getElementById('total-investido'),
    totalResgatado: document.getElementById('total-resgatado'),
    totalDividendos: document.getElementById('total-dividendos'),
    addAtivoBtn: document.getElementById('adicionar-ativo-btn'),
    modalOverlay: document.getElementById('modal-overlay'),
    closeModalBtn: document.getElementById('close-modal'),
    cancelBtn: document.getElementById('cancel-btn'),
    adicionarAtivoForm: document.getElementById('adicionar-ativo-form'),
    periodoDrop: document.querySelector('[data-dropdown="periodo"]'),
    periodoDropdown: document.getElementById('periodo-dropdown'),
    ativosDrop: document.querySelector('[data-dropdown="ativos"]'),
    ativosDropdown: document.getElementById('ativos-dropdown')
  };

  // Inicialização
  init();

  // Funções de inicialização
  function init() {
    setupEventListeners();
    renderLancamentos();
    updateSummary();
  }

  function setupEventListeners() {
    // Filtros de categoria
    elements.categoriaBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const categoria = this.getAttribute('data-categoria');
        selecionarCategoria(categoria);
      });
    });

    // Dropdowns
    elements.periodoDrop.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleDropdown('periodo');
    });

    elements.ativosDrop.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleDropdown('ativos');
    });

    // Opções dos dropdowns
    document.querySelectorAll('#periodo-dropdown li').forEach(item => {
      item.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        updatePeriod(value);
        elements.periodoDrop.querySelector('.dropdown-label').textContent = `${value} MESES`;
        closeDropdowns();
      });
    });

    document.querySelectorAll('#ativos-dropdown li').forEach(item => {
      item.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        updateAtivoFilter(value);
        elements.ativosDrop.querySelector('.dropdown-label').textContent = value;
        closeDropdowns();
      });
    });

    // Modal
    elements.addAtivoBtn.addEventListener('click', openModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);

    // Form submission
    elements.adicionarAtivoForm.addEventListener('submit', handleFormSubmit);

    // Close dropdowns on outside click
    document.addEventListener('click', closeDropdowns);

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
        closeDropdowns();
      }
    });
  }

  // Funções para manipulação de dados
  function parseDataBR(dataString) {
    const [dia, mes, ano] = dataString.split('/').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  function filtrarLancamentos() {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setMonth(hoje.getMonth() - state.periodoMeses);

    return state.lancamentos.filter(lancamento => {
      const dataLancamento = parseDataBR(lancamento.data);
      const dataMatch = dataLancamento >= dataLimite;

      let categoriaMatch = true;
      if (state.ativoFilter) {
        categoriaMatch = lancamento.categoria === state.ativoFilter;
      } else if (state.categoriaSelecionada) {
        categoriaMatch = lancamento.categoria === state.categoriaSelecionada;
      }

      const tipoMatch = state.tipoFilter ? lancamento.tipo === state.tipoFilter : true;

      return dataMatch && categoriaMatch && tipoMatch;
    });
  }

  function calcularTotalInvestido(lancamentos) {
    return lancamentos.reduce((total, lancamento) =>
      lancamento.tipo === 'Compra' ? total + lancamento.valorTotal : total, 0);
  }

  function calcularTotalResgatado(lancamentos) {
    return lancamentos.reduce((total, lancamento) =>
      lancamento.tipo === 'Venda' ? total + lancamento.valorTotal : total, 0);
  }

  function calcularDividendos(lancamentos) {
    return lancamentos.reduce((total, lancamento) =>
      lancamento.tipo === 'Dividendo' ? total + lancamento.valorTotal : total, 0);
  }

  // Funções de atualização da UI
  function renderLancamentos() {
    const lancamentosFiltrados = filtrarLancamentos();
    elements.lancamentosTbody.innerHTML = '';

    lancamentosFiltrados.forEach(lancamento => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${lancamento.data}</td>
        <td>${lancamento.tipo}</td>
        <td>${lancamento.ativo}</td>
        <td>${lancamento.descricao}</td>
        <td>${lancamento.quantidade.toFixed(2)}</td>
        <td>R$ ${lancamento.valorUnitario.toFixed(2)}</td>
        <td>R$ ${lancamento.valorTotal.toFixed(2)}</td>
      `;
      elements.lancamentosTbody.appendChild(row);
    });
  }

  function updateSummary() {
    const lancamentosFiltrados = filtrarLancamentos();
    const totalInvestido = calcularTotalInvestido(lancamentosFiltrados);
    const totalResgatado = calcularTotalResgatado(lancamentosFiltrados);
    const totalDividendos = calcularDividendos(lancamentosFiltrados);

    elements.totalInvestido.textContent = `R$ ${totalInvestido.toFixed(2)}`;
    elements.totalResgatado.textContent = `R$ ${totalResgatado.toFixed(2)}`;
    elements.totalDividendos.textContent = `R$ ${totalDividendos.toFixed(2)}`;
  }

  function selecionarCategoria(categoria) {
    state.categoriaSelecionada = categoria;
    state.ativoFilter = categoria;

    // Atualizar UI
    elements.categoriaBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-categoria') === categoria) {
        btn.classList.add('active');
      }
    });

    const categoriaMap = {
      'Criptomoedas': 'CRIPTOS',
      'Fundos Imobiliários': 'FIIS',
      'Ações': 'AÇÕES',
      'Renda Fixa': 'RENDA FIXA'
    };

    elements.ativosDrop.querySelector('.dropdown-label').textContent = categoriaMap[categoria] || 'TODOS';

    renderLancamentos();
    updateSummary();
  }

  // Funções para dropdowns
  function toggleDropdown(dropdownId) {
    // Fechar todos os outros dropdowns
    const otherDropdownIds = ['periodo', 'ativos'].filter(id => id !== dropdownId);
    otherDropdownIds.forEach(id => {
      document.getElementById(`${id}-dropdown`).classList.remove('show');
    });

    // Alternar o dropdown atual
    document.getElementById(`${dropdownId}-dropdown`).classList.toggle('show');
  }

  function closeDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('show');
    });
  }

  function updatePeriod(periodOption) {
    state.periodoMeses = parseInt(periodOption);
    console.log('Período selecionado:', state.periodoMeses, 'meses');
    renderLancamentos();
    updateSummary();
  }

  function updateAtivoFilter(ativoOption) {
    console.log('Ativo selecionado:', ativoOption);

    const ativoMap = {
      'TODOS': null,
      'CRIPTOS': 'Criptomoedas',
      'FIIS': 'Fundos Imobiliários',
      'AÇÕES': 'Ações',
      'RENDA FIXA': 'Renda Fixa'
    };

    state.ativoFilter = ativoMap[ativoOption] || null;

    if (state.ativoFilter) {
      state.categoriaSelecionada = state.ativoFilter;

      // Atualizar botões de categoria
      elements.categoriaBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-categoria') === state.ativoFilter) {
          btn.classList.add('active');
        }
      });
    }

    renderLancamentos();
    updateSummary();
  }

  // Funções para o modal
  function openModal() {
    elements.modalOverlay.style.display = 'flex';
  }

  function closeModal() {
    elements.modalOverlay.style.display = 'none';
    elements.adicionarAtivoForm.reset();
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value;
    const ativo = document.getElementById('ativo').value;
    const descricao = document.getElementById('descricao').value;
    const quantidade = parseFloat(document.getElementById('quantidade').value);
    const valorUnitario = parseFloat(document.getElementById('valorUnitario').value);
    const categoria = document.getElementById('categoria').value;

    // Formato da data DD/MM/YYYY
    const formattedDate = formatDate(new Date(data));

    const novoLancamento = {
      data: formattedDate,
      tipo,
      ativo,
      descricao,
      quantidade,
      valorUnitario,
      valorTotal: quantidade * valorUnitario,
      categoria
    };

    // Adicionar o novo lançamento
    state.lancamentos.unshift(novoLancamento);

    // Atualizar a UI
    renderLancamentos();
    updateSummary();

    // Fechar o modal
    closeModal();

    console.log('Novo ativo adicionado:', novoLancamento);
  }

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // CSS auxiliar para exibir os dropdowns abertos
  const style = document.createElement('style');
  style.textContent = `
    .dropdown-menu {
      display: none;
    }
    .dropdown-menu.show {
      display: block;
    }
  `;
  document.head.appendChild(style);
});
