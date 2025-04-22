let grafico = null;

function gerarRelatorio() {
  const tipo = document.getElementById("tipoRelatorio").value;

  const dados = gerarDadosMock(tipo);

  const ctx = document.getElementById('graficoRelatorio').getContext('2d');
  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.labels,
      datasets: [{
        label: 'Investimentos (R$)',
        data: dados.valores,
        backgroundColor: '#74b9ff'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'R$ ' + value;
            }
          }
        }
      }
    }
  });
}

function exportarDados() {
  const dados = [
    ["Nome", "Categoria", "Valor Investido"],
    ["PETR4", "Petróleo", 10000],
    ["VALE3", "Mineração", 8000],
    ["ITUB4", "Bancos", 12000]
  ];

  let csvContent = "data:text/csv;charset=utf-8,";
  dados.forEach(rowArray => {
    let row = rowArray.join(";");
    csvContent += row + "\r\n";
  });

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "dados_investimentos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function gerarDadosMock(tipo) {
  switch (tipo) {
    case "mensal":
      return {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai"],
        valores: [3000, 4500, 5000, 6200, 7100]
      };
    case "anual":
      return {
        labels: ["2021", "2022", "2023", "2024"],
        valores: [25000, 32000, 41000, 50000]
      };
    case "porAtivo":
      return {
        labels: ["PETR4", "VALE3", "ITUB4"],
        valores: [15000, 23000, 19000]
      };
    default:
      return {
        labels: [],
        valores: []
      };
  }
}
