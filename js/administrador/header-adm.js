document.addEventListener("DOMContentLoaded", () => {
  // CARREGAMENTO DO HEADER
  const headerContainer = document.getElementById("admin-header");
  if (headerContainer) {
    fetch("../../html/administrador/header-adm.html")
      .then((response) => response.text())
      .then((data) => {
        headerContainer.innerHTML = data;
        initializeHeader();
      })
      .catch(() => initializeHeader());
  } else {
    initializeHeader();
  }
});

function initializeHeader() {
  // CONFIGURAÇÃO LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../index.html";
  };

  const logoutButton = document.getElementById("logoutBtn");
  const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

  if (logoutButton) logoutButton.addEventListener("click", handleLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", handleLogout);

  // MENU MOBILE
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const closeMobileMenu = document.querySelector(".close-mobile-menu");
  const mobileMenu = document.querySelector(".mobile-menu");
  const body = document.body;

  if (mobileMenuBtn && closeMobileMenu && mobileMenu) {
    const openMobileMenu = () => {
      mobileMenu.classList.add("active");
      body.classList.add("menu-open");
      const scrollY = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
    };

    const closeMobileMenuHandler = () => {
      mobileMenu.classList.remove("active");
      body.classList.remove("menu-open");
      const scrollY = body.style.top;
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };

    mobileMenuBtn.addEventListener("click", openMobileMenu);
    closeMobileMenu.addEventListener("click", closeMobileMenuHandler);

    document
      .querySelectorAll(".mobile-menu-items .nav-item")
      .forEach((item) => {
        item.addEventListener("click", closeMobileMenuHandler);
      });

    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeMobileMenuHandler();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
        closeMobileMenuHandler();
      }
    });
  }

  // NAVEGAÇÃO ATIVA
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll(".nav-item");
  let activeFound = false;

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
    });

    const href = item.getAttribute("href") || "";
    item.classList.remove("active");

    if (
      currentPath.includes(href) ||
      currentPath.split("/").pop().includes(href.split("/").pop())
    ) {
      item.classList.add("active");
      activeFound = true;
    }
  });

  // DASHBOARD PADRÃO
  if (
    !activeFound &&
    (currentPath.endsWith("/") || currentPath.endsWith("index.html"))
  ) {
    const dashboardItem = document.querySelector(".nav-item:first-child");
    if (dashboardItem) dashboardItem.classList.add("active");
  }
}
