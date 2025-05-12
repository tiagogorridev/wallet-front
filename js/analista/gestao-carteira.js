document.addEventListener('DOMContentLoaded', () => {
    console.log('Script de gestão de carteiras carregado');
    
    const searchInput = document.getElementById('searchInput');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    const portfolioCountElement = document.getElementById('portfolioCount');
    
    if (searchInput) {
        console.log('Campo de busca encontrado');
        searchInput.addEventListener('input', () => {
            console.log('Pesquisando:', searchInput.value);
            
            const query = searchInput.value.toLowerCase().trim();
            let visibleCount = 0;
            portfolioCards.forEach(card => {
                const cardContent = card.textContent.toLowerCase();
                const isVisible = cardContent.includes(query);
                card.style.display = isVisible ? 'block' : 'none';
                
                if (isVisible) {
                    visibleCount++;
                }
            });
            
            if (portfolioCountElement) {
                portfolioCountElement.textContent = `${visibleCount} carteiras`;
            }
            
            console.log(`Carteiras visíveis: ${visibleCount}`);
        });
    } else {
        console.error('Campo de busca não encontrado!');
    }
    
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.portfolio-card');
            
            if (card) {
                const portfolioName = card.querySelector('h3').textContent;
                const clientName = card.querySelector('.cliente').textContent.replace('person', '').trim();
                const portfolioValue = card.querySelector('.valor').textContent;
                
                console.log(`Detalhes da carteira: ${portfolioName} - ${clientName}`);
                alert(`Detalhes da carteira "${portfolioName}" do cliente ${clientName} serão exibidos.`);
            }
        });
    });
    
    document.querySelectorAll('.action-btn .fa-pen').forEach(icon => {
        const btn = icon.parentElement;
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const card = this.closest('.portfolio-card');
            
            if (card) {
                const portfolioName = card.querySelector('h3').textContent;
                
                console.log(`Editando carteira: ${portfolioName}`);
                alert(`Editar carteira: ${portfolioName}`);
            }
        });
    });
});