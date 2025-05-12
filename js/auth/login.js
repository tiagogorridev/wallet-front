document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('login-message');
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');
    const API_URL = '191.239.116.115:8080';

    passwordToggle.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('pi-eye', 'pi-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('pi-eye-slash', 'pi-eye');
        }
    });

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        showMessage('Autenticando...', 'info');
        login(email, password);
    });
    
    async function login(email, password) {
        try {
            const response = await fetch(`http://${API_URL}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
    
    function handleSuccessfulLogin(data) {
        const token = data.token || data.access_token || 
                    (data.data && (data.data.token || data.data.access_token));
        
        const userData = data.usuario || data.user || 
                       (data.data && (data.data.usuario || data.data.user));
        
        if (!token) {
            console.error("Token não encontrado na resposta");
            showMessage('Token não encontrado na resposta do servidor.', 'error');
            return;
        }
        
        localStorage.setItem('accessToken', token);
        
        if (userData) {
            localStorage.setItem('userInfo', JSON.stringify(userData));
            showMessage('Login realizado com sucesso!', 'success');
            setTimeout(() => redirectUserByProfile(userData.perfil), 1000);
        } else {
            console.error("Dados do usuário não encontrados na resposta");
            showMessage('Dados do usuário não encontrados na resposta.', 'error');
        }
    }

    function redirectUserByProfile(profile) {
        const routes = {
            'ADMIN': '../../html/administrador/dashboard.html',
            'ANALISTA': '../../html/analista/dashboard-analista.html',
            'USUARIO': '../../html/investidor/resumo.html',
        };
        
        const route = routes[profile];
        if (route) {
            window.location.href = route;
        } else {
            showMessage('Tipo de perfil desconhecido: ' + profile, 'error');
            console.error("Perfil desconhecido:", profile);
        }
    }
    
    function showMessage(message, type) {
        loginMessage.textContent = message;
        loginMessage.className = 'feedback-message ' + type;
        
        const colors = {
            'error': '#c62828',
            'success': '#2e7d32',
            'info': '#1565c0'
        };
        
        loginMessage.style.color = colors[type] || '';
    }
});