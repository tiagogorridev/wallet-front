// INICIALIZACAO PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {
  const categoryBtns = document.querySelectorAll(".category-btn");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const submitBtn = document.querySelector(".btn-submit");
  const newsList = document.querySelector(".news-list");
  let editingNewsId = null;

  loadNews();

  // SELECAO DE CATEGORIA
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // FILTROS DE VISUALIZACAO
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.textContent.trim().toLowerCase();
      const newsItems = document.querySelectorAll(".news-item");

      newsItems.forEach((item) => {
        const category = item
          .querySelector(".news-category")
          .textContent.trim()
          .toLowerCase();
        const shouldShow =
          filter === "todas" ||
          (filter === "ação" && category === "acao") ||
          filter === category;
        item.style.display = shouldShow ? "block" : "none";
      });
    });
  });

  // SUBMISSAO DE NOTICIAS
  submitBtn.addEventListener("click", async () => {
    if (!titleInput.value || !contentInput.value) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const selectedCategory = document
      .querySelector(".category-btn.active")
      .textContent.toLowerCase();
    const newsData = {
      titulo: titleInput.value,
      conteudo: contentInput.value,
      categoria: selectedCategory === "ação" ? "acao" : selectedCategory,
    };

    try {
      if (editingNewsId) {
        const newsId = parseInt(editingNewsId);
        if (isNaN(newsId)) throw new Error("ID da notícia inválido");

        const response = await APIService.updateNews(newsId, newsData);
        if (response.error)
          throw new Error(response.msg || "Erro ao atualizar notícia");

        alert("Notícia atualizada com sucesso!");
      } else {
        const response = await APIService.addNews(newsData);
        if (response.error)
          throw new Error(response.msg || "Erro ao adicionar notícia");

        alert("Notícia publicada com sucesso!");
      }

      await loadNews();
      clearForm();
    } catch (error) {
      alert(`Erro ao salvar a notícia: ${error.message}`);
    }
  });

  // CARREGAMENTO DE NOTICIAS
  async function loadNews() {
    try {
      newsList.innerHTML = '<div class="loading">Carregando notícias...</div>';
      const response = await APIService.getNews();
      const news = Array.isArray(response.data.data) ? response.data.data : [];

      if (news.length === 0) {
        newsList.innerHTML =
          '<div class="empty-state">Nenhuma notícia publicada ainda.</div>';
        return;
      }

      newsList.innerHTML = "";
      news.forEach((newsItem) => {
        newsList.appendChild(createNewsElement(newsItem));
      });
    } catch (error) {
      newsList.innerHTML =
        '<div class="error-state">Erro ao carregar notícias. Por favor, tente novamente.</div>';
    }
  }

  // CRIACAO DE ELEMENTOS DE NOTICIA
  function createNewsElement(newsItem) {
    const newsElement = document.createElement("div");
    newsElement.className = "news-item";
    newsElement.dataset.id = newsItem.id;

    let displayCategory =
      newsItem.categoria === "acao"
        ? "Ação"
        : newsItem.categoria === "crypto"
        ? "Crypto"
        : newsItem.categoria;

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

  // CONFIGURACAO DE BOTOES DE ACAO
  function setupActionButtons(newsElement, newsItem) {
    const editBtn = newsElement.querySelector(".edit-btn");
    const deleteBtn = newsElement.querySelector(".delete-btn");

    editBtn.addEventListener("click", () => {
      if (!newsItem.id) {
        alert("Erro: ID da notícia não encontrado");
        return;
      }

      editingNewsId = newsItem.id;
      titleInput.value = newsItem.titulo;
      contentInput.value = newsItem.conteudo;

      categoryBtns.forEach((btn) => {
        const btnCategory = btn.textContent.toLowerCase();
        const newsCategory = newsItem.categoria.toLowerCase();
        btn.classList.toggle(
          "active",
          btnCategory === newsCategory ||
            (btnCategory === "ação" && newsCategory === "acao")
        );
      });

      submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar';
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    deleteBtn.addEventListener("click", async () => {
      if (!newsItem.id) {
        alert("Erro: ID da notícia não encontrado");
        return;
      }

      if (confirm("Tem certeza que deseja excluir esta publicação?")) {
        try {
          await APIService.deleteNews(newsItem.id);
          await loadNews();
          alert("Notícia excluída com sucesso!");
        } catch (error) {
          alert("Erro ao excluir a notícia. Por favor, tente novamente.");
        }
      }
    });
  }

  // LIMPEZA DO FORMULARIO
  function clearForm() {
    titleInput.value = "";
    contentInput.value = "";
    editingNewsId = null;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar';
    categoryBtns[0].click();
  }
});
