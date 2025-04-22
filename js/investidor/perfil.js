document.addEventListener('DOMContentLoaded', function() {
    initPasswordToggle();
    loadUserData();
    initSaveButtons();
    initInvestorProfiles();
});

function loadUserData() {
    // Carregar dados do usuário a partir do localStorage
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        
        // Preencher os campos do formulário com os dados do usuário
        if (userInfo.nome) {
            document.getElementById('user-name').value = userInfo.nome;
        }
        
        if (userInfo.email) {
            document.getElementById('user-email').value = userInfo.email;
        }
        
        // Selecionar o perfil de investidor correto
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
            
            // Obter os dados atuais do usuário
            const userInfoString = localStorage.getItem('userInfo');
            let userInfo = userInfoString ? JSON.parse(userInfoString) : {};
            
            // Atualizar apenas o nome
            userInfo.nome = userName;
            
            // Salvar de volta no localStorage
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            alert('Nome atualizado com sucesso!');
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
            
            // Enviar requisição para alterar a senha (simulação)
            alert('Solicitação de alteração de senha enviada');
            
            // Limpar os campos
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        });
    }
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
                
                // Obter os dados atuais do usuário
                const userInfoString = localStorage.getItem('userInfo');
                let userInfo = userInfoString ? JSON.parse(userInfoString) : {};
                
                // Atualizar o estilo de investidor
                userInfo.estilo_investidor = profileMapping[profileType] || 'CONSERVADOR';
                
                // Salvar de volta no localStorage
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
            });
        });
    }
}