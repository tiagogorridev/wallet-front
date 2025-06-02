// GERENCIADOR DE ATIVOS - OPERAÇÕES CRUD DOS ATIVOS
const AssetManager = {
  // CARREGAMENTO DO DROPDOWN DE ATIVOS
  loadAssetsDropdown() {
    const dropdown = document.getElementById("assetDropdown");
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Carregando...</option>';

    APIService.getAssets()
      .then((response) => {
        const assets = response.data?.data || [];
        dropdown.innerHTML = '<option value="">Selecione um ativo</option>';

        if (!assets.length) {
          dropdown.innerHTML =
            '<option value="">Nenhum ativo disponível</option>';
          return;
        }

        const grouped = {};
        assets.forEach((asset) => {
          const type = asset.tipo;
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push(asset);
        });

        for (const type in grouped) {
          const optgroup = document.createElement("optgroup");
          optgroup.label = Utils.getTypeLabel(type);

          grouped[type].forEach((asset) => {
            const option = document.createElement("option");
            option.value = asset.id;
            option.textContent =
              asset.nome + (asset.simbolo ? ` (${asset.simbolo})` : "");
            option.dataset.price = asset.preco_atual || "";
            option.dataset.category = Utils.mapTypeToCategoryForForm(type);
            option.dataset.name = asset.nome || "";
            optgroup.appendChild(option);
          });
          dropdown.appendChild(optgroup);
        }

        dropdown.addEventListener("change", function () {
          const option = this.options[this.selectedIndex];
          if (option?.value) {
            const nameInput = document.getElementById("assetName");
            const valueInput = document.getElementById("assetValuePerUnit");
            const categorySelect = document.getElementById("assetCategory");

            if (nameInput)
              nameInput.value = option.dataset.name || option.textContent;
            if (valueInput) valueInput.value = option.dataset.price || "";
            if (categorySelect && option.dataset.category) {
              categorySelect.value = option.dataset.category;
            }
          }
        });
      })
      .catch((error) => {
        dropdown.innerHTML = '<option value="">Erro ao carregar</option>';
        alert(`Erro: ${error.message}`);
      });
  },

  // ABERTURA DO MODAL DE EDIÇÃO
  openEditAssetModal(assetId) {
    const modal = document.getElementById("editAssetModal");
    if (!modal) return;

    const assetRow = document
      .querySelector(`[data-asset-id="${assetId}"]`)
      .closest("tr");
    if (!assetRow) return;

    const assetName = assetRow.cells[0].textContent;
    const categorySpan = assetRow.cells[1].querySelector(".asset-category");
    const category = categorySpan
      ? Utils.getCategoryValueFromClass(categorySpan.className)
      : "CRIPTOMOEDAS";
    const quantity = parseFloat(
      assetRow.cells[2].textContent.replace(/\./g, "").replace(",", ".")
    );
    const valuePerUnit = parseFloat(
      assetRow.cells[3].textContent
        .replace("R$ ", "")
        .replace(/\./g, "")
        .replace(",", ".")
    );
    const transactionId = assetRow.dataset.transactionId || null;

    document.getElementById("editAssetId").value = assetId;
    document.getElementById("editAssetName").value = assetName;
    document.getElementById("editAssetCategory").value = category;
    document.getElementById("editAssetValuePerUnit").value = valuePerUnit;
    document.getElementById("editAssetQuantity").value = quantity;
    document.getElementById("editTransactionId").value = transactionId;
    document.getElementById("editAssetPurchaseDate").value = new Date()
      .toISOString()
      .substring(0, 10);

    if (window.ModalFunctions) {
      window.ModalFunctions.createModal("editAssetModal").openModal();
    } else {
      modal.style.display = "flex";
    }
  },

  // ATUALIZAÇÃO DE ATIVO
  updateAsset(event) {
    event.preventDefault();

    const assetId = document.getElementById("editAssetId").value;
    const transactionId = document.getElementById("editTransactionId").value;
    const assetName = document.getElementById("editAssetName").value;
    const assetCategory = document.getElementById("editAssetCategory").value;
    const assetValuePerUnit = parseFloat(
      document.getElementById("editAssetValuePerUnit").value
    );
    const assetQuantity = parseFloat(
      document.getElementById("editAssetQuantity").value
    );
    const assetPurchaseDate = document.getElementById(
      "editAssetPurchaseDate"
    ).value;

    if (assetCategory === "ACOES" && !Number.isInteger(assetQuantity)) {
      alert("Para ações, a quantidade deve ser um número inteiro");
      return;
    }

    const walletId = localStorage.getItem("selectedWalletId");
    if (!walletId) {
      alert("Carteira não selecionada. Faça login novamente.");
      window.location.href = "../../index.html";
      return;
    }

    const data = {
      id_carteira: parseInt(walletId),
      nome_ativo: assetName,
      tipo: "COMPRA",
      quantidade: assetQuantity,
      valor_unitario: assetValuePerUnit,
      data_transacao: assetPurchaseDate,
      taxa_corretagem: 0.0,
      notas: "",
    };

    const closeModal = () => {
      if (window.ModalFunctions) {
        window.ModalFunctions.createModal("editAssetModal").closeModal();
      } else {
        document.getElementById("editAssetModal").style.display = "none";
      }
      document.getElementById("editAssetForm").reset();
      window.location.reload();
    };

    if (transactionId) {
      APIService.updateTransaction(transactionId, data)
        .then(() => {
          alert("Ativo atualizado!");
          closeModal();
        })
        .catch((error) => alert(`Erro: ${error.message}`));
    } else {
      data.id_ativo = parseInt(assetId);
      APIService.addTransaction(data)
        .then(() => {
          alert("Ativo atualizado!");
          closeModal();
        })
        .catch((error) => alert(`Erro: ${error.message}`));
    }
  },

  // ADIÇÃO DE NOVO ATIVO
  addAsset(event) {
    event.preventDefault();

    const assetName = document.getElementById("assetName").value;
    if (!assetName) {
      alert("Insira um nome para o ativo");
      return;
    }

    const assetCategory = document.getElementById("assetCategory").value;
    const assetValuePerUnit = parseFloat(
      document.getElementById("assetValuePerUnit").value
    );
    const assetQuantity = parseFloat(
      document.getElementById("assetQuantity").value
    );
    const assetPurchaseDate =
      document.getElementById("assetPurchaseDate").value;

    if (assetCategory === "ACOES" && !Number.isInteger(assetQuantity)) {
      alert("Para ações, a quantidade deve ser um número inteiro");
      return;
    }

    const walletId = localStorage.getItem("selectedWalletId");
    if (!walletId) {
      alert("Carteira não selecionada. Faça login novamente.");
      window.location.href = "../../index.html";
      return;
    }

    const data = {
      id_carteira: parseInt(walletId),
      nome_ativo: assetName,
      tipo: "COMPRA",
      quantidade: assetQuantity,
      valor_unitario: assetValuePerUnit,
      data_transacao: assetPurchaseDate,
      taxa_corretagem: 0.0,
      notas: "",
    };

    APIService.addTransaction(data)
      .then(() => {
        alert("Ativo adicionado!");

        if (window.ModalFunctions) {
          window.ModalFunctions.createModal("addAssetModal").closeModal();
        } else {
          document.getElementById("addAssetModal").style.display = "none";
        }

        document.getElementById("addAssetForm").reset();
        window.location.reload();
      })
      .catch((error) => alert(`Erro: ${error.message}`));
  },

  // EXCLUSÃO DE ATIVO
  deleteAsset(assetId) {
    if (!assetId) return;

    if (confirm("Remover este ativo da carteira?")) {
      APIService.deleteTransaction(assetId)
        .then(() => {
          alert("Ativo removido!");
          window.location.reload();
        })
        .catch((error) => alert(`Erro: ${error.message}`));
    }
  },
};
