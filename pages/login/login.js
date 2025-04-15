document.addEventListener('DOMContentLoaded', function() {
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordField = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('login-message');
    const API_URL = '191.239.116.115:8080';
  
    passwordToggle.addEventListener('click', function() {
        const icon = passwordToggle.querySelector('i');
  
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
  
    function showMessage(message, isError = false) {
        loginMessage.textContent = message;
        loginMessage.className = isError ? 'message-error' : 'message-success';
        loginMessage.style.display = 'block';
  
        setTimeout(() => {
            loginMessage.style.display = 'none';
        }, 5000);
    }

    function saveTokens(accessToken, refreshToken) {
      localStorage.setItem('access_token', accessToken);
      console.log("Token de acesso salvo:", accessToken);
    }
  
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      if (!email || !password) {
          showMessage('Por favor, preencha todos os campos.', true);
          return;
      }
  
      const loginData = {
          email: email,
          senha: password
      };
  
      console.log("Dados de login sendo enviados:", loginData);
  
      fetch(`http://${API_URL}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData),
      })
      .then(response => {
          console.log("Status da resposta:", response.status);
          if (!response.ok) {
              throw new Error('Credenciais inválidas.');
          }
          return response.json();
      })
      .then(data => {
        console.log("Resposta do login:", data);
        
        const accessToken = data.data?.accessToken || data.data?.access_token || data.accessToken || data.access_token;
        const userRole = data.data?.role || data.data?.tipo || data.role || data.tipo || 'usuario'; // Obtém o papel/tipo do usuário
        
        saveTokens(accessToken);
        localStorage.setItem('emailUsuario', email);
        localStorage.setItem('userRole', userRole); // Salva o papel do usuário no localStorage
        
        showMessage('Login realizado com sucesso!', false);
        
        // Verifica o tipo de usuário e redireciona para a página correta
        redirectUserBasedOnRole(userRole, email);
      })
      .catch(error => {
          console.error('Erro:', error);
          showMessage('Email ou senha inválidos.', true);
      });
    });
    
    // Função para redirecionar o usuário com base no seu papel/tipo
    function redirectUserBasedOnRole(role, email) {
        console.log('Redirecionando usuário com papel:', role);
        
        if (role.toLowerCase() === 'administrador' || role.toLowerCase() === 'admin') {
            // Redirecionar para a página de administrador
            window.location.href = 'http://127.0.0.1:5500/administrador/resumo-administrador.html?email=';
        } else {
            // Redirecionar para a página de usuário comum
            window.location.href = 'http://127.0.0.1:5500/investidor/carteira-resumo/resumo.html?email=';
        }
    }
});