const STORAGE_KEY = 'scent_archive_v1';

export const DEFAULT_ITEMS = [
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
  },
  {
    id: 'p_2',
    brand: 'Le Labo',
    name: 'Santal 33',
    category: '우디',
    concentration: 'EDP',
    seasons: ['가을', '겨울'],
    capacity: '50ml',
    remain: 80,
    rating: 5,
    buyDate: '2026-01-15',
    store: '이태원 플래그십',
    accords: ['우디', '가죽', '스모키', '스파이시', '아이리스', '파우더리'],
    notes: '바이올렛, 카다멈 / 아이리스, 앰브록스 / 샌달우드, 시더우드, 가죽',
    memo: '처음엔 종이 태우는 듯 스파이시하지만 살에 스며들수록 부드러운 샌달우드 잔향.'
  }
];

function normalizeSeasons(rawSeasons, rawSeason) {
  let list = [];
  if (Array.isArray(rawSeasons)) list = rawSeasons;
  else if (rawSeason) list = [rawSeason];
  else list = ['사계절'];

  const set = new Set();
  list.forEach(s => {
    if (typeof s !== 'string') return;
    if (s.includes('사계절')) { set.add('봄'); set.add('여름'); set.add('가을'); set.add('겨울'); }
    if (s.includes('봄')) set.add('봄');
    if (s.includes('여름')) set.add('여름');
    if (s.includes('가을')) set.add('가을');
    if (s.includes('겨울')) set.add('겨울');
  });
  if (set.size === 0) set.add('봄');
  return Array.from(set);
}

export function loadPerfumes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ITEMS;
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((item, idx) => {
      // 기존 accords가 문자열이거나 비어있을 경우 배열로 변환
      let accordsArr = [];
      if (Array.isArray(item.accords)) accordsArr = item.accords;
      else if (typeof item.accords === 'string') {
        accordsArr = item.accords.split(',').map(s => s.trim()).filter(Boolean);
      }

      return {
        ...item,
        id: item.id ? String(item.id) : `p_${Date.now()}_${idx}`,
        seasons: normalizeSeasons(item.seasons, item.season),
        accords: accordsArr,
        buyDate: item.buyDate || '',
        store: item.store || ''
      };
    });
  } catch (e) {
    console.error('Data parse error:', e);
    return DEFAULT_ITEMS;
  }
}

export function savePerfumes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
