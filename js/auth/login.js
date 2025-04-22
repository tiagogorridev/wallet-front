// Arquivo: js/auth/login.js

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('login-message');
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');
    
    // URL do backend (sem http:// no início)
    const API_URL = '191.239.116.115:8080';

    // Toggle para mostrar/esconder a senha
    passwordToggle.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('pi-eye');
            icon.classList.add('pi-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('pi-eye-slash');
            icon.classList.add('pi-eye');
        }
    });

    // Listener do formulário de login
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Obter valores do formulário
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validação básica
        if (!email || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        // Mostrar mensagem de carregamento
        showMessage('Autenticando...', 'info');
        
        // Fazer login
        login(email, password);
    });
    
    // Função de login
    async function login(email, password) {
        try {
            const loginUrl = `http://${API_URL}/auth/login`;
            
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    senha: password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                handleSuccessfulLogin(data);
            } else {
                showMessage(data.msg || 'Falha na autenticação. Verifique suas credenciais.', 'error');
            }
        } catch (error) {
            console.error('Erro durante o login:', error);
            showMessage('Erro ao conectar ao servidor. Tente novamente mais tarde.', 'error');
        }
    }
    
    // Processar login bem-sucedido
    function handleSuccessfulLogin(data) {
        // Obter token da resposta
        let token = null;
        
        if (data.token) {
            token = data.token;
        } else if (data.access_token) {
            token = data.access_token;
        } else if (data.data && data.data.token) {
            token = data.data.token;
        } else if (data.data && data.data.access_token) {
            token = data.data.access_token;
        }
        
        // Obter dados do usuário
        let userData = null;
        if (data.usuario) {
            userData = data.usuario;
        } else if (data.user) {
            userData = data.user;
        } else if (data.data && data.data.usuario) {
            userData = data.data.usuario;
        } else if (data.data && data.data.user) {
            userData = data.data.user;
        }
        
        // Salvar token e dados do usuário
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            console.error("Token não encontrado na resposta");
            showMessage('Token não encontrado na resposta do servidor.', 'error');
            return;
        }
        
        if (userData) {
            localStorage.setItem('userInfo', JSON.stringify(userData));
            
            // Mostrar mensagem de sucesso
            showMessage('Login realizado com sucesso!', 'success');
            
            // Redirecionar após breve delay
            setTimeout(() => {
                redirectUserByProfile(userData.perfil);
            }, 1000);
        } else {
            console.error("Dados do usuário não encontrados na resposta");
            showMessage('Dados do usuário não encontrados na resposta.', 'error');
        }
    }

    // Redirecionar com base no perfil
    function redirectUserByProfile(profile) {
        switch(profile) {
            case 'ADMIN':
                window.location.href = '/html/administrador/dashboard.html';
                break;
            case 'ANALISTA':
                window.location.href = '/html/dashboard.html';
                break;
            case 'USUARIO':
            case 'CONSERVADOR':
            case 'MODERADO':
            case 'ARROJADO':
                window.location.href = '/html/investidor/resumo.html';
                break;
            default:
                showMessage('Tipo de perfil desconhecido: ' + profile, 'error');
                console.error("Perfil desconhecido:", profile);
        }
    }
    
    // Mostrar mensagem de feedback
    function showMessage(message, type) {
        loginMessage.textContent = message;
        loginMessage.className = 'feedback-message ' + type;
        
        if (type === 'error') {
            loginMessage.style.color = '#c62828';
        } else if (type === 'success') {
            loginMessage.style.color = '#2e7d32';
        } else if (type === 'info') {
            loginMessage.style.color = '#1565c0';
        }
    }
});