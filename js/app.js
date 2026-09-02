import { 
  updateStats, 
  renderPerfumeCards, 
  setCategoryFilter, 
  openPerfumeModal, 
  closePerfumeModal, 
  savePerfume, 
  deletePerfume 
} from './perfume.js';

// HTML 인라인 onclick 이벤트에서 호출할 수 있도록 window 객체에 연결
window.setCategoryFilter = setCategoryFilter;
window.filterPerfumes = renderPerfumeCards;
window.openPerfumeModal = openPerfumeModal;
window.closePerfumeModal = closePerfumeModal;
window.savePerfume = savePerfume;
window.deletePerfume = deletePerfume;

// 패밀리 사이트 메뉴 제어
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

// 초기화
window.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderPerfumeCards();
});
