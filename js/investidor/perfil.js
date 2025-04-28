const API_URL = 'http://191.239.116.115:8080';

document.addEventListener('DOMContentLoaded', function() {
    initPasswordToggle();
    loadUserData();
    initSaveButtons();
    initInvestorProfiles();
});

function loadUserData() {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        
        if (userInfo.nome) {
            document.getElementById('user-name').value = userInfo.nome;
        }
        
        if (userInfo.email) {
            document.getElementById('user-email').value = userInfo.email;
        }
        
        if (userInfo.estilo_investidor) {
            selectInvestorProfile(userInfo.estilo_investidor);
        }
    }
}

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

function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

function initSaveButtons() {
    const savePersonalDataBtn = document.getElementById('save-personal-data');
    if (savePersonalDataBtn) {
        savePersonalDataBtn.addEventListener('click', function() {
            const userName = document.getElementById('user-name').value;
            
            if (!userName) {
                alert('Por favor, preencha o campo de nome!');
                return;
            }
            
            const userInfoString = localStorage.getItem('userInfo');
            let userInfo = userInfoString ? JSON.parse(userInfoString) : {};
            userInfo.nome = userName;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            updateUserInBackend(userInfo);
        });
    }
    
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Por favor, preencha todos os campos de senha!');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('As novas senhas não coincidem!');
                return;
            }
            
            alert('Solicitação de alteração de senha enviada');
            
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        });
    }
}

function updateUserInBackend(userInfo) {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
        alert('Erro: Usuário não autenticado');
        return;
    }
    
    const userData = {
        nome: userInfo.nome
    };
    
    if (userInfo.id && userInfo.id !== 'null' && userInfo.id !== null) {
        userData.id = userInfo.id;
    }
    
    fetch(`${API_URL}/users`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                let errorMsg = 'Erro ao atualizar usuário';
                try {
                    if (text && text.trim()) {
                        const errorData = JSON.parse(text);
                        if (errorData && errorData.msg) {
                            errorMsg = errorData.msg;
                        }
                    }
                } catch (e) {
                    console.error('Resposta não é um JSON válido:', text);
                }

                throw new Error(errorMsg);
            });
        }
        return response.text().then(text => {
            if (!text || !text.trim()) {
                return { success: true };
            }
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Resposta não é um JSON válido:', text);
                return { success: true };
            }
        });
    })
    .then(data => {
        if (data && data.data && data.data.user) {
            const updatedUserInfo = {
                ...userInfo,
                ...data.data.user
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        }
        
        alert('Nome atualizado com sucesso!');
        const userNameDisplayElements = document.querySelectorAll('.user-name-display');
        if (userNameDisplayElements.length > 0) {
            userNameDisplayElements.forEach(element => {
                element.textContent = userInfo.nome;
            });
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar usuário:', error);
        alert(`Erro: ${error.message}`);
    });
}

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
                
                const userInfoString = localStorage.getItem('userInfo');
                let userInfo = userInfoString ? JSON.parse(userInfoString) : {};
                userInfo.estilo_investidor = profileMapping[profileType] || 'CONSERVADOR';
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                let profileName = '';
                switch(profileType) {
                    case 'conservative':
                        profileName = 'Conservador';
                        break;
                    case 'moderate':
                        profileName = 'Moderado';
                        break;
                    case 'aggressive':
                        profileName = 'Arrojado';
                        break;
                }
                alert(`Perfil de investidor alterado para ${profileName}`);
                updateUserInBackend(userInfo);
            });
        });
    }
}