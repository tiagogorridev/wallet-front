
fetch("https://economia.awesomeapi.com.br/json/last/EUR-BRL,GBP-BRL,CAD-BRL,USD-BRL,JPY-BRL")
    .then(response => response.json())
    .then(data => {
        console.log(data); // Para ver a estrutura no console

        // Preenchendo os spans com os valores de compra (bid)
        document.getElementById("usd").textContent = `R$ ${parseFloat(data.USDBRL.bid).toFixed(2)}`;
        document.getElementById("eur").textContent = `R$ ${parseFloat(data.EURBRL.bid).toFixed(2)}`;
        document.getElementById("gbp").textContent = `R$ ${parseFloat(data.GBPBRL.bid).toFixed(2)}`;
        document.getElementById("cad").textContent = `R$ ${parseFloat(data.CADBRL.bid).toFixed(2)}`;
    })
    .catch(error => {
        console.error("Erro ao buscar cotações:", error);
    });

