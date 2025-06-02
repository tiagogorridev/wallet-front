document.addEventListener("DOMContentLoaded", function () {
  // ELEMENTOS DOM
  const newsList = document.querySelector(".news-list");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("news-search");
  const searchButton = document.querySelector(".search-btn");
  const newsModal = document.getElementById("news-modal");
  const closeModal = document.querySelector(".close-modal");

  // ESTADO DA APLICAÇÃO
  let currentFilter = "all";
  let currentPage = 1;
  let itemsPerPage = 4;
  let allNews = [];
  let filteredNews = [];

  // INICIALIZAÇÃO
  loadNews();

  // FILTRAR NOTÍCIAS
  function filterNews(category) {
    currentFilter = category;
    currentPage = 1;
    filteredNews =
      category === "all"
        ? [...allNews]
        : allNews.filter((item) => item.categoria.toLowerCase() === category);
    updateNewsDisplay();
    updatePagination();
  }

  // BUSCAR NOTÍCIAS
  function searchNews(query) {
    const searchTerm = query.toLowerCase();
    filteredNews = allNews.filter((item) => {
      const matchesSearch =
        item.titulo.toLowerCase().includes(searchTerm) ||
        item.conteudo.toLowerCase().includes(searchTerm);
      const matchesFilter =
        currentFilter === "all" ||
        item.categoria.toLowerCase() === currentFilter;
      return matchesSearch && matchesFilter;
    });
    currentPage = 1;
    updateNewsDisplay();
    updatePagination();
  }

  // ATUALIZAR EXIBIÇÃO DAS NOTÍCIAS
  function updateNewsDisplay() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const newsToShow = filteredNews.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    newsList.innerHTML = "";
    if (newsToShow.length === 0) {
      newsList.innerHTML =
        '<div class="empty-state">Nenhuma notícia encontrada.</div>';
      return;
    }

    newsToShow.forEach((newsItem) => {
      const newsElement = createNewsElement(newsItem);
      newsList.appendChild(newsElement);
    });
  }

  // CRIAR ELEMENTO DE NOTÍCIA
  function createNewsElement(newsItem) {
    const newsElement = document.createElement("div");
    newsElement.className = "news-item";
    newsElement.dataset.category = newsItem.categoria.toLowerCase();

    let displayCategory =
      newsItem.categoria === "acao"
        ? "Ação"
        : newsItem.categoria === "crypto"
        ? "Crypto"
        : newsItem.categoria;

    newsElement.innerHTML = `
            <div class="news-header">
                <h3 class="news-title">${newsItem.titulo}</h3>
                <span class="news-category ${newsItem.categoria.toLowerCase()}">${displayCategory}</span>
            </div>
            <p class="news-content">${newsItem.conteudo}</p>
        `;

    newsElement.addEventListener("click", () => openNewsModal(newsItem));
    return newsElement;
  }

  // ATUALIZAR PAGINAÇÃO
  function updatePagination() {
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const pageNumbersContainer = document.querySelector(".page-numbers");

    pageNumbersContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const pageNumber = document.createElement("span");
      pageNumber.className = `page-number ${i === currentPage ? "active" : ""}`;
      pageNumber.innerHTML = `<span>${i}</span>`;
      pageNumber.addEventListener("click", () => {
        currentPage = i;
        updateNewsDisplay();
        updatePagination();
      });
      pageNumbersContainer.appendChild(pageNumber);
    }

    const prevButton = document.querySelector(".pagination-btn.prev");
    const nextButton = document.querySelector(".pagination-btn.next");
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  }

  // CARREGAR NOTÍCIAS DA API
  async function loadNews() {
    try {
      newsList.innerHTML = '<div class="loading">Carregando notícias...</div>';
      const response = await APIService.getNews();

      if (response?.data?.data && Array.isArray(response.data.data)) {
        allNews = response.data.data;
        filteredNews = [...allNews];
        updateNewsDisplay();
        updatePagination();
      } else {
        throw new Error("Formato de dados inválido");
      }
    } catch (error) {
      newsList.innerHTML =
        '<div class="error-state">Erro ao carregar notícias. Por favor, tente novamente.</div>';
      console.error("Error loading news:", error);
    }
  }

  // ABRIR MODAL DA NOTÍCIA
  function openNewsModal(newsItem) {
    const modalTitle = newsModal.querySelector(".modal-title");
    const modalCategory = newsModal.querySelector(".modal-category");
    const modalText = newsModal.querySelector(".modal-text");

    const displayCategory =
      newsItem.categoria === "acao"
        ? "Ação"
        : newsItem.categoria === "crypto"
        ? "Crypto"
        : newsItem.categoria;

    modalTitle.textContent = newsItem.titulo;
    modalCategory.textContent = displayCategory;
    modalCategory.className = `modal-category ${newsItem.categoria.toLowerCase()}`;
    modalText.textContent = newsItem.conteudo;
    newsModal.style.display = "flex";
  }

  // EVENT LISTENERS - FILTROS
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      filterNews(button.dataset.filter);
    });
  });

  // EVENT LISTENERS - BUSCA
  searchButton.addEventListener("click", () => searchNews(searchInput.value));
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchNews(searchInput.value);
  });

  // EVENT LISTENERS - PAGINAÇÃO
  document
    .querySelector(".pagination-btn.prev")
    .addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updateNewsDisplay();
        updatePagination();
      }
    });

  document
    .querySelector(".pagination-btn.next")
    .addEventListener("click", () => {
      const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        updateNewsDisplay();
        updatePagination();
      }
    });

  // EVENT LISTENERS - MODAL
  closeModal.addEventListener(
    "click",
    () => (newsModal.style.display = "none")
  );
  window.addEventListener("click", (e) => {
    if (e.target === newsModal) newsModal.style.display = "none";
  });
});
