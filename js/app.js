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
  handleConcentrationSelectChange,
  savePerfume, 
  deletePerfume 
} from './perfume.js';
import { 
  renderWishCards, 
  openWishModal, 
  closeWishModal, 
  saveWishItem, 
  toggleWishTested, 
  deleteWishItem, 
  convertToOwnedPerfume 
} from './wish.js';
import { 
  renderVipCards, 
  openVipModal, 
  closeVipModal, 
  saveVipItem, 
  toggleVipCheck, 
  deleteVipItem 
} from './vip.js';
import { initAuthGuard, logoutAdmin } from './security.js';

let activeTab = 'perfumes'; // 'perfumes' | 'wish' | 'vip'

// 🌟 3단 탭 전환 함수 (컬렉션 vs 위시리스트 vs VIP)
window.switchMainTab = function(tabKey) {
  activeTab = tabKey;
  const tabBtnP = document.getElementById('tab-btn-perfumes');
  const tabBtnW = document.getElementById('tab-btn-wish');
  const tabBtnV = document.getElementById('tab-btn-vip');
  const viewP = document.getElementById('section-perfume-view');
  const viewW = document.getElementById('section-wish-view');
  const viewV = document.getElementById('section-vip-view');
  const btnAddP = document.getElementById('btn-open-perfume-add');
  const btnAddW = document.getElementById('btn-open-wish-add');
  const btnAddV = document.getElementById('btn-open-vip-add');

  // 버튼 스타일 초기화
  [tabBtnP, tabBtnW, tabBtnV].forEach(b => {
    b.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-400 hover:text-white";
  });
  // 뷰 초기화
  [viewP, viewW, viewV, btnAddP, btnAddW, btnAddV].forEach(el => el.classList.add('hidden'));

  if (tabKey === 'perfumes') {
    tabBtnP.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-purple-600 text-white shadow-sm";
    viewP.classList.remove('hidden');
    btnAddP.classList.remove('hidden');
  } else if (tabKey === 'wish') {
    tabBtnW.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-pink-600 text-white shadow-sm";
    viewW.classList.remove('hidden');
    btnAddW.classList.remove('hidden');
    renderWishCards();
  } else {
    tabBtnV.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-amber-500 text-slate-950 shadow-sm font-bold";
    viewV.classList.remove('hidden');
    btnAddV.classList.remove('hidden');
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
window.handleConcentrationSelectChange = handleConcentrationSelectChange;
window.savePerfume = savePerfume;
window.deletePerfume = deletePerfume;

// 위시리스트 전역 바인딩
window.openWishModal = openWishModal;
window.closeWishModal = closeWishModal;
window.saveWishItem = saveWishItem;
window.toggleWishTested = toggleWishTested;
window.deleteWishItem = deleteWishItem;
window.convertToOwnedPerfume = convertToOwnedPerfume;

// VIP 멤버십 전역 바인딩
window.openVipModal = openVipModal;
window.closeVipModal = closeVipModal;
window.saveVipItem = saveVipItem;
window.toggleVipCheck = toggleVipCheck;
window.deleteVipItem = deleteVipItem;

// 관리자 로그아웃 전역 바인딩
window.logoutAdmin = logoutAdmin;

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
  renderWishCards();
  renderVipCards();
}

window.addEventListener('DOMContentLoaded', () => {
  initAuthGuard(false, () => {
    initFirebase(render);
  });
});
