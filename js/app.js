import { initFirebase } from './firebase.js';
import { 
  updateStats, 
  renderCategoryFilters,
  renderPerfumeListView, 
  selectPerfume,
  setCategoryFilter, 
  openPerfumeModal, 
  closePerfumeModal, 
  savePerfume, 
  deletePerfume 
} from './perfume.js';

window.setCategoryFilter = setCategoryFilter;
window.filterPerfumes = renderPerfumeListView;
window.selectPerfume = selectPerfume;
window.openPerfumeModal = openPerfumeModal;
window.closePerfumeModal = closePerfumeModal;
window.savePerfume = savePerfume;
window.deletePerfume = deletePerfume;

window.toggleFamilySiteMenu = function() {
  const menu = document.getElementById('family-site-menu');
  const icon = document.getElementById('family-site-icon');
  if (!menu) return;

  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    if (icon) icon.className = "fa-solid fa-xmark text-slate-400 text-base";
  } else {
    menu.classList.add('hidden');
    if (icon) icon.className = "fa-solid fa-layer-group text-purple-400";
  }
};

document.addEventListener('click', function(e) {
  const container = document.getElementById('family-site-menu')?.parentElement;
  const menu = document.getElementById('family-site-menu');
  const icon = document.getElementById('family-site-icon');
  if (container && !container.contains(e.target) && menu && !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
    if (icon) icon.className = "fa-solid fa-layer-group text-purple-400";
  }
});

function render() {
  updateStats();
  renderCategoryFilters();
  renderPerfumeListView();
}

window.addEventListener('DOMContentLoaded', () => {
  initFirebase(render);
});
