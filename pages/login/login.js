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

  loginForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!email || !password) {
          showMessage('Por favor, preencha todos os campos.', true);
          return;
      }

      try {
          const loginData = {
              email: email,
              password: password
          };

          const requestOptions = {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(loginData)
          };

          const apiUrl = 'http://localhost:8080/api/auth/login';

          showMessage('Autenticando...');

          const response = await fetch(apiUrl, requestOptions);

          if (response.ok) {
              const data = await response.json();

              localStorage.setItem('authToken', data.token);
              localStorage.setItem('userData', JSON.stringify(data.user));

              showMessage('Login realizado com sucesso!');

              setTimeout(() => {
                  window.location.href = '../dashboard/dashboard.html';
              }, 1000);
          } else {
              const errorData = await response.json();
              showMessage(errorData.message || 'Falha na autenticação. Verifique suas credenciais.', true);
          }
      } catch (error) {
          console.error('Erro ao conectar com o servidor:', error);
          showMessage('Erro ao conectar com o servidor. Tente novamente mais tarde.', true);
      }
  });
});
