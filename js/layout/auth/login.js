const API_URL = '191.239.116.115:8080';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('login-message');
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordField = document.getElementById('password');
    passwordToggle.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('pi-eye');
            icon.classList.add('pi-eye-slash');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('pi-eye-slash');
            icon.classList.add('pi-eye');
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
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
            const loginUrl = `http://${API_URL}/auth/login`;
            console.log("API URL being used:", loginUrl);
            
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
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
            console.error('Error during login:', error);
            showMessage('Erro ao conectar ao servidor. Tente novamente mais tarde.', 'error');
        }
    }
function handleSuccessfulLogin(data) {
    console.log("Full login response:", data);
    if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
    } else if (data.token) {
        localStorage.setItem('accessToken', data.token);
        console.log("Found token instead of access_token");
    }
    
    let userData = null;
    if (data.usuario) {
        userData = data.usuario;
        console.log("Found user data in data.usuario");
    } else if (data.user) {
        userData = data.user;
        console.log("Found user data in data.user");
    } else if (data.data && data.data.usuario) {
        userData = data.data.usuario;
        console.log("Found user data in data.data.usuario");
    } else if (data.data) {
        userData = data.data;
        console.log("Using data.data as user data");
    }
    
    if (userData) {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        console.log("Redirecting based on profile:", userData.perfil);
        redirectUserByProfile(userData.perfil);
    } else {
        console.error("User data not found in API response:", data);
        showMessage('Dados do usuário não encontrados na resposta.', 'error');
    }
}
    
function redirectUserByProfile(profile) {
    console.log("Redirecting with profile:", profile);
    switch(profile) {
        case 'ADMIN':
            console.log("Redirecting to admin dashboard");
            window.location.href = 'http://127.0.0.1:5500/html/administrador/dashboard.html';
            break;
        case 'ANALISTA':
            console.log("Redirecting to admin summary");
            window.location.href = 'http://127.0.0.1:5500/html/dashboard.html';
            break;
        case 'USUARIO':
            console.log("Redirecting to investor summary");
            window.location.href = 'http://127.0.0.1:5500/html/investidor/resumo.html';
            break;
        default:
            console.log("Unknown profile type:", profile);
            showMessage('Tipo de perfil desconhecido: ' + profile, 'error');
    }
}
    function showMessage(message, type) {
        loginMessage.textContent = message;
        loginMessage.className = type;
        loginMessage.style.display = 'block';
        loginMessage.style.padding = '10px';
        loginMessage.style.marginTop = '15px';
        loginMessage.style.borderRadius = '4px';
        
        if (type === 'error') {
            loginMessage.style.backgroundColor = '#ffebee';
            loginMessage.style.color = '#c62828';
            loginMessage.style.border = '1px solid #ef9a9a';
        } else if (type === 'success') {
            loginMessage.style.backgroundColor = '#e8f5e9';
            loginMessage.style.color = '#2e7d32';
            loginMessage.style.border = '1px solid #a5d6a7';
        } else if (type === 'info') {
            loginMessage.style.backgroundColor = '#e3f2fd';
            loginMessage.style.color = '#1565c0';
            loginMessage.style.border = '1px solid #90caf9';
        }
    }
});