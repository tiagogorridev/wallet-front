const API_URL = 'http://191.239.116.115:8080';

// Inicializa tudo quando o DOM carrega
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    initSaveButtons();
    initInvestorProfiles();
});

// Carrega dados do usuário
function loadUserData() {
    const userInfo = getUserInfo();
    if (userInfo) {
        if (userInfo.nome) document.getElementById('user-name').value = userInfo.nome;
        if (userInfo.email) document.getElementById('user-email').value = userInfo.email;
        if (userInfo.estilo_investidor) selectInvestorProfile(userInfo.estilo_investidor);
    }
}

// Seleciona perfil de investidor
function selectInvestorProfile(profileType) {
    const profileOptions = document.querySelectorAll('.profile-option');
    const profileMapping = {
        'CONSERVADOR': 'conservative',
        'MODERADO': 'moderate',
        'ARROJADO': 'aggressive'
    };
    
    const profileValue = profileMapping[profileType] || 'conservative';
    
    profileOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-profile') === profileValue) {
            option.classList.add('selected');
        }
    });
}

// Inicializa botão de salvar dados pessoais
function initSaveButtons() {
    const saveBtn = document.getElementById('save-personal-data');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const userName = document.getElementById('user-name').value;
            
            if (!userName) {
                alert('Por favor, preencha o campo de nome!');
                return;
            }
            
            const userInfo = getUserInfo() || {};
            userInfo.nome = userName;
            saveUserInfo(userInfo);
            
            // Atualiza apenas o nome
            updateUserData({ nome: userName }, 'Nome atualizado com sucesso!');
        });
    }
}

// Inicializa perfis de investidor
function initInvestorProfiles() {
    const profileOptions = document.querySelectorAll('.profile-option');
    if (profileOptions.length > 0) {
        profileOptions.forEach(option => {
            option.addEventListener('click', function() {
                profileOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                const profileType = this.getAttribute('data-profile');
                const profileMapping = {
                    'conservative': 'CONSERVADOR',
                    'moderate': 'MODERADO',
                    'aggressive': 'ARROJADO'
                };
                
                const profileName = {
                    'conservative': 'Conservador',
                    'moderate': 'Moderado',
                    'aggressive': 'Arrojado'
                }[profileType];
                
                const userInfo = getUserInfo() || {};
                userInfo.estilo_investidor = profileMapping[profileType];
                saveUserInfo(userInfo);
                
                // Atualiza apenas o perfil de investidor
                updateUserData(
                    { estilo_investidor: profileMapping[profileType] },
                    `Perfil de investidor alterado para ${profileName}`
                );
            });
        });
    }
}

// Funções de utilidade
function getUserInfo() {
    const userInfoString = localStorage.getItem('userInfo');
    return userInfoString ? JSON.parse(userInfoString) : null;
}

function saveUserInfo(userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

// Atualiza dados no backend
function updateUserData(data, successMessage) {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
        alert('Erro: Usuário não autenticado');
        return;
    }
    
    const userInfo = getUserInfo();
    if (userInfo && userInfo.id && userInfo.id !== 'null') {
        data.id = userInfo.id;
    }
    
    fetch(`${API_URL}/users`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                let errorMsg = 'Erro na atualização';
                try {
                    if (text && text.trim()) {
                        const errorData = JSON.parse(text);
                        if (errorData && errorData.msg) errorMsg = errorData.msg;
                    }
                } catch (e) {}
                throw new Error(errorMsg);
            });
        }
        return response.text().then(text => {
            return text && text.trim() ? JSON.parse(text) : { success: true };
        });
    })
    .then(responseData => {
        if (responseData && responseData.data && responseData.data.user) {
            const userInfo = getUserInfo() || {};
            saveUserInfo({...userInfo, ...responseData.data.user});
        }
        
        alert(successMessage);
        
        // Atualiza exibição do nome se necessário
        if (data.nome) {
            document.querySelectorAll('.user-name-display').forEach(element => {
                element.textContent = data.nome;
            });
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert(`Erro: ${error.message}`);
    });
}