// BUSCA DE DADOS DA API
fetch(
  "https://economia.awesomeapi.com.br/json/last/EUR-BRL,GBP-BRL,CAD-BRL,USD-BRL,JPY-BRL"
)
  .then((r) => r.json())
  .then((d) => {
    // PREENCHIMENTO DOS ELEMENTOS HTML
    document.getElementById("usd").textContent = `R$ ${parseFloat(
      d.USDBRL.bid
    ).toFixed(2)}`;
    document.getElementById("eur").textContent = `R$ ${parseFloat(
      d.EURBRL.bid
    ).toFixed(2)}`;
    document.getElementById("gbp").textContent = `R$ ${parseFloat(
      d.GBPBRL.bid
    ).toFixed(2)}`;
    document.getElementById("cad").textContent = `R$ ${parseFloat(
      d.CADBRL.bid
    ).toFixed(2)}`;
  })
  // TRATAMENTO DE ERRO
  .catch((e) => console.error("Erro:", e));
