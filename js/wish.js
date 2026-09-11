import { cloudWishItems, cloudPerfumes, syncPerfumes } from './firebase.js';
import { escapeHTML } from './security.js';

export function updateWishStats() {
  const badgeEl = document.getElementById('wish-header-badge');
  const totalEl = document.getElementById('wish-stat-total');
  const testedEl = document.getElementById('wish-stat-tested');

  if (badgeEl) badgeEl.innerText = cloudWishItems.length;
  if (totalEl) totalEl.innerText = cloudWishItems.length;

  const testedCount = cloudWishItems.filter(w => w.tested).length;
  if (testedEl) testedEl.innerText = testedCount;
}

export function renderWishCards() {
  const container = document.getElementById('wish-grid-container');
  if (!container) return;

  updateWishStats();

  if (cloudWishItems.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-slate-500">
        <i class="fa-solid fa-heart text-3xl mb-2 block text-pink-500/40"></i>
        등록된 위시 향수가 없습니다. 상단의 '위시 등록' 버튼을 눌러보세요!
      </div>
    `;
    return;
  }

  // 우선순위 높은 순(3 -> 1) 정렬
  const sorted = [...cloudWishItems].sort((a, b) => (b.priority || 1) - (a.priority || 1));

  container.innerHTML = sorted.map(item => {
    const priorityStars = '★'.repeat(item.priority || 1) + '☆'.repeat(3 - (item.priority || 1));
    return `
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-pink-500/40 transition flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-pink-400 block mb-0.5">Wishlist</span>
              <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">${escapeHTML(item.brand)}</span>
              <h3 class="text-lg font-black text-white break-words mt-0.5">${escapeHTML(item.name)}</h3>
            </div>
            <div class="flex items-center gap-1">
              <button onclick="window.openWishModal('${escapeHTML(item.id)}')" class="p-1.5 text-slate-500 hover:text-pink-400 text-xs transition" title="수정">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button onclick="window.deleteWishItem('${escapeHTML(item.id)}')" class="p-1.5 text-slate-500 hover:text-rose-400 text-xs transition" title="삭제">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="text-amber-400 font-mono font-bold tracking-wider px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20" title="우선순위">
              ${priorityStars}
            </span>
            <button onclick="window.toggleWishTested('${escapeHTML(item.id)}')" class="px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${
              item.tested 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
            }">
              ${item.tested ? '<i class="fa-solid fa-check text-[10px]"></i> 시향완료' : '⏳ 미시향'}
            </button>
            ${item.category ? `
              <span class="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-medium">
                ${escapeHTML(item.category)}
              </span>
            ` : ''}
          </div>

          ${item.price ? `
            <div class="text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-300">
              <i class="fa-solid fa-tag text-pink-400"></i>
              <span class="text-slate-500">예상가/용량:</span>
              <strong class="text-slate-200 font-mono">${escapeHTML(item.price)}</strong>
            </div>
          ` : ''}

          ${item.store ? `
            <div class="text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2 text-slate-300">
              <i class="fa-solid fa-cart-shopping text-purple-400 mt-0.5"></i>
              <span class="text-slate-500 shrink-0">구매처:</span>
              <span class="text-slate-200 break-words">${escapeHTML(item.store)}</span>
            </div>
          ` : ''}

          ${item.memo ? `
            <div class="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/60 text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
              ${escapeHTML(item.memo)}
            </div>
          ` : ''}
        </div>

        <!-- 🌟 원클릭 보유 컬렉션 전환 버튼 -->
        <button onclick="window.convertToOwnedPerfume('${escapeHTML(item.id)}')" class="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30">
          <i class="fa-solid fa-box-archive"></i> 소장 완료 (보유 컬렉션으로 이동)
        </button>
      </div>
    `;
  }).join('');
}

export function openWishModal(id = null) {
  const modal = document.getElementById('wish-modal');
  const title = document.getElementById('wish-modal-title');
  const formId = document.getElementById('form-wish-id');

  if (id) {
    const item = cloudWishItems.find(w => String(w.id) === String(id));
    if (!item) return;
    title.innerHTML = `<i class="fa-solid fa-pen text-pink-400"></i> 위시리스트 수정`;
    formId.value = item.id;
    document.getElementById('form-wish-brand').value = item.brand || '';
    document.getElementById('form-wish-name').value = item.name || '';
    document.getElementById('form-wish-price').value = item.price || '';
    document.getElementById('form-wish-tested').value = String(Boolean(item.tested));
    document.getElementById('form-wish-priority').value = item.priority || 3;
    document.getElementById('form-wish-category').value = item.category || '';
    document.getElementById('form-wish-store').value = item.store || '';
    document.getElementById('form-wish-memo').value = item.memo || '';
  } else {
    title.innerHTML = `<i class="fa-solid fa-heart text-pink-400"></i> 위시리스트 등록`;
    formId.value = '';
    document.getElementById('form-wish-brand').value = '';
    document.getElementById('form-wish-name').value = '';
    document.getElementById('form-wish-price').value = '';
    document.getElementById('form-wish-tested').value = 'false';
    document.getElementById('form-wish-priority').value = '3';
    document.getElementById('form-wish-category').value = '';
    document.getElementById('form-wish-store').value = '';
    document.getElementById('form-wish-memo').value = '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeWishModal() {
  const modal = document.getElementById('wish-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

export function saveWishItem() {
  const editId = document.getElementById('form-wish-id').value;
  const brand = document.getElementById('form-wish-brand').value.trim();
  const name = document.getElementById('form-wish-name').value.trim();

  if (!brand || !name) return alert('브랜드명과 향수 명칭은 필수 입력값입니다.');

  const price = document.getElementById('form-wish-price').value.trim();
  const tested = document.getElementById('form-wish-tested').value === 'true';
  const priority = Number(document.getElementById('form-wish-priority').value) || 1;
  const category = document.getElementById('form-wish-category').value.trim();
  const store = document.getElementById('form-wish-store').value.trim();
  const memo = document.getElementById('form-wish-memo').value.trim();

  const payload = { brand, name, price, tested, priority, category, store, memo };

  if (editId) {
    const idx = cloudWishItems.findIndex(w => String(w.id) === String(editId));
    if (idx !== -1) cloudWishItems[idx] = { ...cloudWishItems[idx], ...payload };
  } else {
    cloudWishItems.unshift({ id: 'wish_' + Date.now(), ...payload });
  }

  closeWishModal();
  syncPerfumes(() => {
    renderWishCards();
  });
}

export function toggleWishTested(id) {
  const item = cloudWishItems.find(w => String(w.id) === String(id));
  if (item) {
    item.tested = !item.tested;
    syncPerfumes(() => {
      renderWishCards();
    });
  }
}

export function deleteWishItem(id) {
  if (!confirm('이 위시 향수를 목록에서 삭제하시겠습니까?')) return;
  const idx = cloudWishItems.findIndex(w => String(w.id) === String(id));
  if (idx !== -1) {
    cloudWishItems.splice(idx, 1);
    syncPerfumes(() => {
      renderWishCards();
    });
  }
}

// 🌟 위시 ➔ 보유 컬렉션으로 전환
export function convertToOwnedPerfume(id) {
  const wish = cloudWishItems.find(w => String(w.id) === String(id));
  if (!wish) return;

  if (!confirm(`'${wish.brand} - ${wish.name}' 향수를 구매하셨나요?\n보유 컬렉션으로 등록을 진행합니다.`)) return;

  const todayStr = new Date().toISOString().slice(0, 10);

  // 보유 컬렉션으로 새 객체 추가
  const newPerfume = {
    id: 'p_' + Date.now(),
    brand: wish.brand,
    name: wish.name,
    category: wish.category || '기타',
    concentration: 'EDP',
    seasons: ['사계절'],
    capacity: wish.price ? wish.price.replace(/[^0-9mlML]/g, '') || '50ml' : '50ml',
    remain: 100,
    rating: 5,
    buyDate: todayStr,
    store: wish.store || '',
    accords: [],
    notes: '',
    memo: wish.memo ? `[위시리스트에서 전환]\n${wish.memo}` : ''
  };

  cloudPerfumes.unshift(newPerfume);

  // 기존 위시리스트에서는 삭제
  const wishIdx = cloudWishItems.findIndex(w => String(w.id) === String(id));
  if (wishIdx !== -1) cloudWishItems.splice(wishIdx, 1);

  syncPerfumes(() => {
    alert('보유 컬렉션에 등록되었습니다! 향수 컬렉션 탭으로 이동합니다.');
    window.switchMainTab('perfumes');
  });
}
