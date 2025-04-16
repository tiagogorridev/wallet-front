document.addEventListener('DOMContentLoaded', () => {
    const evolutionPatrimonyComponent = new EvolutionPatrimonyComponent('patrimonioChart', 'patrimonyFilter');
    evolutionPatrimonyComponent.initialize();
  
    const assetsDistributionComponent = new AssetsDistributionComponent('assetsDistributionChart', 'pie-chart-legend');
    assetsDistributionComponent.initialize();
  
    const assetsComponent = new AssetsComponent('assets-table-container', 'add-asset-modal');
    assetsComponent.initialize();
  
    const categoryHeaders = document.querySelectorAll('.category-header');
    categoryHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const category = header.closest('.asset-category');
        const content = category.querySelector('.category-content');
        const icon = header.querySelector('.category-expand-icon');
  
        document.querySelectorAll('.asset-category').forEach(cat => {
          if (cat !== category && cat.classList.contains('expanded')) {
            cat.classList.remove('expanded');
            cat.querySelector('.category-content').style.display = 'none';
            cat.querySelector('.category-expand-icon').textContent = '►';
          }
        });
  
        if (category.classList.contains('expanded')) {
          category.classList.remove('expanded');
          content.style.display = 'none';
          icon.textContent = '►';
        } else {
          category.classList.add('expanded');
          content.style.display = 'block';
          icon.textContent = '▼';
        }
      });
    });
  
    const addAssetBtn = document.getElementById('add-asset-btn');
    const modal = document.getElementById('add-asset-modal');
    const closeModal = document.querySelector('.close-modal');
    const addAssetForm = document.getElementById('add-asset-form');
  
    addAssetBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });
  
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  
    addAssetForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = {
        type: document.getElementById('asset-type').value,
        symbol: document.getElementById('asset-symbol').value,
        quantity: parseFloat(document.getElementById('asset-quantity').value),
        price: parseFloat(document.getElementById('asset-price').value),
        date: document.getElementById('asset-date').value,
        rating: parseInt(document.getElementById('asset-rating').value),
        idealPercentage: parseFloat(document.getElementById('asset-ideal-percentage').value)
      };
  
      console.log('Novo ativo adicionado:', formData);
      modal.style.display = 'none';
      addAssetForm.reset();
    });
  });
  