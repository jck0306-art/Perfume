import { loadPerfumes, savePerfumes } from './storage.js';
import { escapeHTML } from './security.js';

let perfumes = loadPerfumes();
let activeCategory = 'all';

export function getPerfumes() {
  return perfumes;
}

export function setCategoryFilter(category) {
  activeCategory = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.type === category) {
      btn.className = "filter-btn active px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-purple-600 text-white";
    } else {
      btn.className = "filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-slate-900 text-slate-400 hover:text-white border border-slate-800";
    }
  });
  renderPerfumeCards();
}

export function updateStats() {
  const totalEl = document.getElementById('stat-total');
  const ratingEl = document.getElementById('stat-rating');
  const favsEl = document.getElementById('stat-favs');
  const reviewedEl = document.getElementById('stat-reviewed');

  if (!totalEl) return;

  totalEl.innerText = perfumes.length;
  const avg = perfumes.length 
    ? (perfumes.reduce((acc, cur) => acc + Number(cur.rating), 0) / perfumes.length).toFixed(1) 
    : '0.0';
  ratingEl.innerText = avg;
  favsEl.innerText = perfumes.filter(p => Number(p.rating) === 5).length;
  reviewedEl.innerText = perfumes.filter(p => p.memo && p.memo.trim().length > 0).length;
}

export function renderPerfumeCards() {
  const container = document.getElementById('perfume-grid');
  const searchInput = document.getElementById('search-input');
  const search = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (!container) return;

  const filtered = perfumes.filter(item => {
    const matchCategory = (activeCategory === 'all') || (item.category === activeCategory);
    const matchSearch = !search || 
      (item.brand && item.brand.toLowerCase().includes(search)) || 
      (item.name && item.name.toLowerCase().includes(search)) || 
      (item.store && item.store.toLowerCase().includes(search)) ||
      (item.notes && item.notes.toLowerCase().includes(search)) ||
      (item.seasons && item.seasons.some(s => s.toLowerCase().includes(search)));
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-500">
        <i class="fa-solid fa-wind text-3xl mb-2 block text-slate-600"></i>
        등록된 향수가 없거나 검색 조건과 일치하는 향수가 없습니다.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const seasonsList = Array.isArray(item.seasons) && item.seasons.length > 0 ? item.seasons : ['사계절'];

    return `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-purple-500/40 transition group flex flex-col justify-between">
        ${item.img ? `
          <div class="w-full bg-slate-950 border-b border-slate-800 p-2 flex justify-center items-center max-h-48 overflow-hidden">
            <img src="${item.img}" class="max-h-44 object-contain rounded-lg group-hover:scale-105 transition duration-300" alt="어코드/향수 이미지" />
          </div>
        ` : ''}

        <div class="p-5 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">${escapeHTML(item.brand)}</span>
              <h3 class="text-base font-bold text-white group-hover:text-purple-300 transition">${escapeHTML(item.name)}</h3>
            </div>
            <div class="flex items-center gap-1 text-slate-500">
              <button onclick="window.openPerfumeModal('${escapeHTML(item.id)}')" class="p-1.5 hover:text-amber-300 text-xs transition" title="수정"><i class="fa-solid fa-pen"></i></button>
              <button onclick="window.deletePerfume('${escapeHTML(item.id)}')" class="p-1.5 hover:text-rose-400 text-xs transition" title="삭제"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>

          <!-- 태그 배지들 -->
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <span class="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30">${escapeHTML(item.category)}</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">${escapeHTML(item.concentration)}</span>
            ${seasonsList.map(s => `
              <span class="px-1.5 py-0.5 rounded-md bg-slate-800 text-emerald-300 border border-emerald-500/20 text-[10px]">
                <i class="fa-solid fa-leaf text-[8px] mr-0.5"></i>${escapeHTML(s)}
              </span>
            `).join('')}
          </div>

          <!-- 잔여량 게이지 -->
          <div class="space-y-1 pt-1">
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>잔여량 (${escapeHTML(item.capacity || '-')})</span>
              <span class="font-mono text-purple-300 font-semibold">${item.remain}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div class="h-full bg-purple-500 rounded-full" style="width: ${item.remain}%"></div>
            </div>
          </div>

          <!-- 구매 정보 -->
          ${(item.store || item.buyDate) ? `
            <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
              ${item.store ? `
                <span class="flex items-center gap-1 text-slate-300 font-medium truncate">
                  <i class="fa-solid fa-bag-shopping text-purple-400 text-[10px]"></i> ${escapeHTML(item.store)}
                </span>
              ` : ''}
              ${item.buyDate ? `
                <span class="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                  <i class="fa-regular fa-calendar text-[10px]"></i> ${escapeHTML(item.buyDate)}
                </span>
              ` : ''}
            </div>
          ` : ''}

          <!-- 노트 구성 -->
          ${item.notes ? `
            <div class="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 font-sans">
              <span class="text-slate-500 font-semibold block text-[10px] uppercase mb-0.5">Notes</span>
              <p class="leading-relaxed line-clamp-2">${escapeHTML(item.notes)}</p>
            </div>
          ` : ''}

          <!-- 시향 메모 -->
          ${item.memo ? `
            <p class="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border-l-2 border-purple-500 italic">
              "${escapeHTML(item.memo)}"
            </p>
          ` : ''}
        </div>

        <!-- 별점 푸터 -->
        <div class="px-5 py-3 border-t border-slate-800/80 flex items-center justify-between">
          <div class="text-amber-400 text-xs tracking-wider">
            ${'★'.repeat(Number(item.rating))}${'☆'.repeat(5 - Number(item.rating))}
          </div>
          <span class="text-[11px] text-slate-500 font-mono font-semibold">Rating ${item.rating}.0</span>
        </div>
      </div>
    `;
  }).join('');
}

export function openPerfumeModal(id = null) {
  const modal = document.getElementById('perfume-modal');
  const title = document.getElementById('modal-title');
  const formId = document.getElementById('form-id');

  // 체크박스 및 파일 입력 초기화
  document.querySelectorAll('.season-checkbox input[type="checkbox"]').forEach(cb => cb.checked = false);
  const fileInput = document.getElementById('form-file-input');
  if (fileInput) fileInput.value = '';

  if (id) {
    const targetId = String(id);
    const item = perfumes.find(p => String(p.id) === targetId);
    if (!item) return;

    title.innerHTML = `<i class="fa-solid fa-pen text-purple-400"></i> 향수 정보 수정`;
    formId.value = item.id;
    document.getElementById('form-brand').value = item.brand || '';
    document.getElementById('form-name').value = item.name || '';
    document.getElementById('form-category').value = item.category || '우디';
    document.getElementById('form-concentration').value = item.concentration || 'EDP';
    
    // 계절 체크박스 매핑
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

    // 이미지 로드
    document.getElementById('form-img-base64').value = item.img || '';
    if (item.img) {
      document.getElementById('form-img-preview').src = item.img;
      document.getElementById('preview-wrap').classList.remove('hidden');
      document.getElementById('btn-remove-img').classList.remove('hidden');
    } else {
      document.getElementById('preview-wrap').classList.add('hidden');
      document.getElementById('btn-remove-img').classList.add('hidden');
    }

    document.getElementById('form-notes').value = item.notes || '';
    document.getElementById('form-memo').value = item.memo || '';
  } else {
    title.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-purple-400"></i> 새 향수 등록`;
    formId.value = '';
    document.getElementById('form-brand').value = '';
    document.getElementById('form-name').value = '';
    document.getElementById('form-category').value = '우디';
    document.getElementById('form-concentration').value = 'EDP';
    document.getElementById('form-capacity').value = '';
    document.getElementById('form-remain').value = 100;
    document.getElementById('remain-val').innerText = '100%';
    document.getElementById('form-rating').value = 5;
    document.getElementById('form-buy-date').value = '';
    document.getElementById('form-store').value = '';

    document.getElementById('form-img-base64').value = '';
    document.getElementById('preview-wrap').classList.add('hidden');
    document.getElementById('btn-remove-img').classList.add('hidden');

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

export function clearImagePreview() {
  document.getElementById('form-img-base64').value = '';
  const fileIn = document.getElementById('form-file-input');
  if (fileIn) fileIn.value = '';
  document.getElementById('preview-wrap').classList.add('hidden');
  document.getElementById('btn-remove-img').classList.add('hidden');
}

export function savePerfume() {
  const editId = document.getElementById('form-id').value;
  const brand = document.getElementById('form-brand').value.trim();
  const name = document.getElementById('form-name').value.trim();
  const category = document.getElementById('form-category').value;
  const concentration = document.getElementById('form-concentration').value;

  const selectedSeasons = Array.from(document.querySelectorAll('.season-checkbox input[type="checkbox"]:checked'))
    .map(cb => cb.value);

  if (!brand || !name) {
    alert('브랜드명과 향수 명칭은 필수 입력값입니다.');
    return;
  }

  if (selectedSeasons.length === 0) {
    alert('어울리는 계절을 최소 1개 이상 선택해 주세요.');
    return;
  }

  const capacity = document.getElementById('form-capacity').value.trim();
  const remain = Number(document.getElementById('form-remain').value);
  const rating = Number(document.getElementById('form-rating').value);
  const buyDate = document.getElementById('form-buy-date').value;
  const store = document.getElementById('form-store').value.trim();
  const img = document.getElementById('form-img-base64').value;
  const notes = document.getElementById('form-notes').value.trim();
  const memo = document.getElementById('form-memo').value.trim();

  if (editId) {
    const idx = perfumes.findIndex(p => String(p.id) === String(editId));
    if (idx !== -1) {
      perfumes[idx] = {
        ...perfumes[idx],
        brand, name, category, concentration,
        seasons: selectedSeasons,
        capacity, remain, rating,
        buyDate, store, img,
        notes, memo
      };
    } else {
      perfumes.unshift({
        id: editId,
        brand, name, category, concentration,
        seasons: selectedSeasons,
        capacity, remain, rating,
        buyDate, store, img,
        notes, memo
      });
    }
  } else {
    perfumes.unshift({
      id: 'p_' + Date.now(),
      brand, name, category, concentration,
      seasons: selectedSeasons,
      capacity, remain, rating,
      buyDate, store, img,
      notes, memo
    });
  }

  savePerfumes(perfumes);
  closePerfumeModal();
  updateStats();
  renderPerfumeCards();
}

export function deletePerfume(id) {
  if (!confirm('이 향수 아카이브를 삭제하시겠습니까?')) return;
  perfumes = perfumes.filter(p => String(p.id) !== String(id));
  savePerfumes(perfumes);
  updateStats();
  renderPerfumeCards();
}
