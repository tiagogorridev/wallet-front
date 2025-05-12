document.addEventListener('DOMContentLoaded', () => {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const highlightCheck = document.getElementById('highlight');
    const previewBtn = document.querySelector('.btn-preview');
    const submitBtn = document.querySelector('.btn-submit');
    const newsList = document.querySelector('.news-list');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.textContent.toLowerCase();
            const newsItems = document.querySelectorAll('.news-item');
            
            newsItems.forEach(item => {
                const category = item.querySelector('.news-category').textContent.toLowerCase();
                item.style.display = filter === 'todas' || category.includes(filter) ? 'block' : 'none';
            });
        });
    });
    
    submitBtn.addEventListener('click', () => {
        if (!titleInput.value || !contentInput.value) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const currentDate = new Date().toLocaleDateString('pt-BR');
        const selectedCategory = document.querySelector('.category-btn.active').textContent;
        
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <div class="news-header">
                <h3 class="news-title">${titleInput.value}</h3>
                <span class="news-category">${selectedCategory}</span>
            </div>
            <p class="news-content">${contentInput.value}</p>
            <div class="news-footer">
                <span>Publicado em: ${currentDate}</span>
                <div class="news-actions">
                    <button class="action-btn">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
        
        newsList.insertBefore(newsItem, newsList.firstChild);
        
        titleInput.value = '';
        contentInput.value = '';
        highlightCheck.checked = false;
        
        setupActionButtons(newsItem);
    });
    
    previewBtn.addEventListener('click', () => {
        if (!titleInput.value || !contentInput.value) {
            alert('Por favor, preencha todos os campos para visualização.');
            return;
        }
        
        const selectedCategory = document.querySelector('.category-btn.active').textContent;
        alert(`Prévia: ${titleInput.value}\nCategoria: ${selectedCategory}\n\n${contentInput.value}`);
    });
    
    function setupActionButtons(newsItem) {
        const editBtn = newsItem.querySelector('.fa-edit').parentElement;
        const deleteBtn = newsItem.querySelector('.fa-trash').parentElement;
        
        editBtn.addEventListener('click', () => {
            const title = newsItem.querySelector('.news-title').textContent;
            const content = newsItem.querySelector('.news-content').textContent;
            const category = newsItem.querySelector('.news-category').textContent;
            
            titleInput.value = title;
            contentInput.value = content;
            
            categoryBtns.forEach(btn => {
                btn.classList.toggle('active', btn.textContent === category);
            });
            
            newsItem.remove();
        });
        
        deleteBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir esta publicação?')) {
                newsItem.remove();
            }
        });
    }
    
    document.querySelectorAll('.news-item').forEach(setupActionButtons);
});