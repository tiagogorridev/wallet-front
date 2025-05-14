document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const newsList = document.querySelector('.news-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('news-search');
    const searchButton = document.querySelector('.search-btn');
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    const pageNumbers = document.querySelectorAll('.page-number');
    const newsModal = document.getElementById('news-modal');
    const closeModal = document.querySelector('.close-modal');

    // Estado da aplicação
    let currentFilter = 'all';
    let currentPage = 1;
    let itemsPerPage = 4;
    let newsItems = Array.from(document.querySelectorAll('.news-item'));

    // Função para filtrar notícias
    function filterNews(category) {
        currentFilter = category;
        currentPage = 1;
        updateNewsDisplay();
        updatePagination();
    }

    // Função para buscar notícias
    function searchNews(query) {
        const searchTerm = query.toLowerCase();
        newsItems.forEach(item => {
            const title = item.querySelector('.news-title').textContent.toLowerCase();
            const content = item.querySelector('.news-content').textContent.toLowerCase();
            const matchesSearch = title.includes(searchTerm) || content.includes(searchTerm);
            const matchesFilter = currentFilter === 'all' || item.dataset.category === currentFilter;
            item.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
        });
    }

    // Função para atualizar a exibição das notícias
    function updateNewsDisplay() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        newsItems.forEach((item, index) => {
            const matchesFilter = currentFilter === 'all' || item.dataset.category === currentFilter;
            const isInCurrentPage = index >= startIndex && index < endIndex;
            item.style.display = matchesFilter && isInCurrentPage ? 'block' : 'none';
        });
    }

    // Função para atualizar a paginação
    function updatePagination() {
        const filteredItems = newsItems.filter(item =>
            currentFilter === 'all' || item.dataset.category === currentFilter
        );
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

        // Atualiza os números das páginas
        pageNumbers.forEach((number, index) => {
            number.style.display = index < totalPages ? 'inline-block' : 'none';
            number.classList.toggle('active', index + 1 === currentPage);
        });

        // Atualiza os botões de navegação
        paginationButtons[0].disabled = currentPage === 1;
        paginationButtons[1].disabled = currentPage === totalPages;
    }

    // Função para abrir o modal com a notícia
    function openNewsModal(newsItem) {
        const title = newsItem.querySelector('.news-title').textContent;
        const category = newsItem.querySelector('.news-category').textContent;
        const content = newsItem.querySelector('.news-content').textContent;
        const date = newsItem.querySelector('.news-footer span').textContent;

        const modalTitle = newsModal.querySelector('.modal-title');
        const modalCategory = newsModal.querySelector('.modal-category');
        const modalText = newsModal.querySelector('.modal-text');
        const modalDate = newsModal.querySelector('.modal-date');

        modalTitle.textContent = title;
        modalCategory.textContent = category;
        modalCategory.className = `modal-category ${category.toLowerCase()}`;
        modalText.textContent = content;
        modalDate.textContent = date;

        newsModal.style.display = 'flex';
    }

    // Event Listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterNews(button.dataset.filter);
        });
    });

    searchButton.addEventListener('click', () => {
        searchNews(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchNews(searchInput.value);
        }
    });

    paginationButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            if (index === 0 && currentPage > 1) {
                currentPage--;
            } else if (index === 1) {
                const filteredItems = newsItems.filter(item =>
                    currentFilter === 'all' || item.dataset.category === currentFilter
                );
                const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                }
            }
            updateNewsDisplay();
            updatePagination();
        });
    });

    pageNumbers.forEach((number, index) => {
        number.addEventListener('click', () => {
            currentPage = index + 1;
            updateNewsDisplay();
            updatePagination();
        });
    });

    newsItems.forEach(item => {
        item.addEventListener('click', () => {
            openNewsModal(item);
        });
    });

    closeModal.addEventListener('click', () => {
        newsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === newsModal) {
            newsModal.style.display = 'none';
        }
    });

    // Inicialização
    updateNewsDisplay();
    updatePagination();
});
