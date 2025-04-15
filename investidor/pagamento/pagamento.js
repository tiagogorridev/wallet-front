document.addEventListener('DOMContentLoaded', function() {
    const copyPixKeyBtn = document.getElementById('copyPixKey');
    const pixKeyInput = document.querySelector('.pix-key');
    
    if (copyPixKeyBtn) {
      copyPixKeyBtn.addEventListener('click', function() {
        pixKeyInput.select();
        pixKeyInput.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(pixKeyInput.value)
          .then(() => {
            copyPixKeyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyPixKeyBtn.style.backgroundColor = "var(--green)";
            
            setTimeout(() => {
              copyPixKeyBtn.innerHTML = '<i class="fas fa-copy"></i>';
              copyPixKeyBtn.style.backgroundColor = "var(--ambar)";
            }, 2000);
          })
          .catch(() => {
            alert("Não foi possível copiar a chave PIX. Por favor, copie manualmente.");
          });
      });
    }

    const checkPaymentBtn = document.querySelector('.check-payment-btn');
    
    if (checkPaymentBtn) {
      checkPaymentBtn.addEventListener('click', function() {
        const statusChecking = document.querySelector('.status-checking');
        statusChecking.innerHTML = '<div class="spinner"></div><p>Verificando pagamento...</p>';
        
        setTimeout(() => {
          const paymentSuccess = Math.random() < 0.7;
          
          if (paymentSuccess) {
            statusChecking.innerHTML = '<i class="fas fa-check-circle" style="color: var(--green); font-size: 24px;"></i><p style="color: var(--green);">Pagamento confirmado! Redirecionando...</p>';
            
            setTimeout(() => {
              alert("Pagamento confirmado! Você será redirecionado para a página de análise.");
              window.location.href = "/investidor/analise";
            }, 2000);
          } else {
            statusChecking.innerHTML = '<i class="fas fa-exclamation-circle" style="color: var(--ambar); font-size: 24px;"></i><p>Pagamento ainda não identificado. Tente novamente em alguns instantes.</p>';
          }
        }, 3000);
      });
    }
    
    function autoCheckPayment() {
      const paymentSuccess = Math.random() < 0.1;
      
      if (paymentSuccess) {
        const statusChecking = document.querySelector('.status-checking');
        statusChecking.innerHTML = '<i class="fas fa-check-circle" style="color: var(--green); font-size: 24px;"></i><p style="color: var(--green);">Pagamento confirmado! Redirecionando...</p>';
        
        setTimeout(() => {
          alert("Pagamento confirmado! Você será redirecionado para a página de análise.");
          window.location.href = "../carteira-analise/analise.html";
        }, 2000);
        
        return true;
      }
      
      return false;
    }
    
    const paymentCheckInterval = setInterval(() => {
      if (autoCheckPayment()) {
        clearInterval(paymentCheckInterval);
      }
    }, 15000);
  });