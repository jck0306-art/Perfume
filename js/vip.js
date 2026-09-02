import { cloudVipItems, syncPerfumes } from './firebase.js';
import { escapeHTML } from './security.js';

export function updateVipStats() {
  const badgeEl = document.getElementById('vip-header-badge');
  const countEl = document.getElementById('vip-stat-count');
  const pendingGiftsEl = document.getElementById('vip-stat-pending-gifts');

  if (badgeEl) badgeEl.innerText = cloudVipItems.length;
  if (countEl) countEl.innerText = cloudVipItems.length;

  // 생일 선물이나 바우처 중 아직 받지 않은 항목 개수 합산
  const pendingCount = cloudVipItems.filter(v => 
    (v.giftDesc && !v.giftReceived) || (v.voucherDesc && !v.voucherReceived)
  ).length;

  if (pendingGiftsEl) pendingGiftsEl.innerText = pendingCount;
}

export function renderVipCards() {
  const container = document.getElementById('vip-grid-container');
  if (!container) return;

  updateVipStats();

  if (cloudVipItems.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-slate-500">
        <i class="fa-solid fa-crown text-3xl mb-2 block text-amber-500/40"></i>
        등록된 VIP 멤버십 브랜드가 없습니다. 상단의 'VIP 브랜드 등록' 버튼을 눌러보세요!
      </div>
    `;
    return;
  }

  container.innerHTML = cloudVipItems.map((item, idx) => `
    <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-amber-500/40 transition flex flex-col justify-between space-y-4">
      <div class="space-y-3.5">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">VIP Membership</span>
            <h3 class="text-lg font-black text-white">${escapeHTML(item.brand)}</h3>
          </div>
          <div class="flex items-center gap-1">
            <button onclick="window.openVipModal('${escapeHTML(item.id)}')" class="p-1.5 text-slate-500 hover:text-amber-400 text-xs transition" title="수정">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button onclick="window.deleteVipItem('${escapeHTML(item.id)}')" class="p-1.5 text-slate-500 hover:text-rose-400 text-xs transition" title="삭제">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- 등급 및 매장 배지 -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-crown text-[10px]"></i> ${escapeHTML(item.tier)}
          </span>
          ${item.store ? `
            <span class="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] flex items-center gap-1">
              <i class="fa-solid fa-location-dot text-[10px] text-slate-400"></i> ${escapeHTML(item.store)}
            </span>
          ` : ''}
        </div>

        <!-- 유효기간 및 포인트 -->
        <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
          <div>
            <span class="text-slate-500 block text-[10px]">등급 갱신/유효일</span>
            <span class="font-mono font-semibold text-slate-200">${escapeHTML(item.validDate || '상시')}</span>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px]">보유 포인트/마일리지</span>
            <span class="font-mono font-bold text-amber-400">${escapeHTML(item.points || '-')}</span>
          </div>
        </div>

        <!-- 상시 혜택 안내 -->
        ${item.benefits ? `
          <div class="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/60 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
              <i class="fa-solid fa-star text-amber-400/80 text-[9px]"></i> 상시 VIP 혜택
            </span>
            <p class="text-xs text-slate-300 leading-relaxed">${escapeHTML(item.benefits)}</p>
          </div>
        ` : ''}

        <!-- 🎁 연간 선물 & 바우처 수령 토글 체크리스트 -->
        <div class="space-y-1.5 pt-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">연간 선물 & 바우처 수령 현황</span>
          
          ${item.giftDesc ? `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border ${item.giftReceived ? 'border-emerald-500/30' : 'border-amber-500/30'}">
              <div class="flex items-center gap-2 text-xs">
                <i class="fa-solid fa-cake-candles ${item.giftReceived ? 'text-slate-500' : 'text-amber-400'}"></i>
                <span class="${item.giftReceived ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}">${escapeHTML(item.giftDesc)}</span>
              </div>
              <button onclick="window.toggleVipCheck('${escapeHTML(item.id)}', 'giftReceived')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                item.giftReceived 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40'
              }">
                ${item.giftReceived ? '✓ 수령완료' : '미수령'}
              </button>
            </div>
          ` : ''}

          ${item.voucherDesc ? `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border ${item.voucherReceived ? 'border-emerald-500/30' : 'border-purple-500/30'}">
              <div class="flex items-center gap-2 text-xs">
                <i class="fa-solid fa-ticket ${item.voucherReceived ? 'text-slate-500' : 'text-purple-400'}"></i>
                <span class="${item.voucherReceived ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}">${escapeHTML(item.voucherDesc)}</span>
              </div>
              <button onclick="window.toggleVipCheck('${escapeHTML(item.id)}', 'voucherReceived')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                item.voucherReceived 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-purple-500/20 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/40'
              }">
                ${item.voucherReceived ? '✓ 사용완료' : '미사용'}
              </button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- 메모 푸터 -->
      ${item.memo ? `
        <div class="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
          <i class="fa-regular fa-note-sticky text-slate-500 mt-0.5"></i>
          <span class="leading-relaxed">${escapeHTML(item.memo)}</span>
        </div>
      ` : ''}
    </div>
  `).join('');
}

export function openVipModal(id = null) {
  const modal = document.getElementById('vip-modal');
  const title = document.getElementById('vip-modal-title');
  const formId = document.getElementById('form-vip-id');

  if (id) {
    const item = cloudVipItems.find(v => String(v.id) === String(id));
    if (!item) return;
    title.innerHTML = `<i class="fa-solid fa-crown text-amber-400"></i> VIP 멤버십 수정`;
    formId.value = item.id;
    document.getElementById('form-vip-brand').value = item.brand || '';
    document.getElementById('form-vip-tier').value = item.tier || '';
    document.getElementById('form-vip-store').value = item.store || '';
    document.getElementById('form-vip-valid-date').value = item.validDate || '';
    document.getElementById('form-vip-points').value = item.points || '';
    document.getElementById('form-vip-benefits').value = item.benefits || '';
    document.getElementById('form-vip-gift-desc').value = item.giftDesc || '';
    document.getElementById('form-vip-gift-received').checked = Boolean(item.giftReceived);
    document.getElementById('form-vip-voucher-desc').value = item.voucherDesc || '';
    document.getElementById('form-vip-voucher-received').checked = Boolean(item.voucherReceived);
    document.getElementById('form-vip-memo').value = item.memo || '';
  } else {
    title.innerHTML = `<i class="fa-solid fa-crown text-amber-400"></i> VIP 멤버십 브랜드 등록`;
    formId.value = '';
    document.getElementById('form-vip-brand').value = '';
    document.getElementById('form-vip-tier').value = '';
    document.getElementById('form-vip-store').value = '';
    document.getElementById('form-vip-valid-date').value = '';
    document.getElementById('form-vip-points').value = '';
    document.getElementById('form-vip-benefits').value = '';
    document.getElementById('form-vip-gift-desc').value = '';
    document.getElementById('form-vip-gift-received').checked = false;
    document.getElementById('form-vip-voucher-desc').value = '';
    document.getElementById('form-vip-voucher-received').checked = false;
    document.getElementById('form-vip-memo').value = '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeVipModal() {
  const modal = document.getElementById('vip-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

export function saveVipItem() {
  const editId = document.getElementById('form-vip-id').value;
  const brand = document.getElementById('form-vip-brand').value.trim();
  const tier = document.getElementById('form-vip-tier').value.trim();

  if (!brand || !tier) return alert('브랜드명과 등급은 필수 입력 항목입니다.');

  const store = document.getElementById('form-vip-store').value.trim();
  const validDate = document.getElementById('form-vip-valid-date').value.trim();
  const points = document.getElementById('form-vip-points').value.trim();
  const benefits = document.getElementById('form-vip-benefits').value.trim();
  const giftDesc = document.getElementById('form-vip-gift-desc').value.trim();
  const giftReceived = document.getElementById('form-vip-gift-received').checked;
  const voucherDesc = document.getElementById('form-vip-voucher-desc').value.trim();
  const voucherReceived = document.getElementById('form-vip-voucher-received').checked;
  const memo = document.getElementById('form-vip-memo').value.trim();

  const payload = {
    brand, tier, store, validDate, points, benefits,
    giftDesc, giftReceived, voucherDesc, voucherReceived, memo
  };

  if (editId) {
    const idx = cloudVipItems.findIndex(v => String(v.id) === String(editId));
    if (idx !== -1) {
      cloudVipItems[idx] = { ...cloudVipItems[idx], ...payload };
    }
  } else {
    cloudVipItems.unshift({
      id: 'vip_' + Date.now(),
      ...payload
    });
  }

  closeVipModal();
  syncPerfumes(() => {
    renderVipCards();
  });
}

export function toggleVipCheck(id, field) {
  const item = cloudVipItems.find(v => String(v.id) === String(id));
  if (item) {
    item[field] = !item[field];
    syncPerfumes(() => {
      renderVipCards();
    });
  }
}

export function deleteVipItem(id) {
  if (!confirm('이 VIP 멤버십 정보를 삭제하시겠습니까?')) return;
  const idx = cloudVipItems.findIndex(v => String(v.id) === String(id));
  if (idx !== -1) {
    cloudVipItems.splice(idx, 1);
    syncPerfumes(() => {
      renderVipCards();
    });
  }
}
