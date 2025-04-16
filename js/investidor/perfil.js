document.addEventListener('DOMContentLoaded', function() {
    initPasswordToggle();
    initProfileFromTest();
    initPasswordStrength();
    initSaveButtons();
    initInvestorProfiles();
    initProfileFromTest();
});

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

function initProfileFromTest() {
    const savedProfile = localStorage.getItem('investorProfile');
    if (savedProfile) {
        const profileOptions = document.querySelectorAll('.profile-option');
        profileOptions.forEach(option => {
            if (option.getAttribute('data-profile') === savedProfile) {
                profileOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            }
        });
    }
}

function initPasswordStrength() {
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const strengthBar = document.getElementById('password-strength');
    const strengthText = document.getElementById('password-strength-text');
    
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');

    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        
        updateRequirement(reqLength, hasLength);
        updateRequirement(reqUppercase, hasUppercase);
        updateRequirement(reqLowercase, hasLowercase);
        updateRequirement(reqNumber, hasNumber);
        updateRequirement(reqSpecial, hasSpecial);
        
        let strength = 0;
        if (hasLength) strength += 20;
        if (hasUppercase) strength += 20;
        if (hasLowercase) strength += 20;
        if (hasNumber) strength += 20;
        if (hasSpecial) strength += 20;
        
        strengthBar.style.width = strength + '%';
        
        if (strength <= 20) {
            strengthBar.style.backgroundColor = 'var(--red)';
            strengthText.textContent = 'Muito fraca';
            strengthText.style.color = 'var(--red)';
        } else if (strength <= 40) {
            strengthBar.style.backgroundColor = 'var(--red)';
            strengthText.textContent = 'Fraca';
            strengthText.style.color = 'var(--red)';
        } else if (strength <= 60) {
            strengthBar.style.backgroundColor = 'var(--ambar)';
            strengthText.textContent = 'Média';
            strengthText.style.color = 'var(--ambar)';
        } else if (strength <= 80) {
            strengthBar.style.backgroundColor = 'var(--green)';
            strengthText.textContent = 'Forte';
            strengthText.style.color = 'var(--green)';
        } else {
            strengthBar.style.backgroundColor = 'var(--green)';
            strengthText.textContent = 'Muito forte';
            strengthText.style.color = 'var(--green)';
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        const password = newPasswordInput.value;
        const confirmPassword = this.value;
        
        if (password === confirmPassword) {
            this.style.borderColor = 'var(--green)';
        } else {
            this.style.borderColor = 'var(--red)';
        }
    });
}

function updateRequirement(element, isValid) {
    const icon = element.querySelector('i');
    
    if (isValid) {
        element.classList.add('valid');
        icon.classList.remove('fa-times-circle');
        icon.classList.add('fa-check-circle');
    } else {
        element.classList.remove('valid');
        icon.classList.remove('fa-check-circle');
        icon.classList.add('fa-times-circle');
    }
}

function initSaveButtons() {
    const savePersonalDataBtn = document.getElementById('save-personal-data');
    if (savePersonalDataBtn) {
        savePersonalDataBtn.addEventListener('click', function() {
            const userName = document.getElementById('user-name').value;
            const userEmail = document.getElementById('user-email').value;
            
            if (!userName || !userEmail) {
                alert('Por favor, preencha todos os campos!');
                return;
            }
            
            if (!validateEmail(userEmail)) {
                alert('Por favor, insira um e-mail válido!');
                return;
            }
            
            alert('Dados pessoais atualizados com sucesso!');
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
            
            if (!validatePasswordStrength(newPassword)) {
                alert('Sua nova senha não atende aos requisitos de segurança!');
                return;
            }
            
            if (currentPassword === 'senha123') {
                alert('Senha alterada com sucesso!');
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            } else {
                alert('Senha atual incorreta!');
            }
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePasswordStrength(password) {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
}

function initInvestorProfiles() {
    const profileOptions = document.querySelectorAll('.profile-option');
    if (profileOptions.length > 0) {
        profileOptions.forEach(option => {
            option.addEventListener('click', function() {
                profileOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                const profileType = this.getAttribute('data-profile');
                localStorage.setItem('investorProfile', profileType);
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