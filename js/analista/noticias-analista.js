document.addEventListener('DOMContentLoaded', () => {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const submitBtn = document.querySelector('.btn-submit');
    const newsList = document.querySelector('.news-list');
    let editingNewsId = null;

    // Load initial news
    loadNews();

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

            const filter = btn.textContent.trim().toLowerCase();
            const newsItems = document.querySelectorAll('.news-item');

            newsItems.forEach(item => {
                const category = item.querySelector('.news-category').textContent.trim().toLowerCase();
                let shouldShow = false;

                if (filter === 'todas') {
                    shouldShow = true;
                } else if (filter === 'ação' && category === 'acao') {
                    shouldShow = true;
                } else if (filter === category) {
                    shouldShow = true;
                }

                item.style.display = shouldShow ? 'block' : 'none';
            });
        });
    });

    submitBtn.addEventListener('click', async () => {
        if (!titleInput.value || !contentInput.value) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const selectedCategory = document.querySelector('.category-btn.active').textContent.toLowerCase();
        const newsData = {
            titulo: titleInput.value,
            conteudo: contentInput.value,
            categoria: selectedCategory === 'ação' ? 'acao' : selectedCategory
        };

        try {
            if (editingNewsId) {
                console.log('Updating news with ID:', editingNewsId);
                console.log('Update data:', newsData);

                try {
                    // Verificar se o ID é um número
                    const newsId = parseInt(editingNewsId);
                    if (isNaN(newsId)) {
                        throw new Error('ID da notícia inválido');
                    }

                    console.log('Sending update request with ID:', newsId);
                    console.log('Data being sent:', JSON.stringify(newsData, null, 2));

                    const response = await APIService.updateNews(newsId, newsData);
                    console.log('Update response:', response);

                    if (response.error) {
                        throw new Error(response.msg || 'Erro ao atualizar notícia');
                    }

                    alert('Notícia atualizada com sucesso!');
                    await loadNews();
                    clearForm();
                } catch (error) {
                    console.error('Error updating news:', error);
                    alert(`Erro ao atualizar a notícia: ${error.message}`);
                }
            } else {
                const response = await APIService.addNews(newsData);
                console.log('Add response:', response);

                if (response.error) {
                    throw new Error(response.msg || 'Erro ao adicionar notícia');
                }

                alert('Notícia publicada com sucesso!');
                await loadNews();
                clearForm();
            }
        } catch (error) {
            console.error('Error saving news:', error);
            alert(`Erro ao salvar a notícia: ${error.message}`);
        }
    });

    async function loadNews() {
        try {
            newsList.innerHTML = '<div class="loading">Carregando notícias...</div>';
            const response = await APIService.getNews();
            const news = Array.isArray(response.data.data) ? response.data.data : [];
            console.log(news);

            if (news.length === 0) {
                newsList.innerHTML = '<div class="empty-state">Nenhuma notícia publicada ainda.</div>';
                return;
            }

            newsList.innerHTML = '';
            news.forEach(newsItem => {
                const newsElement = createNewsElement(newsItem);
                newsList.appendChild(newsElement);
            });
        } catch (error) {
            newsList.innerHTML = '<div class="error-state">Erro ao carregar notícias. Por favor, tente novamente.</div>';
            console.error('Error loading news:', error);
        }
    }

    function createNewsElement(newsItem) {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        newsElement.dataset.id = newsItem.id;

        // Formatar a categoria para exibição
        let displayCategory = newsItem.categoria;
        if (displayCategory === 'acao') {
            displayCategory = 'Ação';
        } else if (displayCategory === 'crypto') {
            displayCategory = 'Crypto';
        }

        newsElement.innerHTML = `
            <div class="news-header">
                <h3 class="news-title">${newsItem.titulo}</h3>
                <span class="news-category">${displayCategory}</span>
            </div>
            <p class="news-content">${newsItem.conteudo}</p>
            <div class="news-footer">
                <div class="news-actions">
                    <button class="action-btn edit-btn">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn delete-btn">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;

        setupActionButtons(newsElement, newsItem);
        return newsElement;
    }

    function setupActionButtons(newsElement, newsItem) {
        const editBtn = newsElement.querySelector('.edit-btn');
        const deleteBtn = newsElement.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => {
            console.log('Editing news item:', newsItem);
            if (!newsItem.id) {
                alert('Erro: ID da notícia não encontrado');
                return;
            }
            editingNewsId = newsItem.id;
            titleInput.value = newsItem.titulo;
            contentInput.value = newsItem.conteudo;

            categoryBtns.forEach(btn => {
                const btnCategory = btn.textContent.toLowerCase();
                const newsCategory = newsItem.categoria.toLowerCase();
                btn.classList.toggle('active', btnCategory === newsCategory ||
                    (btnCategory === 'ação' && newsCategory === 'acao'));
            });

            submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        deleteBtn.addEventListener('click', async () => {
            console.log('Delete button clicked for news:', newsItem);
            if (!newsItem.id) {
                console.error('News ID is missing:', newsItem);
                alert('Erro: ID da notícia não encontrado');
                return;
            }

            if (confirm('Tem certeza que deseja excluir esta publicação?')) {
                try {
                    console.log('Attempting to delete news with ID:', newsItem.id);
                    const response = await APIService.deleteNews(newsItem.id);
                    console.log('Delete response:', response);
                    await loadNews();
                    alert('Notícia excluída com sucesso!');
                } catch (error) {
                    console.error('Error details:', error);
                    alert('Erro ao excluir a notícia. Por favor, tente novamente.');
                }
            }
        });
    }

    function clearForm() {
        titleInput.value = '';
        contentInput.value = '';
        editingNewsId = null;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar';
        categoryBtns[0].click();
    }
});

