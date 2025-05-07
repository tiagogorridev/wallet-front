const AssetManager = {
    loadAssetsDropdown() {
        const assetDropdown = document.getElementById('assetDropdown');
        if (!assetDropdown) {
            console.error('Elemento assetDropdown não encontrado');
            return;
        }
        assetDropdown.innerHTML = '<option value="">Carregando ativos...</option>';
        
        APIService.getAssets()
            .then(response => {
                const assets = response.data?.data || [];
                console.log('Ativos processados:', assets);
                
                assetDropdown.innerHTML = '<option value="">Selecione um ativo</option>';
                if (!assets || !assets.length) {
                    assetDropdown.innerHTML = '<option value="">Nenhum ativo disponível</option>';
                    return;
                }
                const assetsByType = {};
                
                assets.forEach(asset => {
                    const type = asset.tipo;
                    if (!assetsByType[type]) {
                        assetsByType[type] = [];
                    }
                    assetsByType[type].push(asset);
                });
                
                for (const type in assetsByType) {
                    if (assetsByType[type].length > 0) {
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = Utils.getTypeLabel(type);
                        assetsByType[type].forEach(asset => {
                            const option = document.createElement('option');
                            option.value = asset.id;
                            option.textContent = asset.nome + (asset.simbolo ? ` (${asset.simbolo})` : '');
                            option.dataset.price = asset.preco_atual || '';
                            option.dataset.category = Utils.mapTypeToCategoryForForm(type);
                            option.dataset.name = asset.nome || '';
                            optgroup.appendChild(option);
                        });
                        assetDropdown.appendChild(optgroup);
                    }
                }
                
                assetDropdown.addEventListener('change', function () {
                    const selectedOption = this.options[this.selectedIndex];
                    if (selectedOption && selectedOption.value) {
                        const nameInput = document.getElementById('assetName');
                        const valueInput = document.getElementById('assetValuePerUnit');
                        const categorySelect = document.getElementById('assetCategory');
                        if (nameInput) nameInput.value = selectedOption.dataset.name || selectedOption.textContent;
                        if (valueInput) valueInput.value = selectedOption.dataset.price || '';
                        if (categorySelect && selectedOption.dataset.category) {
                            categorySelect.value = selectedOption.dataset.category;
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao carregar ativos:', error);
                assetDropdown.innerHTML = '<option value="">Erro ao carregar ativos</option>';
                alert(`Erro ao carregar a lista de ativos: ${error.message}`);
            });
    },

    openEditAssetModal(assetId) {
        const modal = document.getElementById('editAssetModal');
        if (!modal) {
            console.error('Modal de edição não encontrado');
            return;
        }
        
        const editAssetId = document.getElementById('editAssetId');
        const editAssetName = document.getElementById('editAssetName');
        const editAssetCategory = document.getElementById('editAssetCategory');
        const editAssetValuePerUnit = document.getElementById('editAssetValuePerUnit');
        const editAssetQuantity = document.getElementById('editAssetQuantity');
        const editAssetPurchaseDate = document.getElementById('editAssetPurchaseDate');
        const editTransactionId = document.getElementById('editTransactionId');
        
        const assetRow = document.querySelector(`[data-asset-id="${assetId}"]`).closest('tr');
        if (!assetRow) {
            console.error('Linha do ativo não encontrada');
            return;
        }
        
        const assetName = assetRow.cells[0].textContent;
        const categorySpan = assetRow.cells[1].querySelector('.asset-category');
        const category = categorySpan ? Utils.getCategoryValueFromClass(categorySpan.className) : 'CRIPTOMOEDAS';
        const quantity = parseFloat(assetRow.cells[2].textContent.replace(/\./g, '').replace(',', '.'));
        const valuePerUnit = parseFloat(assetRow.cells[3].textContent.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
        
        const transactionId = assetRow.dataset.transactionId || null;
        
        editAssetId.value = assetId;
        editAssetName.value = assetName;
        editAssetCategory.value = category;
        editAssetValuePerUnit.value = valuePerUnit;
        editAssetQuantity.value = quantity;
        editTransactionId.value = transactionId;
        
        const today = new Date();
        const formattedDate = today.toISOString().substring(0, 10);
        editAssetPurchaseDate.value = formattedDate;
        
        if (window.ModalFunctions) {
            const editModal = window.ModalFunctions.createModal('editAssetModal');
            editModal.openModal();
        } else {
            modal.style.display = 'flex';
        }
    },

    updateAsset(event) {
        event.preventDefault();
        
        const assetId = document.getElementById('editAssetId').value;
        const transactionId = document.getElementById('editTransactionId').value;
        const assetName = document.getElementById('editAssetName').value;
        const assetCategory = document.getElementById('editAssetCategory').value;
        const assetValuePerUnit = parseFloat(document.getElementById('editAssetValuePerUnit').value);
        const assetQuantity = parseFloat(document.getElementById('editAssetQuantity').value);
        const assetPurchaseDate = document.getElementById('editAssetPurchaseDate').value;
        
        if (assetCategory === 'ACOES' && !Number.isInteger(assetQuantity)) {
            alert('Para ações, a quantidade deve ser um número inteiro');
            return;
        }
        
        const walletId = localStorage.getItem('selectedWalletId');
        
        if (!walletId) {
            alert('Carteira não selecionada. Por favor, faça login novamente.');
            window.location.href = '../../index.html';
            return;
        }
        
        const transactionData = {
            id_carteira: parseInt(walletId),
            nome_ativo: assetName,
            tipo: "COMPRA",
            quantidade: assetQuantity,
            valor_unitario: assetValuePerUnit,
            data_transacao: assetPurchaseDate,
            taxa_corretagem: 0.0,
            notas: ""
        };
        
        if (transactionId) {
            APIService.updateTransaction(transactionId, transactionData)
                .then(() => {
                    alert('Ativo atualizado com sucesso!');
                    
                    if (window.ModalFunctions) {
                        const editModal = window.ModalFunctions.createModal('editAssetModal');
                        editModal.closeModal();
                    } else {
                        document.getElementById('editAssetModal').style.display = 'none';
                    }
                    
                    document.getElementById('editAssetForm').reset();
                    
                    window.location.reload();
                })
                .catch(error => {
                    alert(`Erro ao atualizar ativo: ${error.message}`);
                });
        } else {
            transactionData.id_ativo = parseInt(assetId);
            
            APIService.addTransaction(transactionData)
                .then(() => {
                    alert('Ativo atualizado com sucesso!');
                    
                    if (window.ModalFunctions) {
                        const editModal = window.ModalFunctions.createModal('editAssetModal');
                        editModal.closeModal();
                    } else {
                        document.getElementById('editAssetModal').style.display = 'none';
                    }
                    
                    document.getElementById('editAssetForm').reset();
                    
                    window.location.reload();
                })
                .catch(error => {
                    alert(`Erro ao atualizar ativo: ${error.message}`);
                });
        }
    },

    addAsset(event) {
        event.preventDefault();
        const assetName = document.getElementById('assetName').value;
        if (!assetName) {
            alert('Por favor, insira um nome para o ativo');
            return;
        }
        const assetCategory = document.getElementById('assetCategory').value;
        const assetValuePerUnit = parseFloat(document.getElementById('assetValuePerUnit').value);
        const assetQuantity = parseFloat(document.getElementById('assetQuantity').value);
        const assetPurchaseDate = document.getElementById('assetPurchaseDate').value;
        if (assetCategory === 'ACOES' && !Number.isInteger(assetQuantity)) {
            alert('Para ações, a quantidade deve ser um número inteiro');
            return;
        }
        const walletId = localStorage.getItem('selectedWalletId');
        if (!walletId) {
            alert('Carteira não selecionada. Por favor, faça login novamente.');
            window.location.href = '../../index.html';
            return;
        }
        const transactionData = {
            id_carteira: parseInt(walletId),
            nome_ativo: assetName,
            tipo: "COMPRA",
            quantidade: assetQuantity,
            valor_unitario: assetValuePerUnit,
            data_transacao: assetPurchaseDate,
            taxa_corretagem: 0.0,
            notas: ""
        };
        APIService.addTransaction(transactionData)
            .then(() => {
                alert('Ativo adicionado com sucesso!');
                
                if (window.ModalFunctions) {
                    const addModal = window.ModalFunctions.createModal('addAssetModal');
                    addModal.closeModal();
                } else {
                    document.getElementById('addAssetModal').style.display = 'none';
                }
                
                document.getElementById('addAssetForm').reset();
                
                window.location.reload();
            })
            .catch(error => {
                alert(`Erro ao adicionar ativo: ${error.message}`);
            });
    },

    deleteAsset(assetId) {
        if (!assetId) {
            console.error('ID do ativo não fornecido');
            return;
        }
        
        if (confirm('Tem certeza que deseja remover este ativo da carteira?')) {
            APIService.deleteTransaction(assetId)
                .then(() => {
                    alert('Ativo removido com sucesso!');
                    
                    window.location.reload();
                })
                .catch(error => {
                    alert(`Erro ao remover ativo: ${error.message}`);
                });
        }
    },

    refreshPortfolio() {
        const walletId = localStorage.getItem('selectedWalletId');
        if (walletId) {
            APIService.getWalletById(parseInt(walletId))
                .then(portfolioData => {
                    document.dispatchEvent(new CustomEvent('portfolioChanged', {
                        detail: { portfolio: portfolioData }
                    }));
                })
                .catch(error => {
                    console.error('Erro ao atualizar portfólio:', error);
                });
        }
    }
};

window.AssetManager = AssetManager;