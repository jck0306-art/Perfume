import { cloudPerfumes, syncPerfumes } from './firebase.js';
import { escapeHTML } from './security.js';

let activeCategory = 'all';
let selectedPerfumeId = null;

const DEFAULT_CATEGORIES = [
  '우디', '시트러스', '플로럴', '머스크/비누', 
  '그린/허벌', '스파이시/오리엔탈', '구르망/달달', '아쿠아/프레시', '마린/솔티', '레더'
];

function getAccordStyle(accordName) {
  const name = accordName.toLowerCase();
  if (name.includes('짠') || name.includes('salty') || name.includes('선박') || name.includes('marine') || name.includes('해양') || name.includes('바다') || name.includes('마린')) {
    return { bg: '#2b6cb0', text: '#ffffff', border: '#4299e1' };
  }
  if (name.includes('광물') || name.includes('mineral')) {
    return { bg: '#5fb3b3', text: '#ffffff', border: '#7ecece' };
  }
  if (name.includes('감귤') || name.includes('시트러스') || name.includes('citrus') || name.includes('레몬') || name.includes('오렌지') || name.includes('베르가못')) {
    return { bg: '#fff04b', text: '#422006', border: '#fef08a', fontBold: true };
  }
  if (name.includes('나무') || name.includes('우디') || name.includes('woody') || name.includes('cedar') || name.includes('sandal')) {
    return { bg: '#93582e', text: '#ffffff', border: '#b47343' };
  }
  if (name.includes('신선') || name.includes('매콤') || name.includes('spicy') || name.includes('스파이시')) {
    return { bg: '#97d159', text: '#14532d', border: '#bbf7d0', fontBold: true };
  }
  if (name.includes('허브') || name.includes('herbal') || name.includes('aromatic') || name.includes('아로마')) {
    return { bg: '#86bba5', text: '#064e3b', border: '#a7f3d0', fontBold: true };
  }
  if (name.includes('이끼') || name.includes('moss') || name.includes('earthy')) {
    return { bg: '#8fa87b', text: '#ffffff', border: '#a3be8c' };
  }
  if (name.includes('달콤') || name.includes('sweet') || name.includes('바닐라') || name.includes('vanilla') || name.includes('구르망')) {
    return { bg: '#f87171', text: '#ffffff', border: '#fca5a5' };
  }
  if (name.includes('플로럴') || name.includes('floral') || name.includes('향긋') || name.includes('장미') || name.includes('rose')) {
    return { bg: '#f472b6', text: '#ffffff', border: '#fbcfe8' };
  }
  if (name.includes('머스크') || name.includes('musk') || name.includes('파우더') || name.includes('비누')) {
    return { bg: '#cbd5e1', text: '#1e293b', border: '#e2e8f0', fontBold: true };
  }
  if (name.includes('가죽') || name.includes('레더') || name.includes('leather')) {
    return { bg: '#b45309', text: '#ffffff', border: '#d97706' };
  }
  return { bg: '#a78bfa', text: '#ffffff', border: '#c4b5fd' };
}

// 🌟 기존 등록된 향조 + 기본 추천 향조 목록 취합
function getAllKnownCategories() {
  const catSet = new Set(DEFAULT_CATEGORIES);
  cloudPerfumes.forEach(p => {
    if (p.category && p.category.trim()) catSet.add(p.category.trim());
  });
  return Array.from(catSet);
}

// 🌟 모달 열릴 때 드롭다운 옵션 자동 채우기
function populateCategorySelect(currentValue = '') {
  const selectEl = document.getElementById('form-category-select');
  const customInput = document.getElementById('form-category-custom');
  if (!selectEl) return;

  const categories = getAllKnownCategories();
  const isCustom = currentValue && !categories.includes(currentValue);

  selectEl.innerHTML = `
    <option value="" disabled ${!currentValue ? 'selected' : ''}>향조 계열을 선택하세요</option>
    ${categories.map(c => `<option value="${escapeHTML(c)}" ${c === currentValue ? 'selected' : ''}>${escapeHTML(c)}</option>`).join('')}
    <option value="__custom__" ${isCustom ? 'selected' : ''}>✏️ 직접 입력하기</option>
  `;

  if (isCustom) {
    customInput.classList.remove('hidden');
    customInput.value = currentValue;
  } else {
    customInput.classList.add('hidden');
    customInput.value = '';
  }
}

// 드롭다운 변경 시 '직접 입력' 창 토글
export function handleCategorySelectChange(val) {
  const customInput = document.getElementById('form-category-custom');
  if (!customInput) return;

  if (val === '__custom__') {
    customInput.classList.remove('hidden');
    customInput.focus();
  } else {
    customInput.classList.add('hidden');
    customInput.value = '';
  }
}

export function renderCategoryFilters() {
  // 🌟 가로 버튼 나열 대신 드롭다운 셀렉트 옵션으로 생성
export function renderCategoryFilters() {
  const selectEl = document.getElementById('category-filter-select');
  if (!selectEl) return;

  // DB에 등록된 향수들에서 고유 향조 추출
  const categories = new Set();
  cloudPerfumes.forEach(p => {
    if (p.category && p.category.trim()) categories.add(p.category.trim());
  });

  const list = ['all', ...Array.from(categories)];

  selectEl.innerHTML = list.map(cat => {
    const isAll = cat === 'all';
    const label = isAll ? '전체 향조 보기' : cat;
    const isSelected = activeCategory === cat;

    return `<option value="${escapeHTML(cat)}" ${isSelected ? 'selected' : ''}>${escapeHTML(label)}</option>`;
  }).join('');
}
}

export function setCategoryFilter(category) {
  activeCategory = category;
  renderCategoryFilters();
  renderPerfumeListView();
}

export function updateStats() {
  const totalEl = document.getElementById('stat-total');
  const ratingEl = document.getElementById('stat-rating');
  const favsEl = document.getElementById('stat-favs');
  const reviewedEl = document.getElementById('stat-reviewed');

  if (!totalEl) return;
  totalEl.innerText = cloudPerfumes.length;
  const avg = cloudPerfumes.length 
    ? (cloudPerfumes.reduce((acc, cur) => acc + Number(cur.rating), 0) / cloudPerfumes.length).toFixed(1) 
    : '0.0';
  ratingEl.innerText = avg;
  favsEl.innerText = cloudPerfumes.filter(p => Number(p.rating) === 5).length;
  reviewedEl.innerText = cloudPerfumes.filter(p => p.memo && p.memo.trim().length > 0).length;
}

export function renderPerfumeListView() {
  const listContainer = document.getElementById('perfume-list-container');
  const countBadge = document.getElementById('list-count');
  const searchInput = document.getElementById('search-input');
  const search = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (!listContainer) return;

  const filtered = cloudPerfumes.filter(item => {
    const matchCategory = (activeCategory === 'all') || (item.category === activeCategory);
    const matchSearch = !search || 
      (item.brand && item.brand.toLowerCase().includes(search)) || 
      (item.name && item.name.toLowerCase().includes(search)) || 
      (item.category && item.category.toLowerCase().includes(search)) ||
      (item.store && item.store.toLowerCase().includes(search)) ||
      (item.notes && item.notes.toLowerCase().includes(search)) ||
      (item.accords && item.accords.some(a => a.toLowerCase().includes(search))) ||
      (item.seasons && item.seasons.some(s => s.toLowerCase().includes(search)));
    return matchCategory && matchSearch;
  });

  if (countBadge) countBadge.innerText = filtered.length;

  if (filtered.length > 0) {
    const exists = filtered.some(p => String(p.id) === String(selectedPerfumeId));
    if (!exists) selectedPerfumeId = String(filtered[0].id);
  } else {
    selectedPerfumeId = null;
  }

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
        <i class="fa-solid fa-wind text-2xl mb-2 block text-slate-600"></i>
        일치하는 향수가 없습니다.
      </div>
    `;
    renderPerfumeDetailView();
    return;
  }

  listContainer.innerHTML = filtered.map(item => {
    const isSelected = String(item.id) === String(selectedPerfumeId);

    return `
      <div onclick="window.selectPerfume('${escapeHTML(item.id)}')" 
           class="p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
             isSelected 
               ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-lg shadow-purple-950/30' 
               : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
           }">
        <div class="flex-1 min-w-0 pr-3">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-purple-300' : 'text-purple-400/90'} truncate">
              ${escapeHTML(item.brand)}
            </span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 font-mono">
              ${escapeHTML(item.concentration || 'EDP')}
            </span>
          </div>
          <h4 class="text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-purple-300'}">
            ${escapeHTML(item.name)}
          </h4>
        </div>
        
        <div class="flex items-center gap-2 shrink-0">
          <div class="text-amber-400 text-xs">
            ★ <span class="font-mono font-bold">${item.rating || 5}</span>
          </div>
          <i class="fa-solid fa-chevron-right text-xs ${isSelected ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'}"></i>
        </div>
      </div>
    `;
  }).join('');

  renderPerfumeDetailView();
}

export function renderPerfumeDetailView() {
  const detailEl = document.getElementById('perfume-detail-content');
  if (!detailEl) return;

  if (!selectedPerfumeId) {
    detailEl.innerHTML = `
      <div class="py-24 text-center text-slate-500 text-sm flex flex-col items-center justify-center">
        <i class="fa-solid fa-spray-can-sparkles text-4xl mb-3 text-slate-700"></i>
        <span>목록에서 향수를 선택해 보세요.</span>
      </div>
    `;
    return;
  }

  const item = cloudPerfumes.find(p => String(p.id) === String(selectedPerfumeId));
  if (!item) {
    detailEl.innerHTML = `<div class="text-slate-500 text-center py-20">향수 정보를 찾을 수 없습니다.</div>`;
    return;
  }

  const seasonsList = Array.isArray(item.seasons) && item.seasons.length > 0 ? item.seasons : ['사계절'];
  const accordsList = Array.isArray(item.accords) ? item.accords : [];

  detailEl.innerHTML = `
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-0.5">
            ${escapeHTML(item.brand)}
          </span>
          <h2 class="text-xl md:text-2xl font-black text-white">
            ${escapeHTML(item.name)}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.openPerfumeModal('${escapeHTML(item.id)}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm">
            <i class="fa-solid fa-pen text-[10px] text-amber-400"></i> 수정
          </button>
          <button onclick="window.deletePerfume('${escapeHTML(item.id)}')" class="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm">
            <i class="fa-solid fa-trash text-[10px]"></i> 삭제
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
        <div class="flex flex-wrap gap-1.5 text-xs">
          <span class="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">${escapeHTML(item.category || '기타')}</span>
          <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/80">${escapeHTML(item.concentration)}</span>
          ${seasonsList.map(s => `
            <span class="px-2 py-1 rounded-lg bg-slate-800 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
              <i class="fa-solid fa-leaf text-[9px] mr-1"></i>${escapeHTML(s)}
            </span>
          `).join('')}
        </div>
        <div class="text-amber-400 text-xs font-mono font-bold tracking-wider">
          ${'★'.repeat(Number(item.rating))}${'☆'.repeat(5 - Number(item.rating))}
          <span class="ml-1 text-slate-400 font-normal">(${item.rating}.0)</span>
        </div>
      </div>

      <div class="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
        <div class="flex justify-between text-xs text-slate-400 font-semibold">
          <span>용량 및 잔여량 (${escapeHTML(item.capacity || '미기재')})</span>
          <span class="font-mono text-purple-300 font-bold">${item.remain}% 남음</span>
        </div>
        <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style="width: ${item.remain}%"></div>
        </div>
      </div>

      ${(item.store || item.buyDate) ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          <div class="flex items-center gap-2 text-slate-300">
            <i class="fa-solid fa-bag-shopping text-purple-400"></i>
            <span class="text-slate-500">구매처:</span>
            <strong class="text-slate-200">${escapeHTML(item.store || '미기재')}</strong>
          </div>
          <div class="flex items-center gap-2 text-slate-300 font-mono">
            <i class="fa-regular fa-calendar text-indigo-400"></i>
            <span class="text-slate-500 font-sans">구매일자:</span>
            <strong class="text-slate-200">${escapeHTML(item.buyDate || '미기재')}</strong>
          </div>
        </div>
      ` : ''}

      <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1.5">
          <i class="fa-solid fa-layer-group text-purple-400"></i> Fragrance Notes (탑 / 미들 / 베이스)
        </span>
        <p class="text-xs text-slate-200 leading-relaxed font-mono">
          ${escapeHTML(item.notes || '기록된 노트 정보가 없습니다.')}
        </p>
      </div>

      <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1.5">
          <i class="fa-solid fa-comment-dots text-purple-400"></i> 시향기 & 착향 메모
        </span>
        <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
          ${escapeHTML(item.memo || '작성된 시향 메모가 없습니다.')}
        </p>
      </div>

      <!-- 향 노트 차트 (왼쪽 정렬) -->
      ${accordsList.length > 0 ? `
        <div class="bg-slate-950/90 rounded-2xl border border-slate-800/90 p-4 md:p-5 shadow-inner space-y-3">
          <div class="text-left">
            <span class="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <i class="fa-solid fa-bars-staggered text-purple-400 text-[11px]"></i>
              향 노트 <span class="text-[10px] font-mono text-purple-400 font-normal">MAIN ACCORDS</span>
            </span>
          </div>
          
          <div class="flex flex-col items-start space-y-1.5 w-full">
            ${accordsList.map((acc, index) => {
              const widthPct = Math.max(45, 100 - (index * 6));
              const style = getAccordStyle(acc);

              return `
                <div class="h-7 rounded-lg flex items-center justify-start pl-3.5 transition-all duration-300 hover:brightness-105 shadow-sm"
                     style="width: ${widthPct}%; background-color: ${style.bg}; border: 1px solid ${style.border};">
                  <span class="text-[11px] md:text-xs tracking-wide select-none truncate drop-shadow-sm"
                        style="color: ${style.text}; font-weight: ${style.fontBold ? '700' : '600'};">
                    ${escapeHTML(acc)}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

export function selectPerfume(id) {
  selectedPerfumeId = String(id);
  renderPerfumeListView();
  if (window.innerWidth < 1024) {
    document.getElementById('perfume-detail-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}

export function openPerfumeModal(id = null) {
  const modal = document.getElementById('perfume-modal');
  const title = document.getElementById('modal-title');
  const formId = document.getElementById('form-id');

  document.querySelectorAll('.season-checkbox input[type="checkbox"]').forEach(cb => cb.checked = false);

  if (id) {
    const targetId = String(id);
    const item = cloudPerfumes.find(p => String(p.id) === targetId);
    if (!item) return;

    title.innerHTML = `<i class="fa-solid fa-pen text-purple-400"></i> 향수 정보 수정`;
    formId.value = item.id;
    document.getElementById('form-brand').value = item.brand || '';
    document.getElementById('form-name').value = item.name || '';
    document.getElementById('form-accords').value = Array.isArray(item.accords) ? item.accords.join(', ') : '';
    
    // 🌟 향조 드롭다운 및 직접입력 채우기
    populateCategorySelect(item.category || '');

    document.getElementById('form-concentration').value = item.concentration || 'EDP';
    
    const seasons = Array.isArray(item.seasons) ? item.seasons : [];
    document.querySelectorAll('.season-checkbox input[type="checkbox"]').forEach(cb => {
      if (seasons.includes(cb.value)) cb.checked = true;
    });

    document.getElementById('form-capacity').value = item.capacity || '';
    document.getElementById('form-remain').value = item.remain !== undefined ? item.remain : 100;
    document.getElementById('remain-val').innerText = (item.remain !== undefined ? item.remain : 100) + '%';
    document.getElementById('form-rating').value = item.rating || 5;
    document.getElementById('form-buy-date').value = item.buyDate || '';
    document.getElementById('form-store').value = item.store || '';
    document.getElementById('form-notes').value = item.notes || '';
    document.getElementById('form-memo').value = item.memo || '';
  } else {
    title.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-purple-400"></i> 새 향수 등록`;
    formId.value = '';
    document.getElementById('form-brand').value = '';
    document.getElementById('form-name').value = '';
    document.getElementById('form-accords').value = '';
    
    // 🌟 새 등록 시 드롭다운 기본값
    populateCategorySelect('우디');

    document.getElementById('form-concentration').value = 'EDP';
    document.getElementById('form-capacity').value = '';
    document.getElementById('form-remain').value = 100;
    document.getElementById('remain-val').innerText = '100%';
    document.getElementById('form-rating').value = 5;
    document.getElementById('form-buy-date').value = '';
    document.getElementById('form-store').value = '';
    document.getElementById('form-notes').value = '';
    document.getElementById('form-memo').value = '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closePerfumeModal() {
  const modal = document.getElementById('perfume-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

export function savePerfume() {
  const editId = document.getElementById('form-id').value;
  const brand = document.getElementById('form-brand').value.trim();
  const name = document.getElementById('form-name').value.trim();
  const accordsRaw = document.getElementById('form-accords').value.trim();
  
  // 🌟 향조 값 추출 (직접 입력 여부 분기)
  const selectVal = document.getElementById('form-category-select').value;
  const customVal = document.getElementById('form-category-custom').value.trim();
  let category = selectVal;
  if (selectVal === '__custom__' || !selectVal) {
    category = customVal || '기타';
  }

  const concentration = document.getElementById('form-concentration').value;

  const selectedSeasons = Array.from(document.querySelectorAll('.season-checkbox input[type="checkbox"]:checked'))
    .map(cb => cb.value);

  if (!brand || !name) return alert('브랜드명과 향수 명칭은 필수 입력값입니다.');
  if (selectedSeasons.length === 0) return alert('어울리는 계절을 최소 1개 이상 선택해 주세요.');

  const accordsList = accordsRaw ? accordsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const capacity = document.getElementById('form-capacity').value.trim();
  const remain = Number(document.getElementById('form-remain').value);
  const rating = Number(document.getElementById('form-rating').value);
  const buyDate = document.getElementById('form-buy-date').value;
  const store = document.getElementById('form-store').value.trim();
  const notes = document.getElementById('form-notes').value.trim();
  const memo = document.getElementById('form-memo').value.trim();

  const payload = {
    brand, name, category, concentration,
    accords: accordsList,
    seasons: selectedSeasons,
    capacity, remain, rating,
    buyDate, store,
    notes, memo
  };

  if (editId) {
    const idx = cloudPerfumes.findIndex(p => String(p.id) === String(editId));
    if (idx !== -1) {
      cloudPerfumes[idx] = { ...cloudPerfumes[idx], ...payload };
    }
    selectedPerfumeId = String(editId);
  } else {
    const newId = 'p_' + Date.now();
    cloudPerfumes.unshift({ id: newId, ...payload });
    selectedPerfumeId = newId;
  }

  closePerfumeModal();
  syncPerfumes(() => {
    updateStats();
    renderCategoryFilters();
    renderPerfumeListView();
  });
}

export function deletePerfume(id) {
  if (!confirm('이 향수 아카이브를 삭제하시겠습니까?')) return;
  const idx = cloudPerfumes.findIndex(p => String(p.id) === String(id));
  if (idx !== -1) {
    cloudPerfumes.splice(idx, 1);
  }
  if (String(selectedPerfumeId) === String(id)) {
    selectedPerfumeId = cloudPerfumes.length > 0 ? String(cloudPerfumes[0].id) : null;
  }

  syncPerfumes(() => {
    updateStats();
    renderCategoryFilters();
    renderPerfumeListView();
  });
}
