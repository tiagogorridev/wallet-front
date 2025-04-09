document.addEventListener('DOMContentLoaded', function() {
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordField = document.getElementById('password');
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('login-message');

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

    fetch('http://127.0.0.1:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Credenciais inválidas.');
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('emailUsuario', email);
        window.location.href = `http://127.0.0.1:5500/investidor/carteira/carteira-resumo/carteira-resumo.html?email=${encodeURIComponent(email)}`;
    })
    .catch(error => {
        console.error('Erro no login:', error);
        showMessage('Email ou senha inválidos.', true);
    });
});
});
