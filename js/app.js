import { initFirebase } from './firebase.js';
import { 
  updateStats, 
  renderCategoryFilters,
  renderPerfumeListView, 
  selectPerfume,
  setCategoryFilter, 
  openPerfumeModal, 
  closePerfumeModal, 
  handleCategorySelectChange,
  savePerfume, 
  deletePerfume 
} from './perfume.js';
import { 
  renderVipCards, 
  openVipModal, 
  closeVipModal, 
  saveVipItem, 
  toggleVipCheck, 
  deleteVipItem 
} from './vip.js';

let activeTab = 'perfumes'; // 'perfumes' | 'vip'

// 🌟 향수 컬렉션 ↔ VIP 멤버십 메인 탭 전환 함수
window.switchMainTab = function(tabKey) {
  activeTab = tabKey;
  const tabBtnP = document.getElementById('tab-btn-perfumes');
  const tabBtnV = document.getElementById('tab-btn-vip');
  const viewP = document.getElementById('section-perfume-view');
  const viewV = document.getElementById('section-vip-view');
  const btnAddP = document.getElementById('btn-open-perfume-add');
  const btnAddV = document.getElementById('btn-open-vip-add');

  if (tabKey === 'perfumes') {
    tabBtnP.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-purple-600 text-white shadow-sm";
    tabBtnV.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-white";
    viewP.classList.remove('hidden');
    viewV.classList.add('hidden');
    btnAddP.classList.remove('hidden');
    btnAddV.classList.add('hidden');
  } else {
    tabBtnV.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-amber-500 text-slate-950 shadow-sm font-bold";
    tabBtnP.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-white";
    viewV.classList.remove('hidden');
    viewP.classList.add('hidden');
    btnAddV.classList.remove('hidden');
    btnAddP.classList.add('hidden');
    renderVipCards();
  }
};

// 향수 전역 바인딩
window.setCategoryFilter = setCategoryFilter;
window.filterPerfumes = renderPerfumeListView;
window.selectPerfume = selectPerfume;
window.openPerfumeModal = openPerfumeModal;
window.closePerfumeModal = closePerfumeModal;
window.handleCategorySelectChange = handleCategorySelectChange;
window.savePerfume = savePerfume;
window.deletePerfume = deletePerfume;

// VIP 멤버십 전역 바인딩
window.openVipModal = openVipModal;
window.closeVipModal = closeVipModal;
window.saveVipItem = saveVipItem;
window.toggleVipCheck = toggleVipCheck;
window.deleteVipItem = deleteVipItem;

// 패밀리 사이트 토글
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
  renderVipCards();
}

window.addEventListener('DOMContentLoaded', () => {
  initFirebase(render);
});
