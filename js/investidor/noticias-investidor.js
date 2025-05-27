document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const newsList = document.querySelector('.news-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('news-search');
    const searchButton = document.querySelector('.search-btn');
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    const pageNumbers = document.querySelectorAll('.page-number');
    const newsModal = document.getElementById('news-modal');
    const closeModal = document.querySelector('.close-modal');

    // Application state
    let currentFilter = 'all';
    let currentPage = 1;
    let itemsPerPage = 4;
    let allNews = [];
    let filteredNews = [];

    // Load initial news
    loadNews();

    // Filter news function
    function filterNews(category) {
        currentFilter = category;
        currentPage = 1;
        updateNewsDisplay();
        updatePagination();
    }

    // Search news function
    function searchNews(query) {
        const searchTerm = query.toLowerCase();
        filteredNews = allNews.filter(item => {
            const title = item.title.toLowerCase();
            const content = item.content.toLowerCase();
            const matchesSearch = title.includes(searchTerm) || content.includes(searchTerm);
            const matchesFilter = currentFilter === 'all' || item.category.toLowerCase() === currentFilter;
            return matchesSearch && matchesFilter;
        });
        currentPage = 1;
        updateNewsDisplay();
        updatePagination();
    }

    // Update news display
    function updateNewsDisplay() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newsToShow = filteredNews.slice(startIndex, endIndex);

        newsList.innerHTML = '';
        if (newsToShow.length === 0) {
            newsList.innerHTML = '<div class="empty-state">Nenhuma notícia encontrada.</div>';
            return;
        }

        newsToShow.forEach(newsItem => {
            const newsElement = createNewsElement(newsItem);
            newsList.appendChild(newsElement);
        });
    }

    // Create news element
    function createNewsElement(newsItem) {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        newsElement.dataset.category = newsItem.category.toLowerCase();
        newsElement.innerHTML = `
            <div class="news-header">
                <h3 class="news-title">${newsItem.title}</h3>
                <span class="news-category ${newsItem.category.toLowerCase()}">${newsItem.category}</span>
            </div>
            <p class="news-content">${newsItem.content}</p>
            <div class="news-footer">
                <span>Publicado em: ${new Date(newsItem.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
        `;

        newsElement.addEventListener('click', () => openNewsModal(newsItem));
        return newsElement;
    }

    // Update pagination
    function updatePagination() {
        const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
        const pageNumbersContainer = document.querySelector('.page-numbers');

        pageNumbersContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageNumber = document.createElement('span');
            pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageNumber.innerHTML = `<span>${i}</span>`;
            pageNumber.addEventListener('click', () => {
                currentPage = i;
                updateNewsDisplay();
                updatePagination();
            });
            pageNumbersContainer.appendChild(pageNumber);
        }

        // Update pagination buttons
        const prevButton = document.querySelector('.pagination-btn.prev');
        const nextButton = document.querySelector('.pagination-btn.next');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    }

    // Load news from API
    async function loadNews() {
        try {
            newsList.innerHTML = '<div class="loading">Carregando notícias...</div>';
            allNews = await APIService.getNews();
            filteredNews = [...allNews];
            updateNewsDisplay();
            updatePagination();
        } catch (error) {
            newsList.innerHTML = '<div class="error-state">Erro ao carregar notícias. Por favor, tente novamente.</div>';
            console.error('Error loading news:', error);
        }
    }

    // Open news modal
    function openNewsModal(newsItem) {
        const modalTitle = newsModal.querySelector('.modal-title');
        const modalCategory = newsModal.querySelector('.modal-category');
        const modalText = newsModal.querySelector('.modal-text');
        const modalDate = newsModal.querySelector('.modal-date');

        modalTitle.textContent = newsItem.title;
        modalCategory.textContent = newsItem.category;
        modalCategory.className = `modal-category ${newsItem.category.toLowerCase()}`;
        modalText.textContent = newsItem.content;
        modalDate.textContent = `Publicado em: ${new Date(newsItem.createdAt).toLocaleDateString('pt-BR')}`;

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

    // Pagination button events
    document.querySelector('.pagination-btn.prev').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateNewsDisplay();
            updatePagination();
        }
    });

    document.querySelector('.pagination-btn.next').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateNewsDisplay();
            updatePagination();
        }
    });

    // Modal close event
    closeModal.addEventListener('click', () => {
        newsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === newsModal) {
            newsModal.style.display = 'none';
        }
    });
});
