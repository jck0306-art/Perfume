export const firebaseConfig = {
  apiKey: "AIzaSyBQ0zSJleSHBjmecj1Qe-kmhLu-GDYXWE8",
  authDomain: "license-mgmt-157ed.firebaseapp.com",
  projectId: "license-mgmt-157ed", 
  storageBucket: "license-mgmt-157ed.firebasestorage.app",
  messagingSenderId: "20449962943",
  appId: "1:20449962943:web:35d36af2eb555d23760f0a"
};

export const DEFAULT_PERFUMES = [
  {
    id: 'p_1',
    brand: '조 말론 런던 (JO MALONE LONDON)',
    name: 'Sea Salt & Bergamot',
    category: '우디',
    concentration: 'EDC',
    seasons: ['봄', '여름', '가을'],
    capacity: '100ml',
    remain: 100,
    rating: 3,
    buyDate: '2026-08-08',
    store: '신세계 강남',
    accords: ['광물', '짠', '감귤류', '나무', '선박', '신선하고 매콤한', '허브', '이끼 낀', '달콤한', '향긋한'],
    notes: '베르가못 / 씨 솔트 / 드리프트우드',
    memo: '첫 느낌 : 음.... 이게 무슨 느낌이지...? 바닷가 수풀 속에 서있는 느낌 (상쾌하지도 싱그럽지도 않은 축축한 소금기 있는 풀향)'
  }
];

let db = null;
let isFirebaseReady = false;

if (window.firebase) {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    isFirebaseReady = true;
  } catch (e) {
    console.error("Firebase Init Error:", e);
  }
}

export let cloudPerfumes = JSON.parse(localStorage.getItem('scent_cloud_data_v1')) || DEFAULT_PERFUMES;

function normalizeItem(item, idx) {
  return {
    ...item,
    id: item.id ? String(item.id) : `p_${Date.now()}_${idx}`,
    accords: Array.isArray(item.accords) ? item.accords : (item.accords ? String(item.accords).split(',').map(s=>s.trim()).filter(Boolean) : []),
    seasons: Array.isArray(item.seasons) ? item.seasons : ['사계절'],
    buyDate: item.buyDate || '',
    store: item.store || ''
  };
}

export function initFirebase(onDataUpdate) {
  cloudPerfumes = cloudPerfumes.map(normalizeItem);

  if (isFirebaseReady) {
    db.collection("perfume_archive").doc("user_collection").onSnapshot((docSnap) => {
      if (docSnap.exists) {
        const data = docSnap.data();
        if (Array.isArray(data.items)) {
          cloudPerfumes = data.items.map(normalizeItem);
        }
      } else {
        db.collection("perfume_archive").doc("user_collection").set({ items: DEFAULT_PERFUMES });
      }

      const statusEl = document.getElementById('cloud-status');
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-solid fa-cloud text-emerald-400"></i> 실시간 클라우드 DB';
        statusEl.className = "text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-mono";
      }
      onDataUpdate();
    }, (error) => {
      console.error("Firestore Error:", error);
      const statusEl = document.getElementById('cloud-status');
      if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-rose-400"></i> DB 연결 오류';
      onDataUpdate();
    });
  } else {
    const statusEl = document.getElementById('cloud-status');
    if (statusEl) {
      statusEl.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 로컬 모드';
      statusEl.className = "text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 font-mono";
    }
    onDataUpdate();
  }
}

export async function syncPerfumes(onRender) {
  cloudPerfumes = cloudPerfumes.map(normalizeItem);
  localStorage.setItem('scent_cloud_data_v1', JSON.stringify(cloudPerfumes));

  const statusEl = document.getElementById('cloud-status');
  if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-arrows-rotate animate-spin text-amber-400"></i> 저장 중...';

  if (isFirebaseReady) {
    try {
      await db.collection("perfume_archive").doc("user_collection").set({ items: cloudPerfumes });
      if (statusEl) {
        statusEl.innerHTML = '<i class="fa-solid fa-cloud text-emerald-400"></i> 클라우드 저장 완료';
      }
    } catch (e) {
      console.error("DB Save Error:", e);
      if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-rose-400"></i> 저장 오류';
    }
  } else {
    if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 로컬 저장됨';
  }

  if (onRender) onRender();
}
